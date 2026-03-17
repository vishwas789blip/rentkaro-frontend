import { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import ListingCard from "@/components/ListingCard";
import SkeletonCard from "@/components/SkeletonCard";
import { listingAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, SlidersHorizontal, X, MapPin, Wallet, 
  RotateCcw, Wifi, Wind, Car, Waves, Dumbbell, ShieldCheck, UtensilsCrossed 
} from "lucide-react";

const locations = ["All", "Ghaziabad", "Delhi", "Noida"];
const priceRanges = [
  "All",
  "Under ₹7,000",
  "₹7,000 - ₹10,000",
  "Above ₹10,000",
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

  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    setSearch("");
    setLocFilter("All");
    setPriceFilter("All");
    setSelectedAmenities([]);
  };

  const filtered = listings.filter((l) => {
    const city = l.address?.city?.toLowerCase() || "";
    const title = l.title?.toLowerCase() || "";
    const price = l.pricePerMonth || 0;
    const listingAmenities = l.amenities || [];

    const matchesSearch = !search || title.includes(search.toLowerCase()) || city.includes(search.toLowerCase());
    const matchesLoc = locFilter === "All" || city === locFilter.toLowerCase();
    
    let matchesPrice = true;
    if (priceFilter === "Under ₹7,000") matchesPrice = price < 7000;
    else if (priceFilter === "₹7,000 - ₹10,000") matchesPrice = price >= 7000 && price <= 10000;
    else if (priceFilter === "Above ₹10,000") matchesPrice = price > 10000;

    const matchesAmenities = selectedAmenities.length === 0 || 
      selectedAmenities.every(amenity => listingAmenities.includes(amenity));

    return matchesSearch && matchesLoc && matchesPrice && matchesAmenities;
  });

  const FilterPanel = () => (
    <div className="space-y-8">
      {/* Location Section */}
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

      {/* Budget Section */}
      <div>
        <div className="flex items-center gap-2 mb-4 text-[#1a332e]">
          <Wallet size={16} className="text-[#0fb478]" />
          <Label className="text-sm font-black uppercase tracking-wider">Budget</Label>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {priceRanges.map((p) => (
            <button
              key={p}
              onClick={() => setPriceFilter(p)}
              className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                priceFilter === p
                  ? "bg-[#f0f9f6] text-[#0fb478] border-[#0fb478]"
                  : "bg-white text-[#4a635d] border-[#e0f2ec] hover:border-[#0fb478]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities Section */}
      <div>
        <div className="flex items-center gap-2 mb-4 text-[#1a332e]">
          <ShieldCheck size={16} className="text-[#0fb478]" />
          <Label className="text-sm font-black uppercase tracking-wider">Amenities</Label>
        </div>
        <div className="flex flex-wrap gap-2">
          {amenityList.map((amenity) => (
            <button
              key={amenity.id}
              onClick={() => toggleAmenity(amenity.id)}
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
        {/* Header / Search Area */}
        <div className="bg-white border-b border-[#e0f2ec] py-8">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-3 max-w-3xl">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0fb478] group-focus-within:scale-110 transition-transform" size={20} />
                <Input
                  placeholder="Search by PG name, city, or landmark..."
                  className="pl-12 h-14 rounded-2xl border-[#e0f2ec] focus:ring-[#0fb478] bg-[#f9fbfb] font-medium"
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
            {/* Sidebar Desktop */}
            <aside className="hidden lg:block w-72 shrink-0 sticky top-28 h-fit bg-white border border-[#e0f2ec] rounded-[2.5rem] p-8 shadow-sm">
              <h2 className="text-xl font-black text-[#1a332e] mb-8">Refine Stay</h2>
              <FilterPanel />
            </aside>

            {/* Listings Grid */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-8">
                <p className="text-[#4a635d] font-bold">
                  Showing <span className="text-[#1a332e]">{filtered.length}</span> verified stays
                </p>
              </div>

              {loading ? (
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                  {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : filtered.length > 0 ? (
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 animate-in fade-in duration-700">
                  {filtered.map((listing) => (
                    <ListingCard key={listing._id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-[#e0f2ec] rounded-[3rem] py-24 text-center">
                  <div className="bg-[#f0f9f6] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-[#0fb478]" />
                  </div>
                  <h3 className="text-2xl font-black text-[#1a332e]">No stays found</h3>
                  <p className="text-[#4a635d] mt-2 font-medium">Try broadening your search or resetting filters.</p>
                  <Button
                    className="mt-8 bg-[#0fb478] hover:bg-[#0d9a66] rounded-xl px-8 font-black"
                    onClick={handleReset}
                  >
                    Reset Everything
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {showFilters && (
          <div className="fixed inset-0 bg-[#1a332e]/60 backdrop-blur-sm z-[100] flex animate-in fade-in duration-300">
            <div className="bg-white w-[85%] h-full p-8 overflow-y-auto shadow-2xl rounded-r-[3rem] animate-in slide-in-from-left duration-500">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-[#1a332e]">Filters</h2>
                <button 
                  onClick={() => setShowFilters(false)} 
                  className="p-2 bg-[#f0f9f6] text-[#0fb478] rounded-xl"
                >
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