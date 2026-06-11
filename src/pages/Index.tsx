import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/layouts/MainLayout";
import ListingCard from "@/components/ListingCard";
import { listingAPI } from "@/api";
import { Search, Shield, Star, Clock, ArrowRight, MapPin, Sparkles } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Easy Search",
    desc: "Find PGs near your college with powerful custom filters.",
  },
  {
    icon: Shield,
    title: "Verified Listings",
    desc: "Every PG is hand-verified for safety and hygiene standards.",
  },
  {
    icon: Star,
    title: "Genuine Reviews",
    desc: "Read real stories from actual residents before you book.",
  },
  {
    icon: Clock,
    title: "Instant Booking",
    desc: "Secure your room instantly with our encrypted payment flow.",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [popularListings, setPopularListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await listingAPI.getAll();
        const data = res.data?.data || res.data || [];
        const safeData = Array.isArray(data) ? data : [];
        const sorted = [...safeData].sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        setPopularListings(sorted.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch listings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  return (
    <MainLayout>
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-[#f9fbfb]">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#e0f2ec] rounded-l-[10rem] hidden lg:block" />
        
        <div className="container relative mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 bg-white border border-[#e0f2ec] px-4 py-2 rounded-full shadow-sm">
              <Sparkles className="h-4 w-4 text-[#0fb478]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#1a332e]">Your comfort, our priority</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-[#1a332e] leading-[1.1] tracking-tighter">
              Find Your <br />
              Next <span className="text-[#0fb478]">Premium</span> <br />
              PG Stay.
            </h1>

            <p className="text-lg text-[#4a635d] font-medium max-w-lg leading-relaxed">
              Skip the brokers. Discover verified, affordable, and high-quality 
              accommodations in the heart of Ghaziabad and beyond.
            </p>

            {/* Mock Search Bar UI */}
            
          </div>

          {/* Hero Image / Illustration Area */}
          <div className="relative hidden lg:block animate-in fade-in zoom-in-95 duration-1000">
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
              <img
                src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=1200"
                alt="Modern Living Space"
                className="w-full h-[600px] object-cover"
              />
            </div>
            {/* Floating Experience Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-[2rem] shadow-xl border border-[#e0f2ec] z-20">
              <p className="text-4xl font-black text-[#1a332e]">500+</p>
              <p className="text-xs font-bold text-[#4a635d] uppercase tracking-widest">Verified PGs</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="bg-white py-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div className="max-w-xl space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0fb478]">Our Advantages</h2>
              <h3 className="text-4xl font-black text-[#1a332e]">Why RentKaroo is different.</h3>
            </div>
            <p className="text-[#4a635d] font-medium max-w-sm">
              We focus on transparency and trust, ensuring every listing meets our strict quality guidelines.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group p-8 rounded-[2.5rem] border border-[#f0f9f6] bg-[#fcfdfd] transition-all duration-500 hover:shadow-2xl hover:shadow-[#0fb478]/5 hover:-translate-y-2"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm text-[#0fb478] group-hover:bg-[#0fb478] group-hover:text-white transition-all duration-500">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-black text-[#1a332e]">{title}</h3>
                <p className="mt-3 text-sm font-medium text-[#4a635d] leading-relaxed italic">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= POPULAR LISTINGS ================= */}
      <section className="bg-[#f0f9f6] py-32 rounded-[4rem] mx-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-[#1a332e]">Popular Stays</h2>
              <p className="text-[#4a635d] font-bold">Top-rated by your peers in Ghaziabad.</p>
            </div>
            <Button
              variant="link"
              className="text-[#0fb478] font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:no-underline"
              onClick={() => navigate("/listings")}
            >
              View All Listings <ArrowRight size={16} />
            </Button>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              [1, 2, 3].map((i) => <div key={i} className="h-80 bg-gray-200/50 animate-pulse rounded-[2.5rem]" />)
            ) : (
              popularListings.map((l) => <ListingCard key={l._id} listing={l} />)
            )}
          </div>
        </div>
      </section>

      {/* ================= OWNER CTA ================= */}
      <section className="container mx-auto px-6 py-32">
        <div className="relative overflow-hidden rounded-[4rem] bg-[#1a332e] p-12 md:p-24 text-center">
          {/* Subtle decorative circle */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
              List Your Property. <br />
              Reach Thousands.
            </h2>
            <p className="text-emerald-100/70 text-lg font-medium">
              Join our network of elite PG owners and maximize your occupancy rates 
              with our dedicated owner dashboard.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button
                size="lg"
                className="bg-[#0fb478] hover:bg-white hover:text-[#0fb478] rounded-2xl px-10 font-black h-14 transition-all"
                onClick={() => navigate("/register")}
              >
                Register as Owner
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;