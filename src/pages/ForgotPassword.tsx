import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { authAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyRound, Mail, Lock, ShieldCheck } from "lucide-react";

type Step = "EMAIL" | "OTP" | "PASSWORD";

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  // States
  const [step, setStep] = useState<Step>("EMAIL");
  const [loading, setLoading] = useState(false);
  
  // Form Data
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 1. Request OTP
  const handleSendOTP = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authAPI.sendPasswordResetOTP(email); // Update your api service
      toast.success("OTP sent to your email!");
      setStep("OTP");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authAPI.verifyOTP({ email, otp }); // Update your api service
      toast.success("OTP Verified! Set your new password.");
      setStep("PASSWORD");
    } catch (err: any) {
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Reset Password
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error("Passwords do not match");

    try {
      setLoading(true);
      await authAPI.resetPasswordWithOTP({ email, otp, password });
      toast.success("Password updated successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      toast.error("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-xl">
          
          {/* Header logic based on step */}
          <div className="text-center mb-8">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              {step === "EMAIL" && <Mail />}
              {step === "OTP" && <ShieldCheck />}
              {step === "PASSWORD" && <Lock />}
            </div>
            <h2 className="text-2xl font-bold">
              {step === "EMAIL" && "Forgot Password"}
              {step === "OTP" && "Enter OTP"}
              {step === "PASSWORD" && "Set New Password"}
            </h2>
          </div>

          {/* STEP 1: EMAIL */}
          {step === "EMAIL" && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="name@example.com"
                />
              </div>
              <Button className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === "OTP" && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label>Enter 6-Digit Code</Label>
                <Input 
                  type="text" 
                  maxLength={6}
                  className="text-center tracking-[1em] font-bold text-xl"
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  required 
                />
              </div>
              <Button className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              <button 
                type="button" 
                onClick={() => setStep("EMAIL")}
                className="text-sm text-primary w-full text-center"
              >
                Change Email
              </button>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === "PASSWORD" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>
              <Button className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ForgotPassword;