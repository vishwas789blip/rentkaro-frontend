import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import MainLayout from "@/layouts/MainLayout";
import { listingAPI, reviewAPI } from "@/services/api";
import { 
  MapPin, Star, Share, Heart, ChevronLeft, 
  ShieldCheck, MessageCircle, User as UserIcon, CheckCircle2,
  Phone, Info
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// Sub-components (Assuming these exist in your project)
import ImageGallery from "../components/listing/ImageGallery";
import AmenitiesGrid from "../components/listing/AmenitiesGrid";
import BookingCard from "../components/listing/BookingCard";
import ReviewForm from "../components/listing/ReviewForm";
import ReviewList from "../components/listing/ReviewList";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [saved, setSaved] = useState(false);

  // --- FETCH DATA ---
  const fetchReviews = async () => {
    try {
      const reviewsRes = await reviewAPI.getByListing(id);
      setReviews(reviewsRes.data?.data || []);
    } catch { setReviews([]); }
  };

  useEffect(() => {
    const fetchData = async () => {
      window.scrollTo(0, 0);
      try {
        const listingRes = await listingAPI.getById(id);
        // Robust data extraction based on your API structure
        const data = listingRes.data?.data?.listing ?? listingRes.data?.data ?? listingRes.data;
        
        if (!data) throw new Error("Listing not found");
        setListing(data);
        document.title = `${data.title} | RentKaroo`;
        fetchReviews();
      } catch (err) {
        console.error("Fetch Error:", err);
        setListing(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // --- COMPUTED PROPERTIES ---
  
  // 1. Logic to handle the 'name' field from your Auth system
  const hostName = useMemo(() => {
    const owner = listing?.owner;
    if (!owner) return "Verified Host";
    return typeof owner === 'object' 
      ? (owner.name || owner.fullName || "Verified Host") 
      : "Verified Host";
  }, [listing]);

  // 2. Logic to safely get the Owner's ID for comparison
  const ownerId = useMemo(() => {
    if (!listing?.owner) return null;
    return typeof listing.owner === 'object' ? (listing.owner._id || listing.owner.id) : listing.owner;
  }, [listing]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return listing?.rating?.average || "New";
    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews, listing]);

  // --- HANDLERS ---
  const handleBooking = () => {
    if (!isAuthenticated) {
      toast.info("Please login to book this property");
      return navigate("/login");
    }

    // Check if the current logged-in user is the owner
    // Standardizing IDs for comparison (handling both .id and ._id)
    const currentUserId = user?.id || (user as any)?._id;
    
    if (currentUserId === ownerId) {
      return toast.error("You cannot book your own property!");
    }
    
    navigate(`/booking/${listing._id}`);
  };

  const handleContactHost = () => {
    if (typeof listing.owner === 'object' && listing.owner.phone) {
      window.location.href = `tel:${listing.owner.phone}`;
    } else {
      toast.info("Contact details will be shared once you initiate a booking.");
    }
  };

  if (loading) return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0fb478] border-t-transparent" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Property Details</p>
      </div>
    </MainLayout>
  );

  if (!listing) return (
    <MainLayout>
      <div className="text-center py-32">
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Property Not Found</h2>
        <Link to="/listings" className="text-[#0fb478] font-black uppercase text-xs tracking-widest hover:underline">Return to Search</Link>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation & Actions */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/listings" className="group flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#0fb478] transition-all uppercase tracking-widest">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Search
          </Link>
          <div className="flex gap-2">
            <button className="p-3 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100">
              <Share size={18} className="text-slate-600" />
            </button>
            <button 
              onClick={() => setSaved(!saved)} 
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border ${
                saved ? 'bg-red-50 border-red-100 text-red-600' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Heart size={16} className={saved ? "fill-red-500" : ""} /> {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        {/* Title Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-black text-[#1a332e] mb-4 tracking-tight leading-tight uppercase">
            {listing.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-[#0fb478] font-bold">
              <MapPin size={18} />
              <span className="text-slate-600">{listing.address?.city}, {listing.address?.state}</span>
            </div>
            <div className="h-1 w-1 bg-slate-300 rounded-full" />
            <div className="flex items-center gap-1 font-black">
              <Star size={18} className="text-amber-500 fill-amber-500" /> 
              <span className="text-slate-900">{avgRating}</span>
              <span className="text-slate-400 font-bold ml-1">({reviews.length} Reviews)</span>
            </div>
          </div>
        </div>

        <ImageGallery images={listing.images} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mt-12">
          <div className="lg:col-span-8 space-y-16">
            
            {/* --- HOST SECTION --- */}
            <div className="relative p-1 bg-gradient-to-r from-[#0fb478]/10 to-transparent rounded-[3rem]">
              <div className="bg-white p-8 rounded-[2.8rem] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-[2rem] bg-[#0fb478] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-[#0fb478]/20 border-4 border-white uppercase">
                      {hostName.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-[#0fb478] border-4 border-white rounded-full" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-black text-[#1a332e] tracking-tight">Hosted by {hostName}</h2>
                      <div className="bg-emerald-100 p-1 rounded-full">
                        <CheckCircle2 size={14} className="text-[#0fb478]" />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold text-slate-500">
                      <span className="flex items-center gap-1.5"><UserIcon size={14} className="text-slate-400" /> Verified Host</span>
                      <span className="hidden sm:block h-1 w-1 bg-slate-300 rounded-full" />
                      <span className="text-[#0fb478] uppercase text-[10px] tracking-widest font-black italic">Instant Reply</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleContactHost}
                  className="bg-[#1a332e] text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  <Phone size={18} /> Contact Host
                </button>
              </div>
            </div>

            {/* Description */}
            <section>
              <h3 className="text-3xl font-black text-[#1a332e] mb-6 uppercase tracking-tighter">About the property</h3>
              <p className="text-slate-600 leading-[1.8] text-lg font-medium whitespace-pre-line">
                {listing.description}
              </p>
            </section>

            {/* Amenities */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-black text-[#1a332e] tracking-tighter uppercase">Amenities</h3>
                <span className="text-[10px] font-black text-[#0fb478] bg-emerald-50 px-4 py-2 rounded-full uppercase tracking-widest">Premium Service</span>
              </div>
              <AmenitiesGrid amenities={listing.amenities || []} />
            </section>

            {/* Reviews */}
            <section className="pt-16 border-t border-slate-100">
              <h3 className="text-3xl font-black text-[#1a332e] mb-10 flex items-center gap-4 uppercase tracking-tighter">
                Reviews
                <div className="h-2 w-2 rounded-full bg-[#0fb478]" />
              </h3>
              
              {/* Only allow reviews if logged in and NOT the owner */}
              {isAuthenticated && (user?.id !== ownerId && (user as any)?._id !== ownerId) && (
                <div className="mb-12">
                   <ReviewForm onSubmit={handleReviewSubmit} submitting={submittingReview} />
                </div>
              )}
              
              <ReviewList reviews={reviews} />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24">
              <BookingCard 
                price={listing.pricePerMonth} 
                rating={avgRating} 
                gender={listing.genderType} 
                onBook={handleBooking} 
              />
              <div className="mt-8 flex items-start gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <ShieldCheck className="text-[#0fb478] shrink-0" size={24} />
                <div>
                  <p className="text-xs font-black text-[#1a332e] uppercase tracking-tight mb-1">RentKaroo Safe-Stay</p>
                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">Verified owner and secured transaction guaranteed for this property.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
};

export default ListingDetail;