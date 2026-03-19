import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react"; // ← added useRef
import MainLayout from "@/layouts/MainLayout";
import { listingAPI, reviewAPI } from "@/services/api";
import { 
  MapPin, Star, Share, Heart, ChevronLeft, 
  ShieldCheck, CheckCircle2, Link2 // ← added Link2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// Sub-components
import ImageGallery from "../components/listing/ImageGallery";
import AmenitiesGrid from "../components/listing/AmenitiesGrid";
import BookingCard from "../components/listing/BookingCard";
import ReviewForm from "../components/listing/ReviewForm";
import ReviewList from "../components/listing/ReviewList";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false); // ← new state
  const shareRef = useRef<HTMLDivElement>(null);      // ← new ref

  // --- FETCH DATA ---
  const fetchReviews = async () => {
    try {
      const reviewsRes = await reviewAPI.getByListing(id);
      const data = reviewsRes.data?.data?.reviews || reviewsRes.data?.data || [];
      setReviews(data);
    } catch { 
      setReviews([]); 
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      window.scrollTo(0, 0);
      try {
        setLoading(true);
        const listingRes = await listingAPI.getById(id as string);
        const data = listingRes.data?.data?.listing ?? listingRes.data?.data ?? listingRes.data;
        
        if (!data) throw new Error("Listing not found");
        setListing(data);
        document.title = `${data.title} | RentKaroo`;
        await fetchReviews();
      } catch (err) {
        console.error("Fetch Error:", err);
        toast.error("Could not load property details.");
        setListing(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // ← Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    if (shareOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [shareOpen]);

  // --- COMPUTED PROPERTIES ---
  const ownerId = useMemo(() => {
    if (!listing?.owner) return null;
    return typeof listing.owner === 'object' ? (listing.owner._id || listing.owner.id) : listing.owner;
  }, [listing]);

  const hostName = useMemo(() => {
    if (!listing?.owner) return "Verified Host";
    return typeof listing.owner === 'object' 
      ? (listing.owner.name || listing.owner.fullName || "Verified Host") 
      : "Verified Host";
  }, [listing]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return listing?.rating?.average?.toFixed(1) || "New";
    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews, listing]);

  // ← New handler
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
    setShareOpen(false);
  };

  // --- HANDLERS ---
  const handleReviewSubmit = async (reviewData: { rating: number; comment: string }) => {
    if (!isAuthenticated) {
      toast.error("Please login to leave a review");
      return navigate("/login", { state: { from: location.pathname } });
    }
    
    setSubmittingReview(true);
    try {
      const res = await reviewAPI.create({ listingId: id, ...reviewData });
      toast.success("Review posted successfully!");
      const newReview = res.data?.data?.review || res.data?.data;
      if (newReview) {
        setReviews(prev => [newReview, ...prev]);
      } else {
        fetchReviews();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast.info("Please login to book this property");
      return navigate("/login", { state: { from: location.pathname } });
    }
    const currentUserId = user?.id || (user as any)?._id;
    if (currentUserId === ownerId) {
      return toast.error("You cannot book your own property!");
    }
    navigate(`/booking/${listing._id}`);
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
        {/* Navigation & Quick Actions */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/listings" className="group flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#0fb478] transition-all uppercase tracking-widest">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Search
          </Link>
          <div className="flex gap-2">

            {/* ← Share button with dropdown */}
            <div className="relative" ref={shareRef}>
              <button
                onClick={() => setShareOpen(prev => !prev)}
                className="p-3 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100"
              >
                <Share size={18} className="text-slate-600" />
              </button>

              {shareOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-3 px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    <Link2 size={15} className="text-[#0fb478]" />
                    Copy Link
                  </button>
                </div>
              )}
            </div>

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

        {/* Header Title Section */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-[#1a332e] mb-4 tracking-tight leading-tight uppercase">
            {listing.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-[#0fb478] font-bold">
              <MapPin size={18} />
              <span className="text-slate-600 font-medium">
                {listing.address?.city}, {listing.address?.state}
              </span>
            </div>
            <div className="flex items-center gap-1 font-black">
              <Star size={18} className="text-amber-500 fill-amber-500" /> 
              <span className="text-slate-900">{avgRating}</span>
              <span className="text-slate-400 font-bold ml-1">({reviews.length} Reviews)</span>
            </div>
          </div>
        </div>

        <ImageGallery images={listing.images || []} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
          <div className="lg:col-span-8 space-y-16">
            <div className="bg-white p-8 rounded-[2.8rem] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-[2rem] bg-[#0fb478] flex items-center justify-center text-white font-black text-3xl shadow-xl border-4 border-white uppercase">
                  {hostName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-black text-[#1a332e]">Hosted by {hostName}</h2>
                    <CheckCircle2 size={16} className="text-[#0fb478]" />
                  </div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Verified RentKaroo Host</span>
                </div>
              </div>
            </div>

            <section>
              <h3 className="text-3xl font-black text-[#1a332e] mb-6 uppercase tracking-tighter">About property</h3>
              <p className="text-slate-600 leading-[1.8] text-lg font-medium whitespace-pre-line">
                {listing.description}
              </p>
            </section>

            <section>
              <h3 className="text-3xl font-black text-[#1a332e] mb-8 tracking-tighter uppercase">Amenities</h3>
              <AmenitiesGrid amenities={listing.amenities || []} />
            </section>

            <section className="pt-16 border-t border-slate-100">
              <h3 className="text-3xl font-black text-[#1a332e] mb-10 flex items-center gap-4 uppercase tracking-tighter">
                Reviews <div className="h-2 w-2 rounded-full bg-[#0fb478]" />
              </h3>
              {isAuthenticated && user?.id !== ownerId && (
                <div className="mb-12">
                  <ReviewForm onSubmit={handleReviewSubmit} submitting={submittingReview} />
                </div>
              )}
              <ReviewList reviews={reviews} setReviews={setReviews} />
            </section>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <BookingCard 
                price={listing.pricePerMonth} 
                rating={avgRating} 
                gender={listing.genderType || "Any"} 
                onBook={handleBooking} 
              />
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex gap-4">
                <ShieldCheck className="text-[#0fb478] shrink-0" size={24} />
                <div>
                  <p className="text-xs font-black text-[#1a332e] uppercase mb-1">RentKaroo Safe-Stay</p>
                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                    Verified owner and secured transaction guaranteed.
                  </p>
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