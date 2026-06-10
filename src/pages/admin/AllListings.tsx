import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import apiClient from "@/services/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, MapPin, CheckCircle2, XCircle, Clock } from "lucide-react";

type Listing = {
  _id:           string;
  title:         string;
  pricePerMonth: number;
  status:        "pending" | "approved" | "rejected";
  isVerified:    boolean;
  address?:      { city?: string; state?: string };
  images?:       { url: string }[];
  owner?:        { name: string; email: string };
};

export default function AllListings() {
  const navigate  = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<"all" | "pending" | "approved" | "rejected">("all");

  const fetchListings = async () => {
    try {
      setLoading(true);
      // FIX: Use admin endpoint — /admin/listings (not public /pg-listings)
      // Admin endpoint supports ?status filter and returns all listings including deleted
      const params = filter !== "all" ? { status: filter } : {};
      const res    = await apiClient.get("/admin/listings", { params });
      const data   = res.data?.data?.listings || res.data?.data || [];
      setListings(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, [filter]);

  const handleApprove = async (id: string) => {
    try {
      await apiClient.patch(`/admin/listings/${id}/verify`);
      toast.success("Listing approved");
      setListings((prev) => prev.map((l) => l._id === id ? { ...l, status: "approved", isVerified: true } : l));
    } catch {
      toast.error("Failed to approve listing");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiClient.patch(`/admin/listings/${id}/reject`);
      toast.success("Listing rejected");
      setListings((prev) => prev.map((l) => l._id === id ? { ...l, status: "rejected" } : l));
    } catch {
      toast.error("Failed to reject listing");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await apiClient.delete(`/admin/listings/${id}`);
      setListings((prev) => prev.filter((l) => l._id !== id));
      toast.success("Listing deleted successfully");
    } catch {
      toast.error("Failed to delete listing");
    }
  };

  const statusBadge = (status: string) => {
    if (status === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "rejected") return "bg-red-50 text-red-600 border-red-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Listings</h1>
            <p className="text-muted-foreground">Review, approve and manage all PG properties.</p>
          </div>
          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {(["all", "pending", "approved", "rejected"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                  filter === f ? "bg-[#1a332e] text-white border-[#1a332e]" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400"
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 w-full bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground">No listings found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {listings.map((listing) => (
              <div key={listing._id} className="border rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card hover:shadow-md transition-all">
                <div className="flex gap-4 items-center flex-1 min-w-0">
                  {/* Thumbnail */}
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={listing.images?.[0]?.url || "https://via.placeholder.com/80"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-lg truncate">{listing.title}</h3>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border capitalize ${statusBadge(listing.status)}`}>
                        {listing.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground gap-1 mb-1">
                      <MapPin className="w-3 h-3" />
                      {listing.address?.city || "Unknown"}, {listing.address?.state || ""}
                    </div>
                    {listing.owner && (
                      <p className="text-xs text-muted-foreground">Owner: {listing.owner.name} · {listing.owner.email}</p>
                    )}
                    <p className="text-base font-bold text-emerald-700 mt-1">
                      ₹{listing.pricePerMonth?.toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-muted-foreground"> /month</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  {listing.status === "pending" && (
                    <>
                      <Button size="sm" variant="outline" className="border-emerald-400 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => handleApprove(listing._id)}>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-50"
                        onClick={() => handleReject(listing._id)}>
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  {listing.status === "approved" && (
                    <Button size="sm" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-50"
                      onClick={() => handleReject(listing._id)}>
                      <Clock className="w-4 h-4 mr-1" /> Revoke
                    </Button>
                  )}
                  <Button size="icon" variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-none"
                    onClick={() => handleDelete(listing._id)}>
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