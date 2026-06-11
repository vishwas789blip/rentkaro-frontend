import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { bookingAPI } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { CalendarDays, MapPin, AlertCircle, Loader2, IndianRupee, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Booking {
  _id: string;
  pgListing?: { title: string; address?: { city: string }; images?: { url: string }[] };
  totalPrice: number;
  checkInDate: string;
  checkOutDate: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
}

export default function MyBookings() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    // FIX: authLoading dependency hataya — AuthContext ab false se start hota hai
    // user check karo directly
    if (!user) {
      setError("Please login to view your bookings.");
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const res  = await bookingAPI.getMyBookings();
        const data = res.data?.data?.bookings || res.data?.data || res.data?.bookings || [];
        setBookings(Array.isArray(data) ? data : []);
      } catch (err: any) {
        const msg = err.response?.data?.message || "Failed to load bookings.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
              <div className="p-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                <CalendarDays className="text-emerald-600" size={28} />
              </div>
              My Bookings
            </h1>
            <p className="text-slate-500 mt-2 font-bold text-sm uppercase tracking-wide">
              Manage your PG stays and check-in details.
            </p>
          </div>
          {!loading && !error && (
            <div className="px-5 py-2.5 bg-white border border-slate-100 rounded-2xl shadow-sm text-xs font-black text-slate-600 uppercase tracking-widest">
              Total Stays: {bookings.length}
            </div>
          )}
        </header>

        {error ? (
          <div className="bg-red-50 border border-red-100 p-12 rounded-[3rem] flex flex-col items-center text-center gap-6">
            <div className="h-16 w-16 bg-white text-red-600 rounded-3xl flex items-center justify-center shadow-sm">
              <AlertCircle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-red-900 uppercase">Connection Error</h3>
              <p className="text-red-600/80 font-bold text-sm mt-1">{error}</p>
            </div>
            <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-2xl font-black uppercase tracking-widest text-xs">
              Retry Connection
            </Button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[420px] w-full bg-slate-50 animate-pulse rounded-[2.5rem] border border-slate-100" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed rounded-[3.5rem] border-slate-100 bg-white shadow-sm">
            <div className="h-24 w-24 bg-slate-50 text-slate-200 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
              <CalendarDays size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">No bookings yet</h3>
            <p className="text-slate-400 mt-2 font-bold uppercase text-xs tracking-widest">Your future stays will appear here.</p>
            <Link to="/listings">
              <button className="mt-8 px-10 py-4 bg-[#1a332e] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all active:scale-95">
                Browse Listings
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const navigate = useNavigate();
  const statusStyles: Record<string, string> = {
    approved:  "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending:   "bg-amber-100 text-amber-700 border-amber-200",
    rejected:  "bg-red-100 text-red-700 border-red-200",
    cancelled: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <div className="group bg-white rounded-[2.8rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:border-emerald-200 transition-all duration-500">
      <div className="relative h-48 overflow-hidden">
        <img
          src={booking.pgListing?.images?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80"}
          alt="PG"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className={`absolute top-5 right-5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md border ${statusStyles[booking.status] || "bg-slate-100 text-slate-600"}`}>
          {booking.status}
        </div>
      </div>
      <div className="p-7 space-y-5">
        <div>
          <h2 className="font-black text-slate-900 text-xl leading-tight line-clamp-1 uppercase tracking-tight">
            {booking.pgListing?.title || "Premium PG Residency"}
          </h2>
          <p className="text-slate-400 flex items-center gap-1.5 text-xs font-bold mt-2 uppercase tracking-wide">
            <MapPin size={14} className="text-emerald-500" />
            {booking.pgListing?.address?.city || "Location on confirmation"}
          </p>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-[1.8rem] border border-slate-100">
          <DateBox label="Check In"  date={booking.checkInDate} />
          <div className="h-8 w-[1px] bg-slate-200" />
          <DateBox label="Check Out" date={booking.checkOutDate} />
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</span>
            <span className="text-2xl font-black text-slate-900 flex items-center tracking-tighter">
              <IndianRupee size={18} strokeWidth={3} />
              {(booking.totalPrice || 0).toLocaleString("en-IN")}
            </span>
          </div>
          <button
            onClick={() => navigate(`/booking-details/${booking._id}`)}
            className="h-14 w-14 bg-[#1a332e] text-white rounded-[1.2rem] flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg active:scale-90"
          >
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

const DateBox = ({ label, date }: { label: string; date: string }) => {
  const d = new Date(date);
  const isValid = !isNaN(d.getTime());
  return (
    <div className="text-center px-2">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-black text-slate-800 uppercase">
        {isValid ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "---"}
      </p>
    </div>
  );
};