import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { userAPI } from "@/services/api"; // Ensure updateProfile is here
import { 
  User, Mail, Phone, MapPin, 
  Calendar, ShieldCheck, Loader2, CheckCircle2 
} from "lucide-react";
import { toast } from "sonner"; // Ya jo bhi aap notification ke liye use kar rahe ho

const UserProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Local state for form
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });

  // Sync local state when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || ""
      });
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // Assuming userAPI.updateProfile(data) exists in your services
      await userAPI.updateProfile(formData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to update profile");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your identity on RentKaroo.</p>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${
              isEditing ? "bg-gray-100 text-gray-600" : "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
            }`}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Stats Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 text-center shadow-sm">
              <div className="h-28 w-28 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-4xl font-black mx-auto border-4 border-white shadow-md">
                {user?.name?.[0].toUpperCase()}
              </div>
              <h2 className="mt-4 text-xl font-bold">{user?.name}</h2>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mt-2">
                <ShieldCheck size={12} /> Verified {user?.role}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 shadow-sm space-y-4">
              <InfoRow icon={Mail} label="Email" value={user?.email} color="text-blue-500" />
              <InfoRow icon={Calendar} label="Joined" value={new Date(user?.createdAt).toLocaleDateString()} color="text-purple-500" />
            </div>
          </div>

          {/* Dynamic Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleUpdate} className="bg-white rounded-[3rem] border border-gray-100 p-8 shadow-sm space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <InputField 
                  label="Full Name" 
                  value={formData.name} 
                  onChange={(v) => setFormData({...formData, name: v})}
                  disabled={!isEditing}
                />
                <InputField 
                  label="Phone Number" 
                  value={formData.phone} 
                  onChange={(v) => setFormData({...formData, phone: v})}
                  disabled={!isEditing}
                  placeholder="+91 XXXXX XXXXX"
                />
                <div className="md:col-span-2">
                  <InputField 
                    label="Current Address" 
                    value={formData.address} 
                    onChange={(v) => setFormData({...formData, address: v})}
                    disabled={!isEditing}
                    placeholder="Enter your full address"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="pt-6 border-t flex justify-end">
                  <button 
                    type="submit"
                    disabled={updating}
                    className="bg-emerald-600 text-white px-10 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {updating ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

/* --- Sub-Components --- */

const InfoRow = ({ icon: Icon, label, value, color }: any) => (
  <div className="flex items-center gap-4">
    <div className={`h-10 w-10 rounded-2xl bg-gray-50 flex items-center justify-center ${color}`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-700">{value || "Not Set"}</p>
    </div>
  </div>
);

const InputField = ({ label, value, onChange, disabled, placeholder }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{label}</label>
    <input 
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full p-4 rounded-2xl border transition-all outline-none ${
        disabled 
          ? "bg-gray-50 border-gray-50 text-gray-500 cursor-not-allowed" 
          : "bg-white border-emerald-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 shadow-sm"
      }`}
    />
  </div>
);

export default UserProfile;