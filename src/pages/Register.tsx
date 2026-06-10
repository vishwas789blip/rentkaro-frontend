import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  ArrowRight, User, Mail, Phone, Lock,
  ShieldCheck, Loader2, Building2, Eye, EyeOff
} from "lucide-react";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword]   = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [form, setForm] = useState({
    name:     "",
    email:    "",
    phone:    "",
    password: "",
    role:     "user",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await register(form);
      toast.success("OTP sent to your email! Please verify to continue.");

      // FIX: verify-email page pe bhejo, login pe nahi
      // email saath bhejo taaki verify form pre-fill ho sake
      navigate("/verify-email", { state: { email: form.email } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* Left panel */}
      <div className="relative hidden w-[35%] lg:block bg-[#1a332e]">
        <img
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80"
          alt="Luxury Stay"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0fb478]/80 to-[#1a332e]/95 backdrop-blur-[1px]" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-white">
          <Link to="/" className="text-2xl font-black tracking-tighter">RentKaroo</Link>
          <div className="space-y-6">
            <h1 className="text-5xl font-black leading-tight">Start your <br />journey here.</h1>
            <p className="text-emerald-50/80 font-medium max-w-sm">
              Join the most trusted PG network in the city. Access exclusive discounts and priority viewings.
            </p>
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg"><ShieldCheck size={20} /></div>
                <span className="text-sm font-bold">100% Verified Properties</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg"><Building2 size={20} /></div>
                <span className="text-sm font-bold">500+ Active Listings</span>
              </div>
            </div>
          </div>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">EST. 2026</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-[65%] lg:px-24">
        <div className="mx-auto w-full max-w-2xl space-y-10 py-10">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-[#1a332e]">Create Account</h2>
            <p className="text-[#4a635d] font-bold italic">Sign up to find your perfect stay in seconds.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0fb478] ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#cedcd7] group-focus-within:text-[#0fb478] transition-colors" />
                  <input
                    name="name" value={form.name} onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-[#f0f9f6] bg-[#f9fbfb] py-4 pl-12 pr-4 font-bold text-[#1a332e] outline-none focus:border-[#0fb478] focus:bg-white transition-all"
                    placeholder="John Doe" minLength={2} required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0fb478] ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#cedcd7] group-focus-within:text-[#0fb478] transition-colors" />
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-[#f0f9f6] bg-[#f9fbfb] py-4 pl-12 pr-4 font-bold text-[#1a332e] outline-none focus:border-[#0fb478] focus:bg-white transition-all"
                    placeholder="john@example.com" required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0fb478] ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#cedcd7] group-focus-within:text-[#0fb478] transition-colors" />
                  <input
                    name="phone" value={form.phone} onChange={handleChange}
                    pattern="\d{10}"
                    className="w-full rounded-2xl border-2 border-[#f0f9f6] bg-[#f9fbfb] py-4 pl-12 pr-4 font-bold text-[#1a332e] outline-none focus:border-[#0fb478] focus:bg-white transition-all"
                    placeholder="9876543210" required
                  />
                </div>
              </div>

              {/* Account Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0fb478] ml-1">Account Type</label>
                <select
                  name="role" value={form.role} onChange={handleChange}
                  className="w-full rounded-2xl border-2 border-[#f0f9f6] bg-[#f9fbfb] py-[1.1rem] px-4 font-black text-[#1a332e] outline-none focus:border-[#0fb478] transition-all cursor-pointer appearance-none"
                >
                  <option value="user">I'm looking for a PG</option>
                  <option value="pg_owner">I'm a Property Owner</option>
                </select>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0fb478] ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#cedcd7] group-focus-within:text-[#0fb478] transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password" value={form.password} onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-[#f0f9f6] bg-[#f9fbfb] py-4 pl-12 pr-12 font-bold text-[#1a332e] outline-none focus:border-[#0fb478] focus:bg-white transition-all"
                    placeholder="••••••••" minLength={6} required
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#cedcd7] hover:text-[#0fb478] p-1"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0fb478] ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#cedcd7] group-focus-within:text-[#0fb478] transition-colors" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border-2 border-[#f0f9f6] bg-[#f9fbfb] py-4 pl-12 pr-4 font-bold text-[#1a332e] outline-none focus:border-[#0fb478] focus:bg-white transition-all"
                    placeholder="••••••••" required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-[#1a332e] py-5 text-lg font-black text-white transition-all hover:bg-black hover:shadow-2xl hover:shadow-emerald-900/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <><span>Create Account</span><ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm font-bold text-[#4a635d]">
            Already a member?{" "}
            <Link to="/login" className="text-[#0fb478] hover:underline underline-offset-4">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}