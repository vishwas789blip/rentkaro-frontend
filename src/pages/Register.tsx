import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle2, ShieldCheck, Building2 } from "lucide-react";

import PrimaryButton from "@/components/PrimaryButton";
import Alert from "@/components/Alert";
import { Input, Label, InputWrapper } from "@/components/FormInput";
import Logo from "@/components/Logo";

// ── Left Panel ────────────────────────────────────────────────────
const RegisterLeftPanel = () => (
  <div className="hidden lg:flex w-2/5 min-h-screen flex-col justify-between relative overflow-hidden p-10 xl:p-12"
    style={{ background: "linear-gradient(145deg, #0f9660 0%, #1DB47F 60%, #16a871 100%)" }}>

    {/* Decorative circles */}
    <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/[0.07]" />
    <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/[0.05]" />

    {/* Brand Logo */}
    <div className="flex items-center gap-2.5 relative z-10">
      <Logo size={36} />
      <Link to="/" className="text-white text-xl font-bold no-underline" style={{ fontFamily: "Georgia, serif" }}>
        RentKaroo
      </Link>
    </div>

    {/* Brand Promo */}
    <div className="relative z-10">
      <div className="text-4xl mb-5">🚀</div>
      <h1 className="text-white text-4xl font-extrabold leading-tight mb-4" style={{ fontFamily: "Georgia, serif" }}>
        Start your<br />journey here.
      </h1>
      <p className="text-white/80 text-sm leading-relaxed mb-8">
        Join the most trusted PG network in the city. Access exclusive discounts, direct owner mappings, and priority viewings instantly.
      </p>

      {[
        { icon: <ShieldCheck size={16} />, text: "100% Verified Properties" },
        { icon: <Building2 size={16} />, text: "500+ Active System Listings" },
      ].map(({ icon, text }) => (
        <div key={text} className="flex items-center gap-2.5 bg-white/[0.12] rounded-xl px-4 py-3 mb-3">
          <span className="text-white flex items-center">{icon}</span>
          <span className="text-white text-[13px]">{text}</span>
        </div>
      ))}
    </div>

    <p className="text-white/50 text-xs relative z-10">EST. 2026</p>
  </div>
);

// ── Mobile Top Bar ────────────────────────────────────────────────
const MobileTopBar = () => (
  <div className="flex lg:hidden items-center gap-2 px-5 py-4 bg-white border-b border-gray-100">
    <Logo size={32} />
    <Link to="/" className="text-gray-900 text-[17px] font-bold no-underline" style={{ fontFamily: "Georgia, serif" }}>
      RentKaroo
    </Link>
  </div>
);

// ── Main Component ────────────────────────────────────────────────
export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [showPw, setShowPw] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || success) return;
    setError("");

    if (!form.name.trim()) return setError("Please enter your full name.");
    if (!form.email.trim()) return setError("Please enter your email address.");
    if (!/^\d{10}$/.test(form.phone)) return setError("Phone must be exactly 10 digits.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== confirmPassword) return setError("Passwords do not match.");

    try {
      const targetEmail = form.email;
      await register(form);
      setSuccess(true);
      toast.success("OTP sent to your email! Please verify to continue.");
      navigate("/verify-email", { state: { email: form.email }, replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-[Inter,system-ui,sans-serif]">

      <MobileTopBar />
      <RegisterLeftPanel />

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="w-full max-w-[520px]">

          <h2 className="text-2xl sm:text-[28px] font-extrabold text-gray-900 mb-1.5" style={{ fontFamily: "Georgia, serif" }}>
            Create Account
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Sign up to find or list your perfect stay — logs in seconds.
          </p>

          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message="Registration successful! Directing to email verification pipeline..." />}

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputWrapper>
                <Label>Full Name</Label>
                <Input
                  icon="👤"
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading || success}
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Email Address</Label>
                <Input
                  icon="✉"
                  name="email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading || success}
                />
              </InputWrapper>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputWrapper>
                <Label>Phone Number</Label>
                <Input
                  icon="📞"
                  name="phone"
                  type="tel"
                  required
                  placeholder="9410448110"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={loading || success}
                />
              </InputWrapper>

              {/* Account Type Dropdown */}
              <InputWrapper>
                <Label>Account Type</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">💼</span>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    disabled={loading || success}
                    className="w-full pl-9 pr-8 py-3 text-sm font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl outline-none cursor-pointer appearance-none transition-all duration-200
                      focus:border-[#1DB47F] focus:bg-white
                      disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="user">I'm looking for a PG</option>
                    <option value="pg_owner">I'm a Property Owner</option>
                  </select>
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none">▼</span>
                </div>
              </InputWrapper>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <InputWrapper>
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    icon="🔒"
                    name="password"
                    type={showPw ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading || success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </InputWrapper>

              {/* Confirm Password */}
              <InputWrapper>
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Input
                    icon="🔄"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    disabled={loading || success}
                    className={confirmPassword && form.password !== confirmPassword ? "border-red-500" : ""}
                  />
                </div>
              </InputWrapper>
            </div>

            <PrimaryButton type="submit" loading={loading} disabled={success}>
              {success ? (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> Account Staged
                </span>
              ) : (
                "Create Account →"
              )}
            </PrimaryButton>

          </form>

          <p className="text-center mt-5 text-sm text-gray-500">
            Already a member?{" "}
            <Link to="/login" className="text-[#1DB47F] font-bold no-underline hover:underline">
              Log In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}