import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Use react-router-dom for Vite
import DashboardLayout from "@/layouts/DashboardLayout";
import { listingAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Trash2, MapPin } from "lucide-react"; // Nice icons for UX

type Listing = {
  _id: string;
  title: string;
  pricePerMonth: number;
  address?: {
    city?: string;
  };
};

export default function AllListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await listingAPI.getAll();
      // Ensure we're targeting the correct nested data from your API
      const fetchedData = res.data?.data?.listings || [];
      setListings(fetchedData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      await listingAPI.delete(id);
      setListings((prev) => prev.filter((listing) => listing._id !== id));
      toast.success("Listing deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete listing");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Listings</h1>
            <p className="text-muted-foreground">Manage and monitor your properties.</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 w-full bg-slate-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground mb-4">No listings available yet.</p>
            <Link to="/dashboard/admin/listings/new">
              <Button variant="outline">Create your first listing</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {listings.map((listing) => (
              <div
                key={listing._id}
                className="group border rounded-xl p-5 flex justify-between items-center bg-card hover:shadow-md transition-all"
              >
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{listing.title}</h3>
                  
                  <div className="flex items-center text-sm text-muted-foreground gap-1">
                    <MapPin className="w-3 h-3" />
                    {listing.address?.city || "Unknown city"}
                  </div>

                  <p className="text-lg font-bold text-primary mt-2">
                    ₹{listing.pricePerMonth.toLocaleString("en-IN")}
                    <span className="text-xs font-normal text-muted-foreground"> /month</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(listing._id)}
                    title="Delete Listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}