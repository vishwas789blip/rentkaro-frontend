import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authAPI } from "@/api";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: any) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await authAPI.changePassword({
        oldPassword,
        newPassword,
      });

      toast.success("Password changed successfully 🎉");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border bg-card p-8 shadow-xl space-y-6">

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">
                🔐 Change Password
              </h2>
              <p className="text-sm text-muted-foreground">
                Keep your account secure by updating your password regularly.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">

              {/* Current Password */}
              <div className="space-y-2">
                <Label>Current Password</Label>
                <div className="relative">
                  <Input
                    type={showOld ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-2.5 text-sm text-muted-foreground"
                  >
                    {showOld ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-2.5 text-sm text-muted-foreground"
                  >
                    {showNew ? "Hide" : "Show"}
                  </button>
                </div>

                {newPassword && (
                  <div className="h-2 rounded bg-muted overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        newPassword.length < 6
                          ? "w-1/4 bg-red-500"
                          : newPassword.length < 8
                          ? "w-2/4 bg-yellow-500"
                          : "w-full bg-emerald-600"
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-2.5 text-sm text-muted-foreground"
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>

                {confirmPassword && (
                  <p
                    className={`text-xs ${
                      newPassword === confirmPassword
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {newPassword === confirmPassword
                      ? "Passwords match ✔"
                      : "Passwords do not match"}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 transition-all duration-200"
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>

            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChangePassword;