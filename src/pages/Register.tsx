import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle2, ShieldCheck, Building2, Loader2 } from "lucide-react";

// ── Reusing your exact platform layout components ─────────────────
import PrimaryButton from "@/components/PrimaryButton";
import Alert         from "@/components/Alert";
import { Input, Label, InputWrapper } from "@/components/FormInput";
import Logo from "@/components/Logo";

// ── Matching Structured Left Side Panel (hidden on mobile) ────────
const RegisterLeftPanel = () => (
  <div className="hidden lg:flex w-2/5 min-h-screen flex-col justify-between relative overflow-hidden p-10 xl:p-12"
    style={{ background: "linear-gradient(145deg, #0f9660 0%, #1DB47F 60%, #16a871 100%)" }}>
    <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
    <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

    {/* Brand Logo */}
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Logo size={36} />
      <Link to="/" style={{ color: "#fff", fontSize: 20, fontWeight: 700, fontFamily: "Georgia, serif", textDecoration: "none" }}>
        RentKaroo
      </Link>
    </div>

    {/* Brand Promotion Context */}
    <div>
      <div style={{ fontSize: 40, marginBottom: 20 }}>🚀</div>
      <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 800, lineHeight: 1.15, margin: "0 0 16px", fontFamily: "Georgia, serif" }}>
        Start your<br />journey here.
      </h1>
      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, lineHeight: 1.6, margin: "0 0 32px" }}>
        Join the most trusted PG network in the city. Access exclusive discounts, direct owner mappings, and priority viewings instantly.
      </p>
      {[
        { icon: <ShieldCheck size={16} />, text: "100% Verified Properties" },
        { icon: <Building2 size={16} />, text: "500+ Active System Listings" },
      ].map(({ icon, text }) => (
        <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
          <span style={{ color: "#fff", display: "flex", alignItems: "center" }}>{icon}</span>
          <span style={{ color: "#fff", fontSize: 13, fontFamily: "Inter, system-ui, sans-serif" }}>{text}</span>
        </div>
      ))}
    </div>

    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "Inter, system-ui, sans-serif" }}>EST. 2026</p>
  </div>
);

// ── Mobile top bar (visible only on small screens) ────────────────
const MobileTopBar = () => (
  <div className="flex lg:hidden items-center gap-2 px-5 py-4 bg-white border-b border-gray-100">
    <Logo size={32} />
    <Link to="/" style={{ color: "#111827", fontSize: 17, fontWeight: 700, fontFamily: "Georgia, serif", textDecoration: "none" }}>
      RentKaroo
    </Link>
  </div>
);

// ── Main Component ────────────────────────────────────────────
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
      await register(form);
      setSuccess(true);
      toast.success("OTP sent to your email! Please verify to continue.");
      setTimeout(() => navigate("/verify-email", { state: { email: form.email }, replace: true }), 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Mobile-only top bar ── */}
      <MobileTopBar />

      {/* ── Left branding panel (desktop only, matches Login/ChangePassword) ── */}
      <RegisterLeftPanel />

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="w-full max-w-[520px]">

          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 6px", fontFamily: "Georgia, serif" }} className="sm:text-[28px]">
            Create Account
          </h2>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            Sign up to find or list your perfect stay framework logs in seconds.
          </p>

          {/* Inline Alert Components */}
          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message="Registration successful! Directing to email verification pipeline..." />}

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
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

              {/* Email Address */}
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
              {/* Phone Number */}
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

              {/* Account Type Selection dropdown with absolute native properties */}
              <InputWrapper>
                <Label>Account Type</Label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9CA3AF", pointerEvents: "none" }}>💼</span>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    disabled={loading || success}
                    style={{
                      width: "100%",
                      padding: "12px 12px 12px 36px",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#111827",
                      background: "#F9FAFB",
                      border: "1.5px solid #E5E7EB",
                      borderRadius: 12,
                      outline: "none",
                      cursor: "pointer",
                      appearance: "none",
                      transition: "all 0.2s ease"
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#1DB47F", e.target.style.background = "#FFF")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB", e.target.style.background = "#F9FAFB")}
                  >
                    <option value="user">I'm looking for a PG</option>
                    <option value="pg_owner">I'm a Property Owner</option>
                  </select>
                  <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "#9CA3AF", pointerEvents: "none" }}>▼</span>
                </div>
              </InputWrapper>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password Field */}
              <InputWrapper>
                <Label>Password</Label>
                <div style={{ position: "relative" }}>
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
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9CA3AF" }}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </InputWrapper>

              {/* Confirm Password Field */}
              <InputWrapper>
                <Label>Confirm Password</Label>
                <div style={{ position: "relative" }}>
                  <Input
                    icon="🔄"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    disabled={loading || success}
                    style={{
                      borderColor: confirmPassword && form.password !== confirmPassword ? "#EF4444" : undefined
                    }}
                  />
                </div>
              </InputWrapper>
            </div>

            {/* Action Submit Button */}
            <PrimaryButton type="submit" loading={loading} disabled={success}>
              {success ? (
                <><CheckCircle2 size={15} /> Account Staged</>
              ) : (
                "Create Account →"
              )}
            </PrimaryButton>

          </form>

          {/* Action Footer Links */}
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#6B7280" }}>
            Already a member?{" "}
            <Link
              to="/login"
              style={{ color: "#1DB47F", fontWeight: 700, textDecoration: "none" }}
            >
              Log In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}