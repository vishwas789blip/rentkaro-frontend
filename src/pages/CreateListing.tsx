import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X, Upload, MapPin, Building, Info } from "lucide-react";
import { listingAPI } from "@/services/api";
import { toast } from "sonner";

const amenitiesList = [
  { label: "WiFi", value: "wifi" },
  { label: "AC", value: "ac" },
  { label: "Parking", value: "parking" },
  { label: "Laundry", value: "laundry" },
  { label: "Kitchen", value: "kitchen" },
  { label: "Garden", value: "garden" },
  { label: "Gym", value: "gym" },
  { label: "Security", value: "security" },
  { label: "Electricity Bill", value: "electricity bill" }
];

const CreateListing = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    pricePerMonth: "",
    availableRooms: "",
    roomType: "single",
    images: [],
  });

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: any) => {
    const files = Array.from(e.target.files as FileList);
    if (form.images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setForm({ ...form, images: [...form.images, ...files] });
  };

  const removeImage = (index: number) => {
    const newImages = [...form.images];
    newImages.splice(index, 1);
    setForm({ ...form, images: newImages });
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();

      // Append all fields
      Object.keys(form).forEach(key => {
        if (key === 'images') {
          form.images.forEach((file: File) => formData.append("images", file));
        } else {
          formData.append(key, form[key]);
        }
      });

      // Standard way to send arrays in FormData for Multer
      selectedAmenities.forEach((a) => formData.append("amenities", a));

      await listingAPI.create(formData);
      toast.success("Listing published successfully!");
      navigate("/dashboard/owner");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-20">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Create Listing</h1>
          <p className="text-gray-500 font-medium mt-2">Publish your property on RentKaroo in minutes.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Section: Basic Details */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Building className="text-emerald-600" size={20} />
              <h2 className="text-xl font-bold text-gray-900">Property Details</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">PG Name / Title</Label>
                <Input name="title" value={form.title} onChange={handleChange} required className="rounded-2xl bg-gray-50 border-none h-12 font-bold focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Luxury Boys PG" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description</Label>
                <Textarea name="description" value={form.description} onChange={handleChange} required rows={4} className="rounded-2xl bg-gray-50 border-none font-bold focus:ring-2 focus:ring-emerald-500" placeholder="Tell us about the atmosphere, rules, and nearby landmarks..." />
              </div>
            </div>
          </div>

          {/* Section: Media */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-xl font-bold text-gray-900">Photos</h2>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{form.images.length}/5 Uploaded</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {form.images.map((file: File, index: number) => (
                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group">
                  <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full backdrop-blur-sm hover:bg-red-500 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {form.images.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all group">
                  <Upload size={24} className="text-gray-300 group-hover:text-emerald-500" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter group-hover:text-emerald-600">Add Photo</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Section: Address */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <MapPin className="text-emerald-600" size={20} />
              <h2 className="text-xl font-bold text-gray-900">Location</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="street" placeholder="Street Address" value={form.street} onChange={handleChange} required className="rounded-2xl bg-gray-50 border-none h-12 font-bold" />
              <Input name="city" placeholder="City" value={form.city} onChange={handleChange} required className="rounded-2xl bg-gray-50 border-none h-12 font-bold" />
              <Input name="state" placeholder="State" value={form.state} onChange={handleChange} required className="rounded-2xl bg-gray-50 border-none h-12 font-bold" />
              <Input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} required className="rounded-2xl bg-gray-50 border-none h-12 font-bold" />
            </div>
          </div>

          {/* Section: Pricing & Amenities */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Pricing & Capacity</h2>
              <div className="space-y-4">
                <Input type="number" name="pricePerMonth" placeholder="Rent (₹ / Month)" value={form.pricePerMonth} onChange={handleChange} required className="rounded-2xl bg-gray-50 border-none h-12 font-bold" />
                <Input type="number" name="availableRooms" placeholder="Available Rooms" value={form.availableRooms} onChange={handleChange} required className="rounded-2xl bg-gray-50 border-none h-12 font-bold" />
                <select name="roomType" value={form.roomType} onChange={handleChange} className="w-full rounded-2xl bg-gray-50 border-none h-12 px-4 font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="single">Single Sharing</option>
                  <option value="double">Double Sharing</option>
                  <option value="triple">Triple Sharing</option>
                </select>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Amenities</h2>
              <div className="flex flex-wrap gap-2">
{amenitiesList.map((a) => (
  <button
    key={a.value}
    type="button"
    onClick={() => toggleAmenity(a.value)}
    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all ${
      selectedAmenities.includes(a.value)
        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
    }`}
  >
    {a.label}
  </button>
))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-50">
            <div className="flex items-center gap-2 text-gray-400 italic">
              <Info size={14} />
              <span className="text-[10px] font-bold uppercase tracking-tight">Public listings are verified by admins.</span>
            </div>
            <Button disabled={loading} className="bg-gray-900 hover:bg-black text-white px-10 h-14 rounded-2xl font-black text-lg transition-all shadow-xl shadow-gray-900/10">
              {loading ? <Loader2 className="animate-spin" /> : "Publish Listing"}
            </Button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateListing;