import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import MainLayout from "@/layouts/MainLayout";
import { listingAPI, bookingAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, Users, ArrowLeft, Loader2, Info, CheckCircle2, AlertCircle } from "lucide-react";

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
        const data = res.data?.data?.listing || res.data?.data || res.data;
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
    
    const minRequired = new Date(start);
    minRequired.setMonth(minRequired.getMonth() + 1);
    
    const maxAllowed = new Date(start);
    maxAllowed.setFullYear(maxAllowed.getFullYear() + 1);

    if (end < minRequired) return { isValid: false, message: "Minimum stay is 1 month" };
    if (end > maxAllowed) return { isValid: false, message: "Maximum stay is 1 year" };

    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return { isValid: true, message: "Valid duration", days };
  }, [checkInDate, checkOutDate]);

  const totalAmount = useMemo(() => {
    if (!stayValidation.isValid || !listing || !stayValidation.days) return 0;
    // Calculation: (Monthly Price / 30) * Days * Rooms
    return Math.round((listing.pricePerMonth / 30) * stayValidation.days * numberOfRooms);
  }, [stayValidation, listing, numberOfRooms]);

  const today = new Date().toISOString().split("T")[0];

  const handleBooking = async () => {
    if (!stayValidation.isValid) {
      toast.error(stayValidation.message);
      return;
    }

    try {
      setSubmitting(true);
      await bookingAPI.create({
        pgListingId: id,
        checkInDate,
        checkOutDate,
        numberOfRooms,
      });

      toast.success("Booking request sent successfully!");
      navigate("/dashboard/user");
    } catch (err: any) {
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
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Preparing your stay...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-emerald-600 transition-all mb-8 tracking-[0.2em]"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            RETURN TO EXPLORE
          </button>

          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* LEFT: INPUTS */}
            <div className="lg:col-span-7 space-y-8">
              <section>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Reserve Space</h1>
                <p className="text-slate-500 font-medium">Complete your details to send a booking request to the owner.</p>
              </section>

              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-8">
                <div className="grid sm:grid-cols-2 gap-8">
                  {/* Check-In */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 ml-1">
                      <Calendar size={14} className="text-emerald-600" />
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Move-In Date</label>
                    </div>
                    <input
                      type="date"
                      min={today}
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  {/* Check-Out */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 ml-1">
                      <Calendar size={14} className="text-emerald-600" />
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Move-Out Date</label>
                    </div>
                    <input
                      type="date"
                      // Min logic: 1 month after check-in
                      min={checkInDate ? (() => {
                        const d = new Date(checkInDate);
                        d.setMonth(d.getMonth() + 1);
                        return d.toISOString().split("T")[0];
                      })() : today}
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className={`w-full bg-slate-50 border rounded-2xl py-4 px-5 font-bold outline-none transition-all ${
                        !stayValidation.isValid && checkOutDate 
                        ? 'border-red-200 ring-4 ring-red-500/5' 
                        : 'border-slate-100 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Validation Banner */}
                {checkInDate && checkOutDate && (
                  <div className={`flex items-center gap-3 p-4 rounded-2xl border ${stayValidation.isValid ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                    {stayValidation.isValid ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-xs font-black uppercase tracking-wider">{stayValidation.message}</p>
                  </div>
                )}

                <hr className="border-slate-100" />

                {/* Room Selector */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-900">Total Rooms</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available: {listing?.rooms?.availableRooms || 1}</p>
                  </div>
                  <div className="flex items-center gap-6 bg-slate-100 p-2 rounded-2xl">
                    <button
                      onClick={() => setNumberOfRooms(p => Math.max(1, p - 1))}
                      className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-slate-600 hover:text-emerald-600 transition-colors"
                    >–</button>
                    <span className="font-black text-lg text-slate-900">{numberOfRooms}</span>
                    <button
                      onClick={() => setNumberOfRooms(p => Math.min(listing?.rooms?.availableRooms || 1, p + 1))}
                      className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-slate-600 hover:text-emerald-600 transition-colors"
                    >+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: SUMMARY CARD */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 sticky top-10">
                <div className="relative h-56">
                  <img
                    src={listing.images?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80"}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm">
                    <p className="text-[10px] font-black text-emerald-600 tracking-widest uppercase">Verified Property</p>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-black text-slate-900 mb-6">{listing.title}</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Base Rent (Monthly)</span>
                      <span className="font-black text-slate-900">₹{listing.pricePerMonth?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Stay Duration</span>
                      <span className="font-black text-slate-900">{stayValidation.days || 0} Days</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Room Multiplier</span>
                      <span className="font-black text-slate-900">x{numberOfRooms}</span>
                    </div>

                    <div className="pt-6 border-t border-dashed border-slate-200">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Total Estimated</p>
                          <h2 className="text-4xl font-black text-slate-900">₹{totalAmount.toLocaleString()}</h2>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleBooking}
                    disabled={!stayValidation.isValid || submitting}
                    className={`w-full py-8 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-600/20 ${
                      stayValidation.isValid 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" /> REQUESTING...
                      </div>
                    ) : stayValidation.isValid ? (
                      "SEND BOOKING REQUEST"
                    ) : (
                      "CHECK DATES"
                    )}
                  </Button>

                  <div className="mt-8 flex gap-3 p-4 bg-slate-50 rounded-2xl">
                    <Info size={18} className="text-slate-400 shrink-0" />
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
                      Note: This is a booking request. The owner will review your request and contact you for payment after approval.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BookingPage;