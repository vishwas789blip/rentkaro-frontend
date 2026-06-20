import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Mail, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// ── Reusing shared components ─────────────────────────────────
import LeftPanel     from "@/components/LeftPanel";
import PrimaryButton from "@/components/PrimaryButton";
import Alert         from "@/components/Alert";
import { Input, Label, InputWrapper } from "@/components/FormInput";

// ── LeftPanel needs a Step type 
const LoginLeftPanel = () => (
  <div style={{
    width: "40%",
    background: "linear-gradient(145deg, #0f9660 0%, #1DB47F 60%, #16a871 100%)",
    padding: "48px 40px",
    display: "flex", flexDirection: "column", justifyContent: "space-between",
    position: "relative", overflow: "hidden", minHeight: "100vh",
  }}>
    {/* Decorative blobs */}
    <div style={{ position: "absolute", top: -60,  right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
    <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

    {/* Logo */}
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏠</div>
      <Link to="/" style={{ color: "#fff", fontSize: 20, fontWeight: 700, fontFamily: "Georgia, serif", textDecoration: "none" }}>
        RentKaroo
      </Link>
    </div>

    {/* Copy */}
    <div>
      <div style={{ fontSize: 40, marginBottom: 20 }}>👋</div>
      <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 800, lineHeight: 1.15, margin: "0 0 16px", fontFamily: "Georgia, serif" }}>
        Welcome<br />back.
      </h1>
      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, lineHeight: 1.6, margin: "0 0 32px" }}>
        Log in to manage your bookings, explore new PGs, and stay connected with the community.
      </p>
      {[
        { icon: "🛡️", text: "Secure Authentication" },
        { icon: "⚡", text: "Fast Dashboard Access" },
      ].map(({ icon, text }) => (
        <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ color: "#fff", fontSize: 13, fontFamily: "Inter, system-ui, sans-serif" }}>{text}</span>
        </div>
      ))}
    </div>

    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "Inter, system-ui, sans-serif" }}>EST. 2026</p>
  </div>
);

// ── Main Component ────────────────────────────────────────────
export default function Login() {
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState("");

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || success) return;
    setError("");

    // Basic client-side validation
    if (!email.trim())    return setError("Please enter your email address.");
    if (!password.trim()) return setError("Please enter your password.");

    setLoading(true);
    try {
      await login(email, password);
      setSuccess(true);
      toast.success("Welcome back!");
      setTimeout(() => navigate("/", { replace: true }), 800);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid email or password. Please try again.";

      // Redirect to verify-email if unverified
      if (msg.toLowerCase().includes("verify")) {
        toast.error("Please verify your email first.");
        return navigate("/verify-email", { state: { email } });
      }

      // Show inline error via Alert component
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Left branding panel (same style as ForgotPassword) ── */}
      <LoginLeftPanel />

      {/* ── Right form panel ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 52px", background: "#fff", overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "0 0 6px", fontFamily: "Georgia, serif" }}>
            Sign In
          </h2>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
            Enter your credentials to access your account.
          </p>

          {/* Error alert — reusing Alert component */}
          {error && <Alert type="error" message={error} />}

          {/* Success state */}
          {success && (
            <Alert type="success" message="Login successful! Redirecting..." />
          )}

          <form onSubmit={handleLogin}>
            {/* Email — reusing InputWrapper + Label + Input */}
            <InputWrapper>
              <Label>Email Address</Label>
              <Input
                icon="✉"
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading || success}
              />
            </InputWrapper>

            {/* Password */}
            <InputWrapper>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <Label>Password</Label>
                <Link
                  to="/forgotPassword"
                  style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.07em" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#1DB47F")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}
                >
                  Forgot Password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <Input
                  icon="🔒"
                  type={showPw ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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

            {/* Submit — reusing PrimaryButton */}
            <PrimaryButton type="submit" loading={loading} disabled={success}>
              {success
                ? <><CheckCircle2 size={15} /> Verified</>
                : "Log In →"
              }
            </PrimaryButton>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#6B7280" }}>
            Not a member yet?{" "}
            <Link
              to="/register"
              style={{ color: "#1DB47F", fontWeight: 700, textDecoration: "none" }}
            >
              Join RentKaroo
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}