import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import MainLayout from "@/layouts/MainLayout";
import { listingAPI, bookingAPI } from "@/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, Users, ArrowLeft, Loader2, Info, CheckCircle2, AlertCircle, IndianRupee } from "lucide-react";

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [numberOfRooms, setNumberOfRooms] = useState(1);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await listingAPI.getById(id);
        // Robust data extraction
        const data = res.data?.data?.listing || res.data?.data || res.data?.listing || res.data;
        if (!data) throw new Error("Listing not found");
        setListing(data);
      } catch (err) {
        toast.error("Failed to load listing details");
        navigate("/listings");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchListing();
  }, [id, navigate]);

  // Logic: Calculate valid stay range (1 Month to 1 Year)
  const stayValidation = useMemo(() => {
    if (!checkInDate || !checkOutDate) return { isValid: false, message: "Select dates to continue" };

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    
    // Min 1 month check
    const minRequired = new Date(start);
    minRequired.setMonth(minRequired.getMonth() + 1);
    
    // Max 1 year check
    const maxAllowed = new Date(start);
    maxAllowed.setFullYear(maxAllowed.getFullYear() + 1);

    if (end < minRequired) return { isValid: false, message: "Minimum stay is 1 month" };
    if (end > maxAllowed) return { isValid: false, message: "Maximum stay is 1 year" };

    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return { isValid: true, message: "Ready to Book", days };
  }, [checkInDate, checkOutDate]);

  const totalAmount = useMemo(() => {
    // We use listing.pricePerMonth or fallback to listing.price to avoid 'undefined'
    const basePrice = listing?.pricePerMonth || listing?.price || 0;
    if (!stayValidation.isValid || !basePrice || !stayValidation.days) return 0;
    
    // Calculation: (Monthly Price / 30) * Days * Rooms
    return Math.round((basePrice / 30) * stayValidation.days * numberOfRooms);
  }, [stayValidation, listing, numberOfRooms]);

  const today = new Date().toISOString().split("T")[0];

const handleBooking = async () => {
  if (!stayValidation.isValid) {
    toast.error(stayValidation.message);
    return;
  }

  try {
    setSubmitting(true);
    // Remove 'price' from here because your backend is throwing a 400 error for it
    await bookingAPI.create({
      pgListingId: id,
      checkInDate,
      checkOutDate,
      numberOfRooms,
    });

    toast.success("Booking request sent successfully!");
    navigate("/dashboard/user");
  } catch (err: any) {
    // This will now catch if any other fields are missing
    toast.error(err?.response?.data?.message || "Booking failed. Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Syncing Inventory...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#FDFDFD] py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-emerald-600 transition-all mb-8 tracking-[0.2em]"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            BACK TO DETAILS
          </button>

          <div className="grid lg:grid-cols-12 gap-12">
            
            {/* LEFT: INPUTS */}
            <div className="lg:col-span-7 space-y-10">
              <section>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 uppercase italic">Reserve Your Spot</h1>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-tight">Lock in your stay. The owner will review and approve your request shortly.</p>
              </section>

              <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm space-y-10">
                <div className="grid sm:grid-cols-2 gap-10">
                  {/* Check-In */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 ml-1">
                      <Calendar size={14} className="text-emerald-600" />
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preferred Move-In</label>
                    </div>
                    <input
                      type="date"
                      min={today}
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 font-black text-slate-800 focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  {/* Check-Out */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 ml-1">
                      <Calendar size={14} className="text-emerald-600" />
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Exit Date</label>
                    </div>
                    <input
                      type="date"
                      min={checkInDate || today}
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className={`w-full bg-slate-50 border rounded-2xl py-5 px-6 font-black text-slate-800 outline-none transition-all ${
                        !stayValidation.isValid && checkOutDate 
                        ? 'border-red-200 ring-8 ring-red-500/5' 
                        : 'border-slate-100 focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Validation Banner */}
                {checkInDate && checkOutDate && (
                  <div className={`flex items-center gap-3 p-5 rounded-3xl border animate-in fade-in slide-in-from-top-2 ${stayValidation.isValid ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                    {stayValidation.isValid ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-[10px] font-black uppercase tracking-widest">{stayValidation.message}</p>
                  </div>
                )}

                <div className="h-[1px] bg-slate-100" />

                {/* Room Selector */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-900 uppercase tracking-tighter">Inventory Count</h4>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">
                      Available: {listing?.rooms?.availableRooms || 1} Units
                    </p>
                  </div>
                  <div className="flex items-center gap-6 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <button
                      onClick={() => setNumberOfRooms(p => Math.max(1, p - 1))}
                      className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center font-black text-slate-600 hover:text-emerald-600 active:scale-90 transition-all"
                    >–</button>
                    <span className="font-black text-xl text-slate-900 w-4 text-center">{numberOfRooms}</span>
                    <button
                      onClick={() => setNumberOfRooms(p => Math.min(listing?.rooms?.availableRooms || 5, p + 1))}
                      className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center font-black text-slate-600 hover:text-emerald-600 active:scale-90 transition-all"
                    >+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: SUMMARY CARD */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900 rounded-[3.5rem] overflow-hidden shadow-2xl sticky top-10">
                <div className="relative h-64">
                  <img
                    src={listing?.images?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80"}
                    alt={listing?.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <div className="absolute top-6 right-6 bg-emerald-500 px-4 py-2 rounded-full shadow-lg">
                    <p className="text-[10px] font-black text-white tracking-widest uppercase">Verified PG</p>
                  </div>
                </div>

                <div className="p-10 space-y-8">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">{listing?.title}</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                       <Users size={12} /> for {listing?.genderType || 'Any'} Residents
                    </p>
                  </div>
                  
                  <div className="space-y-5">
                    <SummaryItem label="Rate Card" value={`₹${(listing?.pricePerMonth || listing?.price || 0).toLocaleString()}/mo`} />
                    <SummaryItem label="Duration" value={`${stayValidation.days || 0} Days`} />
                    <SummaryItem label="Units" value={`x${numberOfRooms} Rooms`} />

                    <div className="pt-8 border-t border-slate-800">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">Checkout Total</p>
                          <h2 className="text-5xl font-black text-white tracking-tighter flex items-center">
                            <IndianRupee size={32} strokeWidth={3} /> {totalAmount.toLocaleString()}
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleBooking}
                    disabled={!stayValidation.isValid || submitting}
                    className={`w-full py-10 rounded-3xl font-black text-lg transition-all ${
                      stayValidation.isValid 
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl shadow-emerald-500/20' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" />
                    ) : stayValidation.isValid ? (
                      "CONFIRM REQUEST"
                    ) : (
                      "SELECT VALID DATES"
                    )}
                  </Button>

                  <p className="text-[9px] font-black text-slate-500 leading-relaxed uppercase tracking-tight text-center px-4">
                    By requesting, you agree to the property terms. Approval is at the owner's discretion.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

const SummaryItem = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">{label}</span>
    <span className="font-black text-white text-sm uppercase">{value}</span>
  </div>
);

export default BookingPage;