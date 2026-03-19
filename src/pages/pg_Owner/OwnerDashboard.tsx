import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { listingAPI, bookingAPI } from "@/services/api";
import { IndianRupee, MapPin, Calendar, Plus, LayoutGrid, CheckCircle2, XCircle, ArrowUpRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lRes, bRes] = await Promise.all([
          listingAPI.getOwnerListings(),
          bookingAPI.getOwnerBookings()
        ]);
        setListings(lRes.data?.data || []);
        setBookings(bRes.data?.data || []);
      } catch (err) {
        console.error("Data Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      if (status === 'approved') {
        await bookingAPI.approve(id);
        toast.success("Booking Secured");
      } else {
        // Assume your API has a reject or update endpoint
        // await bookingAPI.updateStatus(id, status); 
        toast.error(`Booking ${status}`);
      }
      // Refresh local state
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
    } catch (err) {
      toast.error("Action Failed");
    }
  };

  const totalRevenue = bookings
    .filter((b) => ["confirmed", "approved"].includes(b.status))
    .reduce((sum, b) => sum + (Number(b.totalPrice) || Number(b.price) || 0), 0);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8 font-sans text-slate-900">
        
        {/* HEADER SECTION */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight uppercase italic leading-none">
              Console<span className="text-emerald-500">.</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Portfolio Manager / {user?.name}
            </p>
          </div>
          <Button className="w-full md:w-auto h-11 px-6 bg-slate-950 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-600 transition-all shadow-lg active:scale-95">
            Add Property <Plus size={14} className="ml-2" strokeWidth={3} />
          </Button>
        </div>

        {/* BENTO STATS GRID */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-5 mb-12">
          
          {/* Revenue Card */}
          <div className="md:col-span-8 bg-white border border-slate-100 rounded-[2rem] p-6 md:p-10 shadow-sm flex flex-col justify-between group">
             <div className="flex justify-between items-center">
                <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100"><IndianRupee size={18} strokeWidth={2.5}/></span>
                <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase italic">
                   <ArrowUpRight size={12} /> Live Performance
                </div>
             </div>
             <div className="mt-6 md:mt-8">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Gross Payout</p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic text-slate-900 mt-1">
                  ₹{(totalRevenue || 0).toLocaleString('en-IN')}
                </h2>
             </div>
          </div>

          {/* Active Units Card */}
          <div className="md:col-span-4 bg-[#f1fdf9] border border-emerald-100 rounded-[2rem] p-6 md:p-10 flex flex-col justify-between relative overflow-hidden group">
             <LayoutGrid className="absolute -right-2 -bottom-2 h-24 w-24 text-emerald-200/40 group-hover:rotate-12 transition-transform duration-700" strokeWidth={1}/>
             <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest z-10">Active Units</p>
             <h2 className="text-7xl md:text-8xl font-black tracking-tighter text-emerald-900 z-10 leading-none">{listings.length}</h2>
          </div>
        </div>

        {/* FEED SECTION */}
        <div className="max-w-6xl mx-auto space-y-5">
          <div className="flex items-center gap-4 px-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] whitespace-nowrap">Incoming Requests</h3>
            <div className="h-[1px] w-full bg-slate-100" />
          </div>

          <div className="grid gap-3">
            {bookings.length > 0 ? bookings.map((b) => (
              <div key={b._id} className="group bg-white border border-slate-100 rounded-[2rem] p-3 md:p-4 flex flex-col md:flex-row items-center gap-5 hover:border-emerald-200 hover:shadow-xl transition-all duration-500">
                
                {/* 1. PROPERTY IMAGE (REAL) */}
                <div className="w-full md:w-44 h-32 md:h-28 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0">
                  <img 
                    src={b.pgListing?.images?.[0]?.url || b.listing?.images?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=400"} 
                    alt="Property" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                </div>

                {/* 2. DETAILS */}
                <div className="flex-1 w-full space-y-1 text-center md:text-left">
                  <div className="flex justify-center md:justify-start items-center gap-2 mb-1">
                    <div className={`h-1.5 w-1.5 rounded-full ${b.status === 'pending' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{b.status}</span>
                  </div>
                  <h4 className="text-lg md:text-xl font-black text-slate-900 uppercase italic tracking-tight leading-none group-hover:text-emerald-600 transition-colors">
                    {b.pgListing?.title || b.listing?.title || "Residential Unit"}
                  </h4>
                  <div className="flex justify-center md:justify-start gap-4 mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                     <span className="flex items-center gap-1"><MapPin size={10} className="text-emerald-500" /> {b.pgListing?.location || "India"}</span>
                     <span className="flex items-center gap-1"><Calendar size={10} className="text-emerald-500" /> {new Date(b.checkInDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* 3. PAYOUT & ACTIONS */}
                <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6 p-3 md:p-0 md:pl-6 md:border-l border-slate-50">
                   <div className="text-left md:text-right">
                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Estimated Payout</p>
                      <p className="text-xl font-black text-slate-900 leading-none italic">₹{(b.totalPrice || 0).toLocaleString('en-IN')}</p>
                   </div>
                   
                   <div className="flex gap-2">
                     {b.status === 'pending' ? (
                       <>
                         <button 
                           onClick={() => handleStatusUpdate(b._id, 'approved')}
                           title="Approve"
                           className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center border border-emerald-100"
                         >
                           <CheckCircle2 size={18} strokeWidth={2.5} />
                         </button>
                         <button 
                           onClick={() => handleStatusUpdate(b._id, 'rejected')}
                           title="Reject"
                           className="h-10 w-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100"
                         >
                           <XCircle size={18} strokeWidth={2.5} />
                         </button>
                       </>
                     ) : (
                       <button className="h-10 w-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 hover:bg-slate-50 hover:text-emerald-600 transition-all">
                          <ArrowUpRight size={18} />
                       </button>
                     )}
                   </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No incoming requests currently</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;