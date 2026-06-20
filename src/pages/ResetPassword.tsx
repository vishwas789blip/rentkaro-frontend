import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { authAPI } from "@/api";

// ── Reusing your exact platform layout components ─────────────────
import PrimaryButton from "@/components/PrimaryButton";
import Alert         from "@/components/Alert";
import { Input, Label, InputWrapper } from "@/components/FormInput";
import Logo from "@/components/Logo";

// ── Matching Structured Side Panel (hidden on mobile) ────────────
const SecurityLeftPanel = () => (
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

    {/* Context Content */}
    <div>
      <div style={{ fontSize: 40, marginBottom: 20 }}>🔐</div>
      <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 800, lineHeight: 1.15, margin: "0 0 16px", fontFamily: "Georgia, serif" }}>
        Security<br />Update.
      </h1>
      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, lineHeight: 1.6, margin: "0 0 32px" }}>
        Keep your account safe. Changing passwords regularly ensures your tracking details and credentials remain locked securely.
      </p>
      {[
        { icon: "🛡️", text: "End-to-End Encryption" },
        { icon: "🔑", text: "Strict Session Synchronization" },
      ].map(({ icon, text }) => (
        <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ color: "#fff", fontSize: 13, fontFamily: "Inter, system-ui, sans-serif" }}>{text}</span>
        </div>
      ))}
    </div>

    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "Inter, system-ui, sans-serif" }}>SECURE ENVIRONMENT</p>
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
export default function ResetPassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || success) return;
    setError("");

    if (!oldPassword) return setError("Please enter your current password.");
    if (newPassword.length < 6) return setError("New password must be at least 6 characters.");
    if (newPassword !== confirmPassword) return setError("Passwords do not match.");

    try {
      setLoading(true);

      await authAPI.changePassword({
        oldPassword,
        newPassword,
      });

      setSuccess(true);
      toast.success("Password changed successfully 🎉");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => navigate("/dashboard/user", { replace: true }), 1000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to update password. Please try again.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Mobile-only top bar ── */}
      <MobileTopBar />

      {/* ── Left matching branding panel (desktop only) ── */}
      <SecurityLeftPanel />

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="w-full max-w-[420px]">

          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 6px", fontFamily: "Georgia, serif" }} className="sm:text-[28px]">
            Change Password
          </h2>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            Update your credentials below to keep your account safe.
          </p>

          {/* Inline Alert Messages */}
          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message="Password updated! Routing back to profile..." />}

          <form onSubmit={handleChangePassword}>

            {/* Current Password Field */}
            <InputWrapper>
              <Label>Current Password</Label>
              <div style={{ position: "relative" }}>
                <Input
                  icon="🔒"
                  type={showOld ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={loading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9CA3AF" }}
                >
                  {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </InputWrapper>

            {/* New Password Field */}
            <InputWrapper>
              <Label>New Password</Label>
              <div style={{ position: "relative" }}>
                <Input
                  icon="🔑"
                  type={showNew ? "text" : "password"}
                  required
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9CA3AF" }}
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Matching Password Strength Visualizer */}
              {newPassword && (
                <div style={{ height: 3, borderRadius: 2, background: "#E5E7EB", overflow: "hidden", marginTop: 8 }}>
                  <div
                    style={{
                      height: "100%",
                      transition: "all 0.3s ease",
                      width: newPassword.length < 6 ? "33%" : newPassword.length < 9 ? "66%" : "100%",
                      background: newPassword.length < 6 ? "#EF4444" : newPassword.length < 9 ? "#F59E0B" : "#1DB47F",
                    }}
                  />
                </div>
              )}
            </InputWrapper>

            {/* Confirm New Password Field */}
            <InputWrapper>
              <Label>Confirm New Password</Label>
              <div style={{ position: "relative" }}>
                <Input
                  icon="🔄"
                  type={showConfirm ? "text" : "password"}
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading || success}
                  style={{
                    borderColor: confirmPassword && newPassword !== confirmPassword ? "#EF4444" : undefined
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9CA3AF" }}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </InputWrapper>

            {/* Action Form Submit Trigger */}
            <PrimaryButton type="submit" loading={loading} disabled={success}>
              {success ? (
                <><CheckCircle2 size={15} /> Password Synced</>
              ) : (
                "Update Password →"
              )}
            </PrimaryButton>

          </form>

          {/* Action Footer Navigation Links */}
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#6B7280" }}>
            Want to review details?{" "}
            <Link
              to="/dashboard/user"
              style={{ color: "#1DB47F", fontWeight: 700, textDecoration: "none" }}
            >
              Back to Profile
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}