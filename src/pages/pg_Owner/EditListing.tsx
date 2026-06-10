import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listingAPI } from "@/services/api";
import {
  Plus, X, Sparkles, Loader2, ArrowLeft,
  MapPin, Home, IndianRupee, UploadCloud, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function EditListing() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading]   = useState(false);
  const [existingPhotos, setExistingPhotos] = useState<any[]>([]);
  const [newPhotos, setNewPhotos]           = useState<File[]>([]);
  const [newAmenity, setNewAmenity]         = useState("");

  const [form, setForm] = useState({
    title: "", description: "", pricePerMonth: "",
    street: "", city: "", state: "", pincode: "",
    availableRooms: "", roomType: "single",
    amenities: [] as string[],
  });

  useEffect(() => {
    if (!id) return;
    const fetchListing = async () => {
      try {
        const res = await listingAPI.getById(id);
        const l   = res.data?.data?.listing ?? res.data?.data ?? res.data;
        setForm({
          title:          l.title             || "",
          description:    l.description       || "",
          pricePerMonth:  String(l.pricePerMonth  || ""),
          street:         l.address?.street   || "",
          city:           l.address?.city     || "",
          state:          l.address?.state    || "",
          pincode:        l.address?.pincode  || "",
          availableRooms: String(l.rooms?.availableRooms || ""),
          roomType:       l.rooms?.roomType   || "single",
          amenities:      l.amenities         || [],
        });
        setExistingPhotos(l.images || []);
      } catch {
        toast.error("Could not load listing data");
        navigate("/dashboard/owner/listings");
      } finally {
        setFetching(false);
      }
    };
    fetchListing();
  }, [id, navigate]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files     = Array.from(e.target.files);
    const remaining = 5 - existingPhotos.length - newPhotos.length;
    if (remaining <= 0) return toast.error("Maximum 5 images allowed");
    setNewPhotos((prev) => [...prev, ...files].slice(0, prev.length + remaining));
  };

  const addAmenity = () => {
    const val = newAmenity.toLowerCase().trim();
    if (!val) return;
    if (form.amenities.includes(val)) { toast.error("Already added"); return; }
    setForm((f) => ({ ...f, amenities: [...f.amenities, val] }));
    setNewAmenity("");
  };

  const onUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "amenities") {
          (v as string[]).forEach((a) => fd.append("amenities", a));
        } else {
          fd.append(k, String(v));
        }
      });
      newPhotos.forEach((f) => fd.append("images", f));
      await listingAPI.update(id as string, fd);
      toast.success("Changes saved!", { icon: <CheckCircle2 className="text-emerald-500" /> });
      navigate("/dashboard/owner/listings");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="animate-spin text-emerald-600" size={48} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <header className="flex justify-between items-center mb-10">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 mb-2 hover:text-black transition-colors">
            <ArrowLeft size={18} className="mr-2" /> Back
          </button>
          <h1 className="text-4xl font-black tracking-tighter">Edit Property</h1>
        </div>
        <Button onClick={onUpdate} disabled={loading} className="bg-emerald-600 text-white rounded-2xl px-10 h-14 font-bold">
          {loading ? <Loader2 className="animate-spin" /> : "Publish Changes"}
        </Button>
      </header>

      <form onSubmit={onUpdate} className="space-y-10">
        {/* Photos */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Photos</h2>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {existingPhotos.length + newPhotos.length}/5 Uploaded
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {existingPhotos.map((img, i) => (
              <div key={`old-${i}`} className="relative aspect-square rounded-3xl overflow-hidden border border-gray-100">
                <img src={img.url} className="h-full w-full object-cover opacity-60" alt="" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <span className="text-[8px] font-black text-white uppercase bg-black/40 px-2 py-1 rounded-full">Saved</span>
                </div>
              </div>
            ))}
            {newPhotos.map((file, i) => (
              <div key={`new-${i}`} className="relative aspect-square rounded-3xl overflow-hidden border-2 border-emerald-400">
                <img src={URL.createObjectURL(file)} className="h-full w-full object-cover" alt="" />
                <button type="button" onClick={() => setNewPhotos((p) => p.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 p-1 bg-white rounded-full text-red-500">
                  <X size={12} />
                </button>
              </div>
            ))}
            {existingPhotos.length + newPhotos.length < 5 && (
              <label className="aspect-square border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50 transition-all group">
                <UploadCloud size={32} className="text-gray-300 group-hover:text-emerald-500" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Add More</span>
                <input type="file" multiple className="hidden" onChange={handlePhotoChange} accept="image/*" />
              </label>
            )}
          </div>
        </div>

        {/* Details & Location */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-emerald-500"><Home size={18} /><h3 className="font-bold text-black">General Info</h3></div>
            <Input value={form.title}       onChange={(e) => setForm({ ...form, title:       e.target.value })} className="h-14 rounded-2xl bg-gray-50 border-none font-bold" placeholder="PG Name" required />
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-2xl bg-gray-50 border-none font-medium min-h-[120px]" placeholder="Description" required />
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-emerald-500"><MapPin size={18} /><h3 className="font-bold text-black">Location</h3></div>
            <div className="grid grid-cols-2 gap-4">
              <Input value={form.street}  onChange={(e) => setForm({ ...form, street:  e.target.value })} className="h-14 rounded-2xl bg-gray-50 border-none font-bold" placeholder="Street" />
              <Input value={form.city}    onChange={(e) => setForm({ ...form, city:    e.target.value })} className="h-14 rounded-2xl bg-gray-50 border-none font-bold" placeholder="City" />
              <Input value={form.state}   onChange={(e) => setForm({ ...form, state:   e.target.value })} className="h-14 rounded-2xl bg-gray-50 border-none font-bold" placeholder="State" />
              <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="h-14 rounded-2xl bg-gray-50 border-none font-bold" placeholder="Pincode" />
            </div>
          </div>
        </div>

        {/* Pricing & Amenities */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Pricing & Amenities</h3>
            <div className="flex gap-2">
              <Input placeholder="Add custom tag..." value={newAmenity} onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                className="h-10 rounded-xl bg-gray-50 border-none text-xs font-bold" />
              <Button type="button" onClick={addAmenity} className="h-10 w-10 bg-gray-900 rounded-xl"><Plus /></Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <Input type="number" value={form.pricePerMonth} onChange={(e) => setForm({ ...form, pricePerMonth: e.target.value })}
                className="h-14 rounded-2xl bg-gray-50 border-none font-black text-2xl" min={1000} required />
              <IndianRupee className="absolute right-4 top-4 text-gray-300" size={20} />
            </div>
            <select value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })}
              className="h-14 rounded-2xl bg-gray-50 border-none px-4 font-bold outline-none">
              <option value="single">Single Sharing</option>
              <option value="double">Double Sharing</option>
              <option value="triple">Triple Sharing</option>
              <option value="quad">Quad Sharing</option>
            </select>
            <Input type="number" value={form.availableRooms} onChange={(e) => setForm({ ...form, availableRooms: e.target.value })}
              className="h-14 rounded-2xl bg-gray-50 border-none font-bold" placeholder="Rooms" min={1} required />
          </div>
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50">
            {form.amenities.map((a) => (
              <div key={a} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[10px] font-black uppercase">
                <Sparkles size={12} /> {a}
                <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => setForm((p) => ({ ...p, amenities: p.amenities.filter((i) => i !== a) }))} />
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}