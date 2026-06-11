import { useState, useEffect, useMemo } from "react";
import MainLayout from "@/layouts/MainLayout";
import ListingCard from "@/components/ListingCard";
import SkeletonCard from "@/components/SkeletonCard";
import { listingAPI } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, SlidersHorizontal, X, MapPin, Wallet, 
  RotateCcw, Wifi, Wind, Car, Waves, Dumbbell, ShieldCheck, UtensilsCrossed 
} from "lucide-react";

const locations = ["All", "Ghaziabad", "Delhi", "Noida"];

const priceRanges = [
  { label: "All", min: 0, max: Infinity },
  { label: "Under ₹7,000", min: 0, max: 6999 },
  { label: "₹7,000 - ₹10,000", min: 7000, max: 10000 },
  { label: "Above ₹10,000", min: 10001, max: Infinity },
];

const amenityList = [
  { id: "wifi", label: "WiFi", icon: <Wifi size={14} /> },
  { id: "ac", label: "AC", icon: <Wind size={14} /> },
  { id: "parking", label: "Parking", icon: <Car size={14} /> },
  { id: "laundry", label: "Laundry", icon: <Waves size={14} /> },
  { id: "gym", label: "Gym", icon: <Dumbbell size={14} /> },
  { id: "security", label: "Security", icon: <ShieldCheck size={14} /> },
  { id: "kitchen", label: "Kitchen", icon: <UtensilsCrossed size={14} /> },
];

const Listings = () => {
  const [search, setSearch] = useState("");
  const [locFilter, setLocFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await listingAPI.getAll();
      
      // Based on your JSON: res.data.data.listings
      const listingsData = res.data?.data?.listings || [];
      
      setListings(listingsData);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchListings();
}, []);

  // Filter Logic wrapped in useMemo for performance
  const filtered = useMemo(() => {
    return listings.filter((l) => {
      // 1. Normalize Data
      const city = (l.address?.city || "").trim().toLowerCase();
      const title = (l.title || "").trim().toLowerCase();
      const price = Number(l.pricePerMonth) || 0;
      const listingAmenities = l.amenities || [];
      const searchTerm = search.toLowerCase().trim();

      // 2. Search Filter
      const matchesSearch = !searchTerm || 
        title.includes(searchTerm) || 
        city.includes(searchTerm);

      // 3. Location Filter
      const matchesLoc =
        locFilter === "All" ||
        city.includes(locFilter.toLowerCase());

      // 4. Price Filter
      const range = priceRanges.find(r => r.label === priceFilter);
      const matchesPrice = range ? (price >= range.min && price <= range.max) : true;

      // 5. Amenities Filter (Must have ALL selected)
      const matchesAmenities = selectedAmenities.length === 0 || 
        selectedAmenities.every(amenity => 
          listingAmenities.some((a: string) => a.toLowerCase() === amenity.toLowerCase())
        );

      return matchesSearch && matchesLoc && matchesPrice && matchesAmenities;
    });
  }, [listings, search, locFilter, priceFilter, selectedAmenities]);

  const handleReset = () => {
    setSearch("");
    setLocFilter("All");
    setPriceFilter("All");
    setSelectedAmenities([]);
  };

  const FilterPanel = () => (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-4 text-[#1a332e]">
          <MapPin size={16} className="text-[#0fb478]" />
          <Label className="text-sm font-black uppercase tracking-wider">Location</Label>
        </div>
        <div className="flex flex-wrap gap-2">
          {locations.map((loc) => (
            <button
              key={loc}
              onClick={() => setLocFilter(loc)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                locFilter === loc
                  ? "bg-[#0fb478] text-white border-[#0fb478] shadow-md shadow-[#0fb478]/20"
                  : "bg-white text-[#4a635d] border-[#e0f2ec] hover:border-[#0fb478]"
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4 text-[#1a332e]">
          <Wallet size={16} className="text-[#0fb478]" />
          <Label className="text-sm font-black uppercase tracking-wider">Budget</Label>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {priceRanges.map((p) => (
            <button
              key={p.label}
              onClick={() => setPriceFilter(p.label)}
              className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                priceFilter === p.label
                  ? "bg-[#f0f9f6] text-[#0fb478] border-[#0fb478]"
                  : "bg-white text-[#4a635d] border-[#e0f2ec] hover:border-[#0fb478]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4 text-[#1a332e]">
          <ShieldCheck size={16} className="text-[#0fb478]" />
          <Label className="text-sm font-black uppercase tracking-wider">Amenities</Label>
        </div>
        <div className="flex flex-wrap gap-2">
          {amenityList.map((amenity) => (
            <button
              key={amenity.id}
              onClick={() => {
                setSelectedAmenities(prev => 
                  prev.includes(amenity.id) ? prev.filter(a => a !== amenity.id) : [...prev, amenity.id]
                );
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                selectedAmenities.includes(amenity.id)
                  ? "bg-[#0fb478] text-white border-[#0fb478]"
                  : "bg-white text-[#4a635d] border-[#e0f2ec] hover:border-[#0fb478]"
              }`}
            >
              {amenity.icon}
              {amenity.label}
            </button>
          ))}
        </div>
      </div>

      <Button
        variant="ghost"
        className="w-full justify-start text-red-500 font-bold hover:bg-red-50 hover:text-red-600 rounded-xl mt-4"
        onClick={handleReset}
      >
        <RotateCcw className="mr-2 h-4 w-4" /> Reset Filters
      </Button>
    </div>
  );

  return (
    <MainLayout>
      <div className="bg-[#fcfcfc] min-h-screen">
        <div className="bg-white border-b border-[#e0f2ec] py-8">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-3 max-w-3xl">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0fb478]" size={20} />
                <Input
                  placeholder="Search by PG name, city, or landmark..."
                  className="pl-12 h-14 rounded-2xl border-[#e0f2ec] focus:ring-[#0fb478] bg-[#f9fbfb]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                className="h-14 px-6 lg:hidden bg-[#1a332e] rounded-2xl"
                onClick={() => setShowFilters(true)}
              >
                <SlidersHorizontal className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-10">
          <div className="flex gap-12">
            <aside className="hidden lg:block w-72 shrink-0 sticky top-28 h-fit bg-white border border-[#e0f2ec] rounded-[2.5rem] p-8 shadow-sm">
              <h2 className="text-xl font-black text-[#1a332e] mb-8">Refine Stay</h2>
              <FilterPanel />
            </aside>

            <div className="flex-1">
              <div className="flex justify-between items-center mb-8">
                <p className="text-[#4a635d] font-bold">
                  {loading ? "Finding stays..." : (
                    <>Showing <span className="text-[#1a332e]">{filtered.length}</span> verified stays</>
                  )}
                </p>
              </div>

              {loading ? (
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                  {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : filtered.length > 0 ? (
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((listing) => (
                    <ListingCard key={listing._id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-[#e0f2ec] rounded-[3rem] py-24 text-center">
                  <h3 className="text-2xl font-black text-[#1a332e]">No stays found</h3>
                  <Button className="mt-8 bg-[#0fb478] rounded-xl px-8" onClick={handleReset}>
                    Reset Everything
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {showFilters && (
          <div className="fixed inset-0 bg-[#1a332e]/60 backdrop-blur-sm z-[100] flex">
            <div className="bg-white w-[85%] h-full p-8 overflow-y-auto shadow-2xl rounded-r-[3rem]">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-[#1a332e]">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="p-2 bg-[#f0f9f6] text-[#0fb478] rounded-xl">
                  <X size={24} />
                </button>
              </div>
              <FilterPanel />
            </div>
            <div className="flex-1" onClick={() => setShowFilters(false)} />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Listings;