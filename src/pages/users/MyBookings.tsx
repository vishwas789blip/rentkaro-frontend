import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import apiClient from "@/services/api";
import { useAuth } from "@/context/AuthContext"; // Auth context for token state
import { CalendarDays, MapPin, AlertCircle, Loader2, IndianRupee, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Booking {
  _id: string;
  listing?: {
    title: string;
    location: string;
    images?: { url: string }[];
  };
  price: number;
  checkInDate: string;
  checkOutDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export default function MyBookings() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      // 1. Wait for Auth context to finish loading
      if (authLoading) return;
      
      // 2. If no user, show error (prevents 403)
      if (!user) {
        setError("Please login to view your bookings.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Ensure your API service includes the Bearer token in headers
        const res = await apiClient.get("/bookings/my");
        
        // Handle both res.data.data and res.data.bookings structures
        const data = res.data.data || res.data.bookings || [];
        setBookings(data);
      } catch (err: any) {
        console.error("Booking Fetch Error:", err);
        const msg = err.response?.data?.message || "Failed to load bookings.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, authLoading]);

  // Global loading state while checking auth
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-2xl">
                <CalendarDays className="text-emerald-600" size={28} />
              </div>
              My Bookings
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Manage your PG stays and check-in details.</p>
          </div>
          <div className="px-4 py-2 bg-white border rounded-2xl shadow-sm text-sm font-bold text-gray-600">
            Total Stays: {bookings.length}
          </div>
        </header>

        {error ? (
          <div className="bg-red-50 border border-red-100 p-8 rounded-[2.5rem] flex flex-col items-center text-center gap-4">
            <div className="h-14 w-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <AlertCircle size={30} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900">Oops! Something went wrong</h3>
              <p className="text-red-600/80 font-medium">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 w-full bg-gray-100 animate-pulse rounded-[2.5rem]" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed rounded-[3rem] border-gray-100 bg-white shadow-sm">
            <div className="h-20 w-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDays size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No bookings yet</h3>
            <p className="text-gray-500 mt-2">Find your perfect PG and start your journey.</p>
            <button className="mt-6 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 hover:scale-105 transition-transform">
              Browse Listings
            </button>
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
  const statusStyles = {
    confirmed: "bg-emerald-100 text-emerald-700",
    pending: "bg-orange-100 text-orange-700",
    cancelled: "bg-red-100 text-red-700"
  };

  return (
    <div className="group bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300">
      <div className="relative h-44 overflow-hidden">
        <img
          src={booking.listing?.images?.[0]?.url || "https://placehold.co/600x400?text=RentKaroo"}
          alt="PG"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${statusStyles[booking.status] || "bg-gray-100 text-gray-600"}`}>
          {booking.status}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h2 className="font-black text-gray-900 text-lg leading-tight line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {booking.listing?.title || "Luxury PG Stay"}
          </h2>
          <p className="text-gray-400 flex items-center gap-1 text-xs font-bold mt-1">
            <MapPin size={12} className="text-emerald-500" />
            <span className="truncate">{booking.listing?.location}</span>
          </p>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl">
          <DateBox label="Check In" date={booking.checkInDate} />
          <ArrowRight size={14} className="text-gray-300" />
          <DateBox label="Check Out" date={booking.checkOutDate} />
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Paid</span>
            <span className="text-2xl font-black text-gray-900 flex items-center">
              <IndianRupee size={20} /> {booking.price.toLocaleString()}
            </span>
          </div>
          <button className="h-12 w-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-lg shadow-gray-100">
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

const DateBox = ({ label, date }: { label: string; date: string }) => (
  <div className="text-center">
    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">{label}</p>
    <p className="text-xs font-bold text-gray-700">{new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
  </div>
);