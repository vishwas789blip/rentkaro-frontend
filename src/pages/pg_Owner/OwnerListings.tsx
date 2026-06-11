import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { listingAPI } from "@/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Edit, Trash2, MapPin, Home, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const OwnerListings = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  const fetchListings = async () => {
    try {
      const res = await listingAPI.getOwnerListings();
      const data = res.data?.data?.listings || res.data?.data || [];
      setListings(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await listingAPI.delete(id);
      toast.success("Listing deleted successfully");
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch {
      toast.error("Failed to delete listing");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">My Property Listings</h1>
            <p className="text-muted-foreground">Manage and track your active PG properties.</p>
          </div>
          {/* FIX: correct route — /createListing not /create-listing */}
          <Button onClick={() => navigate("/dashboard/owner/createListing")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Listing
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl">
            <div className="bg-emerald-50 p-4 rounded-full mb-4">
              <Home className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold">No listings found</h3>
            <p className="text-gray-500 mb-6">Start earning by listing your first PG property today.</p>
            <Button variant="outline" onClick={() => navigate("/dashboard/owner/createListing")}>
              <Plus className="h-4 w-4 mr-2" /> Create your first listing
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing._id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <img
                    src={listing.images?.[0]?.url || "https://via.placeholder.com/300"}
                    alt={listing.title}
                    className="h-52 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge className="absolute top-3 right-3 bg-white/90 text-black hover:bg-white capitalize">
                    {listing.rooms?.roomType}
                  </Badge>
                  {/* Status badge */}
                  <Badge className={`absolute top-3 left-3 capitalize ${
                    listing.status === "approved" ? "bg-emerald-500 text-white" :
                    listing.status === "rejected" ? "bg-red-500 text-white" :
                    "bg-amber-400 text-white"
                  }`}>
                    {listing.status || "pending"}
                  </Badge>
                </div>
                <CardContent className="p-5">
                  <h2 className="font-bold text-xl line-clamp-1 mb-1">{listing.title}</h2>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <MapPin className="h-3 w-3 mr-1 text-emerald-500" />
                    {listing.address?.city}, {listing.address?.state}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-emerald-700">₹{listing.pricePerMonth?.toLocaleString("en-IN")}</span>
                    <span className="text-xs text-gray-400 font-medium">/ month</span>
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0 flex gap-3">
                  <Button variant="outline" size="sm" className="w-full"
                    onClick={() => navigate(`/dashboard/owner/edit-listing/${listing._id}`)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" className="w-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-none"
                    onClick={() => handleDelete(listing._id)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OwnerListings;