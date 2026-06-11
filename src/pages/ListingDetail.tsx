import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo, useRef, lazy, Suspense } from "react";
import MainLayout from "@/layouts/MainLayout";

// FIX 1: Import from correct path — @/services/api not @/api
import { listingAPI, reviewAPI } from "@/api";

import {
  MapPin, Star, Share, Heart, ChevronLeft,
  ShieldCheck, CheckCircle2, Link2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const ImageGallery  = lazy(() => import("../components/listing/ImageGallery"));
const AmenitiesGrid = lazy(() => import("../components/listing/AmenitiesGrid"));
const BookingCard   = lazy(() => import("../components/listing/BookingCard"));
const ReviewForm    = lazy(() => import("../components/listing/ReviewForm"));
const ReviewList    = lazy(() => import("../components/listing/ReviewList"));

import { Review }  from "@/types/review.types";
import { Listing } from "@/types/listing.types";

const ListingDetail = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [listing,          setListing]          = useState<Listing | null>(null);
  const [reviews,          setReviews]          = useState<Review[]>([]);
  const [loading,          setLoading]          = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [saved,            setSaved]            = useState(false);
  const [shareOpen,        setShareOpen]        = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  // ── Fetch reviews ────────────────────────────────────────
  const fetchReviews = async () => {
    try {
      const res = await reviewAPI.getByListing(id);
      // FIX 2: Handle all possible response shapes from backend
      const data =
        res.data?.data?.reviews ||   // { data: { reviews: [] } }
        res.data?.reviews       ||   // { reviews: [] }
        res.data?.data          ||   // { data: [] }
        res.data                ||   // []
        [];
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setReviews([]);
    }
  };

  // ── Fetch listing + reviews ───────────────────────────────
  useEffect(() => {
    if (!id || !/^[a-f\d]{24}$/i.test(id)) return;

    const fetchData = async () => {
      window.scrollTo(0, 0);
      setLoading(true);
      try {
        const listingRes = await listingAPI.getById(id);
        const data =
          listingRes.data?.data?.listing ??
          listingRes.data?.data          ??
          listingRes.data;

        if (!data) throw new Error("Listing not found");

        setListing(data);
        document.title = `${data.title} | RentKaroo`;
        await fetchReviews();
      } catch {
        toast.error("Could not load property details.");
        setListing(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ── Close share dropdown on outside click ────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    if (shareOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [shareOpen]);

  // ── Derived values ────────────────────────────────────────
  const ownerId = useMemo(() => {
    if (!listing?.owner) return null;
    return typeof listing.owner === "object"
      ? (listing.owner._id || listing.owner.id)?.toString()
      : listing.owner?.toString();
  }, [listing]);

  const hostName = useMemo(() => {
    if (!listing?.owner) return "Verified Host";
    return typeof listing.owner === "object"
      ? listing.owner.name || "Verified Host"
      : "Verified Host";
  }, [listing]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) {
      const avg = listing?.rating?.average;
      return avg ? Number(avg).toFixed(1) : "New";
    }
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews, listing]);

  const currentUserId = user?.id ?? null;
  const isOwner = useMemo(
    () => !!(currentUserId && ownerId && currentUserId === ownerId),
    [currentUserId, ownerId]
  );

  // ── Handlers ──────────────────────────────────────────────
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
    setShareOpen(false);
  };

  const handleReviewSubmit = async (reviewData: { rating: number; comment: string }) => {
    if (!isAuthenticated) {
      toast.error("Please login to leave a review");
      return navigate("/login", { state: { from: location.pathname } });
    }

    setSubmittingReview(true);
    try {
      const payload = {
        listingId:  id,        // try standard field first
        rating:     reviewData.rating,
        comment:    reviewData.comment,
      };

      const res = await reviewAPI.create(payload);

      toast.success("Review posted successfully!");

      // FIX 4: Handle all response shapes for new review
      const newReview =
        res.data?.data?.review ||
        res.data?.data         ||
        res.data?.review       ||
        null;

      if (newReview) {
        setReviews(prev => [newReview, ...prev]);
      } else {
        // Fallback: refetch all reviews
        await fetchReviews();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to post review";
      toast.error(msg);
      throw error;
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast.info("Please login to book this property");
      return navigate("/login", { state: { from: location.pathname } });
    }
    if (isOwner) return toast.error("You cannot book your own property!");
    navigate(`/booking/${listing!._id}`);
  };

  // ── Render ────────────────────────────────────────────────
  if (loading) return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0fb478] border-t-transparent" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Loading Property Details
        </p>
      </div>
    </MainLayout>
  );

  if (!listing) return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500 font-semibold">Listing not found.</p>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Top nav */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/listings" className="group flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#0fb478] transition-all uppercase tracking-widest">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Search
          </Link>
          <div className="flex gap-2">
            <div className="relative" ref={shareRef}>
              <button onClick={() => setShareOpen(p => !p)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100">
                <Share size={18} className="text-slate-600" />
              </button>
              {shareOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-lg z-50 overflow-hidden">
                  <button onClick={handleCopyLink} className="w-full flex items-center gap-3 px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all">
                    <Link2 size={15} className="text-[#0fb478]" /> Copy Link
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setSaved(!saved)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border ${
                saved ? "bg-red-50 border-red-100 text-red-600" : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Heart size={16} className={saved ? "fill-red-500" : ""} />
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        {/* Title */}
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

        {/* Gallery */}
        <Suspense fallback={<div className="h-96 bg-slate-100 rounded-3xl animate-pulse" />}>
          <ImageGallery images={listing.images || []} />
        </Suspense>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
          <div className="lg:col-span-8 space-y-16">

            {/* Host */}
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
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Verified RentKaroo Host
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <section>
              <h3 className="text-3xl font-black text-[#1a332e] mb-6 uppercase tracking-tighter">About property</h3>
              <p className="text-slate-600 leading-[1.8] text-lg font-medium whitespace-pre-line">
                {listing.description}
              </p>
            </section>

            {/* Amenities */}
            <section>
              <h3 className="text-3xl font-black text-[#1a332e] mb-8 tracking-tighter uppercase">Amenities</h3>
              <Suspense fallback={<div>Loading...</div>}>
                <AmenitiesGrid amenities={listing.amenities || []} />
              </Suspense>
            </section>

            {/* Reviews */}
            <section className="pt-16 border-t border-slate-100">
              <h3 className="text-3xl font-black text-[#1a332e] mb-10 flex items-center gap-4 uppercase tracking-tighter">
                Reviews <div className="h-2 w-2 rounded-full bg-[#0fb478]" />
              </h3>

              {isAuthenticated && !isOwner && (
                <div className="mb-12">
                  <Suspense fallback={<div>Loading...</div>}>
                    <ReviewForm onSubmit={handleReviewSubmit} submitting={submittingReview} />
                  </Suspense>
                </div>
              )}

              <Suspense fallback={<div>Loading reviews...</div>}>
                <ReviewList reviews={reviews} setReviews={setReviews} />
              </Suspense>
            </section>

          </div>

          {/* Booking sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <Suspense fallback={<div>Loading...</div>}>
                <BookingCard
                  price={listing.pricePerMonth}
                  rating={avgRating}
                  gender={listing.genderType || "Any"}
                  onBook={handleBooking}
                />
              </Suspense>
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