import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authAPI } from "@/api";
import { toast } from "sonner";
import { Mail, CheckCircle2 } from "lucide-react";

// ── Reusing shared components (same as ForgotPassword) ────────
import OTPBoxes      from "@/components/OTPBoxes";
import PrimaryButton from "@/components/PrimaryButton";
import Alert         from "@/components/Alert";
import { Input, Label, InputWrapper } from "@/components/FormInput";

// ── Reusing utils ─────────────────────────────────────────────
import { isValidOTP, isValidEmail, maskEmail, formatCountdown, getRemainingSeconds } from "@/lib/utils";
import { useEffect } from "react";

const RESEND_TTL = 60; // seconds

export default function VerifyEmail() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const prefillEmail = (location.state as any)?.email || "";

  const [email,      setEmail]      = useState(prefillEmail);
  const [otp,        setOtp]        = useState("");
  const [loading,    setLoading]    = useState(false);
  const [resending,  setResending]  = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState("");
  const [message,    setMessage]    = useState("");

  // Countdown timer — reusing getRemainingSeconds + formatCountdown from utils
  const [sentAt,    setSentAt]    = useState<number | null>(Date.now()); // starts on mount since OTP already sent at register
  const [countdown, setCountdown] = useState(RESEND_TTL);

  useEffect(() => {
    if (!sentAt) return;
    const tick = setInterval(() => {
      const rem = getRemainingSeconds(sentAt, RESEND_TTL);
      setCountdown(rem);
      if (rem === 0) clearInterval(tick);
    }, 1000);
    return () => clearInterval(tick);
  }, [sentAt]);

  const clear = () => { setError(""); setMessage(""); };

  // ── Verify ────────────────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault(); clear();
    if (!isValidOTP(otp)) return setError("Please enter the complete 6-digit OTP");

    setLoading(true);
    try {
      await authAPI.verifyEmail({ email, otp });
      setSuccess(true);
      setMessage("Email verified! Redirecting to login...");
      toast.success("Email verified!");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend ────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    clear();
    setResending(true);
    try {
      await authAPI.resendOtp({ email });
      setOtp("");
      setSentAt(Date.now());
      setCountdown(RESEND_TTL);
      setMessage("New OTP sent to your email!");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to resend OTP";
      setError(msg);
      if (msg.toLowerCase().includes("wait")) {
        setSentAt(Date.now());
        setCountdown(RESEND_TTL);
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "24px",
      background: "#fff", fontFamily: "Inter, system-ui, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: "#ECFDF5",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {success
              ? <CheckCircle2 size={36} color="#10B981" />
              : <Mail        size={36} color="#1DB47F" />
            }
          </div>
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#111827", margin: "0 0 10px", fontFamily: "Georgia, serif" }}>
            {success ? "Verified!" : "Check your email"}
          </h2>
          <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            {success
              ? "Your account is ready. Redirecting to login..."
              : <>We sent a 6-digit code to{" "}
                  <strong style={{ color: "#111827" }}>
                    {email ? maskEmail(email) : "your email"}
                  </strong>
                  {countdown > 0 && <>. Expires in <strong style={{ color: "#EF4444" }}>{formatCountdown(countdown)}</strong></>}
                </>
            }
          </p>
        </div>

        {/* Alerts — reusing Alert component */}
        {message && <Alert type="success" message={message} />}
        {error   && <Alert type="error"   message={error}   />}

        {!success && (
          <form onSubmit={handleVerify}>

            {/* Email field — only show if not prefilled from register */}
            {!prefillEmail && (
              <InputWrapper>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </InputWrapper>
            )}

            {/* OTP boxes — reusing OTPBoxes component */}
            <InputWrapper>
              <Label>One-Time Password</Label>
              <OTPBoxes value={otp} onChange={setOtp} />
            </InputWrapper>

            {/* Verify button — reusing PrimaryButton */}
            <PrimaryButton
              type="submit"
              loading={loading}
              disabled={!isValidOTP(otp)}
            >
              Verify Email →
            </PrimaryButton>

            {/* Resend row */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              <Link to="/login" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none", fontWeight: 500 }}>
                ← Back to Login
              </Link>

              {countdown === 0 ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  style={{
                    background: "none", border: "none",
                    color: "#1DB47F", fontSize: 13, fontWeight: 700,
                    cursor: resending ? "not-allowed" : "pointer", padding: 0,
                  }}
                >
                  {resending ? "Sending..." : "Resend OTP"}
                </button>
              ) : (
                <span style={{ fontSize: 13, color: "#9CA3AF" }}>
                  Resend in {formatCountdown(countdown)}
                </span>
              )}
            </div>

          </form>
        )}

        {/* Back to login when success */}
        {success && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Link to="/login" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none", fontWeight: 600 }}>
              ← Back to Login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}