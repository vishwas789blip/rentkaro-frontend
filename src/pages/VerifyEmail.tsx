import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authAPI } from "@/services/api";
import { toast } from "sonner";
import { ArrowRight, Mail, Loader2, CheckCircle2, RotateCcw } from "lucide-react";

export default function VerifyEmail() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Email register page se state mein aata hai
  const prefillEmail = (location.state as any)?.email || "";

  const [email, setEmail]       = useState(prefillEmail);
  const [otp, setOtp]           = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess]   = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend button
  const startCooldown = (seconds: number) => {
    setResendCooldown(seconds);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.verifyEmail({ email, otp });
      setIsSuccess(true);
      toast.success("Email verified! Redirecting to login...");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      await authAPI.resendOtp({ email });
      toast.success("New OTP sent to your email!");
      startCooldown(60);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to resend OTP";
      // Backend returns 429 with wait time — show it
      toast.error(message);
      if (message.includes("wait")) startCooldown(60);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white items-center justify-center px-6">
      <div className="w-full max-w-md space-y-10">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-[2rem] bg-emerald-50 flex items-center justify-center">
            {isSuccess
              ? <CheckCircle2 size={36} className="text-emerald-500" />
              : <Mail size={36} className="text-[#0fb478]" />
            }
          </div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-black text-[#1a332e]">
            {isSuccess ? "Verified!" : "Check your email"}
          </h2>
          <p className="text-[#4a635d] font-medium">
            {isSuccess
              ? "Your account is ready. Redirecting to login..."
              : <>We sent a 6-digit code to <span className="font-black text-[#1a332e]">{email || "your email"}</span></>
            }
          </p>
        </div>

        {!isSuccess && (
          <form onSubmit={handleVerify} className="space-y-8">
            {/* Email field — editable in case user came from login error */}
            {!prefillEmail && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0fb478] ml-1">
                  Email Address
                </label>
                <input
                  type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl bg-[#f8faf9] py-4 px-5 font-bold text-[#1a332e] outline-none border-2 border-transparent focus:border-[#0fb478] focus:bg-white transition-all"
                  placeholder="john@example.com" required
                />
              </div>
            )}

            {/* OTP input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#0fb478] ml-1">
                OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-2xl bg-[#f8faf9] py-5 px-5 font-black text-[#1a332e] text-center tracking-[0.5em] text-2xl outline-none border-2 border-transparent focus:border-[#0fb478] focus:bg-white transition-all"
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
                required
              />
              <p className="text-[10px] font-bold text-[#4a635d] ml-1">
                Code expires in 10 minutes
              </p>
            </div>

            {/* Verify button */}
            <button
              type="submit" disabled={isLoading || otp.length !== 6}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-[#1a332e] py-5 text-lg font-black text-white transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading
                ? <Loader2 className="h-6 w-6 animate-spin" />
                : <><span>Verify Email</span><ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></>
              }
            </button>

            {/* Resend */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0}
                className="flex items-center gap-2 mx-auto text-sm font-black text-[#4a635d] hover:text-[#0fb478] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={14} className={isResending ? "animate-spin" : ""} />
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : isResending
                  ? "Sending..."
                  : "Resend OTP"
                }
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <Link to="/login" className="text-sm font-black text-[#4a635d] hover:text-[#0fb478] transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}