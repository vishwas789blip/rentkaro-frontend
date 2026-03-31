import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { userAPI } from "@/services/api";
import {
  User, Mail, Phone, MapPin,
  Calendar, ShieldCheck, Loader2,
  CheckCircle2, Lock, Eye, EyeOff,
  Pencil, X, Save, Building2
} from "lucide-react";
import { toast } from "sonner";

/* ============================================================
   TYPES
============================================================ */
interface ProfileForm {
  name: string;
  phone: string;
  city: string;
  state: string;
}

interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/* ============================================================
   MAIN PAGE
============================================================ */
const UserProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f7f6f2]">
        <Loader2 className="animate-spin text-[#1a6b4a]" size={36} />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .profile-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #f7f6f2;
          padding: 2.5rem 1.5rem;
        }

        .profile-wrap { max-width: 900px; margin: 0 auto; }

        /* ── Header ── */
        .profile-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-bottom: 2.5rem;
        }
        .profile-header h1 {
          font-family: 'DM Serif Display', serif;
          font-size: 2.4rem; font-weight: 400;
          color: #0f1f17; margin: 0 0 4px;
          letter-spacing: -0.5px;
        }
        .profile-header p { color: #6b7c74; font-size: 0.9rem; margin: 0; }

        /* ── Avatar card ── */
        .avatar-card {
          background: #0f1f17;
          border-radius: 28px;
          padding: 2rem 1.5rem;
          text-align: center;
          margin-bottom: 1rem;
        }
        .avatar-ring {
          width: 88px; height: 88px; border-radius: 50%;
          background: linear-gradient(135deg, #1a6b4a, #34d399);
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Serif Display', serif;
          font-size: 2.2rem; color: #fff;
          margin: 0 auto 1rem;
          border: 3px solid rgba(255,255,255,0.12);
        }
        .avatar-name {
          font-family: 'DM Serif Display', serif;
          font-size: 1.3rem; color: #fff; margin: 0 0 6px;
        }
        .avatar-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(52,211,153,0.15);
          color: #34d399; border-radius: 100px;
          padding: 4px 12px; font-size: 0.7rem;
          font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
        }

        /* ── Info card ── */
        .info-card {
          background: #fff;
          border-radius: 24px;
          border: 1px solid #ece9e0;
          padding: 1.25rem 1.5rem;
        }
        .info-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #f3f0e8;
        }
        .info-row:last-child { border-bottom: none; }
        .info-icon {
          width: 36px; height: 36px; border-radius: 12px;
          background: #f3f0e8;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .info-label { font-size: 0.68rem; font-weight: 600; color: #9ca89f; text-transform: uppercase; letter-spacing: 0.07em; }
        .info-value { font-size: 0.88rem; font-weight: 500; color: #1a2e24; margin-top: 1px; }

        /* ── Tabs ── */
        .tab-bar {
          display: flex; gap: 4px;
          background: #ece9e0; border-radius: 16px;
          padding: 4px; margin-bottom: 1.5rem;
        }
        .tab-btn {
          flex: 1; padding: 10px 0; border: none; cursor: pointer;
          border-radius: 12px; font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem; font-weight: 500; transition: all 0.2s;
          background: transparent; color: #6b7c74;
        }
        .tab-btn.active {
          background: #fff; color: #0f1f17;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }

        /* ── Form card ── */
        .form-card {
          background: #fff;
          border-radius: 28px;
          border: 1px solid #ece9e0;
          padding: 2rem;
        }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .form-full { grid-column: 1 / -1; }

        .field-label {
          display: block; font-size: 0.72rem; font-weight: 600;
          color: #9ca89f; text-transform: uppercase; letter-spacing: 0.07em;
          margin-bottom: 6px;
        }
        .field-input {
          width: 100%; padding: 12px 14px;
          border: 1.5px solid #ece9e0; border-radius: 14px;
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
          color: #1a2e24; background: #fff;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .field-input:focus {
          border-color: #1a6b4a;
          box-shadow: 0 0 0 3px rgba(26,107,74,0.08);
        }
        .field-input:disabled {
          background: #f7f6f2; color: #9ca89f;
          cursor: not-allowed; border-color: #f3f0e8;
        }
        .field-input-wrap { position: relative; }
        .field-input-wrap .field-input { padding-right: 44px; }
        .eye-btn {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #9ca89f;
          display: flex; align-items: center;
        }

        /* ── Buttons ── */
        .btn-row { display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.75rem; padding-top: 1.5rem; border-top: 1px solid #f3f0e8; }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          background: #0f1f17; color: #fff; border: none;
          padding: 11px 24px; border-radius: 14px; font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem; font-weight: 600; cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .btn-primary:hover { background: #1a6b4a; }
        .btn-primary:active { transform: scale(0.98); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          background: #f3f0e8; color: #6b7c74; border: none;
          padding: 11px 20px; border-radius: 14px; font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem; font-weight: 500; cursor: pointer;
          transition: background 0.2s;
        }
        .btn-ghost:hover { background: #ece9e0; }

        .edit-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 20px; border-radius: 14px; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
          font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .edit-btn.on { background: #0f1f17; color: #fff; }
        .edit-btn.on:hover { background: #1a6b4a; }
        .edit-btn.off { background: #f3f0e8; color: #6b7c74; }
        .edit-btn.off:hover { background: #ece9e0; }

        /* ── Password strength ── */
        .strength-bar { display: flex; gap: 4px; margin-top: 6px; }
        .strength-seg {
          height: 3px; flex: 1; border-radius: 10px;
          background: #ece9e0; transition: background 0.3s;
        }
        .strength-seg.weak { background: #f87171; }
        .strength-seg.medium { background: #fbbf24; }
        .strength-seg.strong { background: #34d399; }

        /* ── Section heading ── */
        .section-heading {
          font-family: 'DM Serif Display', serif;
          font-size: 1.3rem; color: #0f1f17;
          margin: 0 0 1.5rem; font-weight: 400;
        }

        @media (max-width: 768px) {
          .layout-grid { grid-template-columns: 1fr !important; }
          .form-grid { grid-template-columns: 1fr; }
          .profile-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
        }
      `}</style>

      <div className="profile-root">
        <div className="profile-wrap">

          {/* Header */}
          <div className="profile-header">
            <div>
              <h1>My Profile</h1>
              <p>Manage your personal details and account security.</p>
            </div>
          </div>

          <div className="layout-grid" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1.5rem", alignItems: "start" }}>

            {/* Left — Avatar + info */}
            <div>
              <div className="avatar-card">
                <div className="avatar-ring">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <p className="avatar-name">{user?.name}</p>
                <span className="avatar-badge">
                  <ShieldCheck size={11} />
                  {user?.role?.replace("_", " ")}
                </span>
              </div>

              <div className="info-card">
                <div className="info-row">
                  <div className="info-icon"><Mail size={15} color="#1a6b4a" /></div>
                  <div>
                    <div className="info-label">Email</div>
                    <div className="info-value" style={{ wordBreak: "break-all" }}>{user?.email}</div>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-icon"><Calendar size={15} color="#7c6f3e" /></div>
                  <div>
                    <div className="info-label">Joined</div>
                    <div className="info-value">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </div>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-icon"><Building2 size={15} color="#6b5fa0" /></div>
                  <div>
                    <div className="info-label">Account</div>
                    <div className="info-value">{user?.isVerified ? "Verified ✓" : "Unverified"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Tabs + forms */}
            <div>
              <div className="tab-bar">
                <button className={`tab-btn ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
                  Personal Info
                </button>
                <button className={`tab-btn ${activeTab === "password" ? "active" : ""}`} onClick={() => setActiveTab("password")}>
                  Change Password
                </button>
              </div>

              {activeTab === "profile"
                ? <ProfileForm user={user} />
                : <PasswordForm />
              }
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

/* ============================================================
   PROFILE FORM
============================================================ */
const ProfileForm = ({ user }: { user: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    name: "", phone: "", city: "", state: ""
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        city: user.address?.city || "",
        state: user.address?.state || ""
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    if (form.phone && !/^\d{10}$/.test(form.phone)) return toast.error("Phone must be 10 digits");

    setSaving(true);
    try {
      await userAPI.updateProfile({
        name: form.name,
        phone: form.phone,
        address: { city: form.city, state: form.state }
      });
      toast.success("Profile updated!");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof ProfileForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form className="form-card" onSubmit={handleSave}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <p className="section-heading" style={{ margin: 0 }}>Personal Information</p>
        <button
          type="button"
          className={`edit-btn ${isEditing ? "off" : "on"}`}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <><X size={14} /> Cancel</> : <><Pencil size={14} /> Edit</>}
        </button>
      </div>

      <div className="form-grid">
        <Field label="Full Name" value={form.name} onChange={set("name")} disabled={!isEditing} placeholder="Your full name" />
        <Field label="Phone Number" value={form.phone} onChange={set("phone")} disabled={!isEditing} placeholder="10-digit number" />
        <Field label="City" value={form.city} onChange={set("city")} disabled={!isEditing} placeholder="e.g. Delhi" />
        <Field label="State" value={form.state} onChange={set("state")} disabled={!isEditing} placeholder="e.g. Uttar Pradesh" />
      </div>

      {isEditing && (
        <div className="btn-row">
          <button type="button" className="btn-ghost" onClick={() => setIsEditing(false)}>
            Discard
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}
    </form>
  );
};

/* ============================================================
   PASSWORD FORM
============================================================ */
const PasswordForm = () => {
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const [form, setForm] = useState<PasswordForm>({ oldPassword: "", newPassword: "", confirmPassword: "" });

  const strength = (() => {
    const p = form.newPassword;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++;
    if (p.length >= 10 && /[^a-zA-Z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Medium", "Strong"][strength];
  const strengthColor = ["", "#f87171", "#fbbf24", "#34d399"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.oldPassword) return toast.error("Enter your current password");
    if (form.newPassword.length < 6) return toast.error("New password must be at least 6 characters");
    if (form.newPassword !== form.confirmPassword) return toast.error("Passwords do not match");

    setSaving(true);
    try {
      await userAPI.changePassword(form);
      toast.success("Password changed successfully!");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const toggle = (k: keyof typeof show) => setShow(s => ({ ...s, [k]: !s[k] }));
  const set = (k: keyof PasswordForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <p className="section-heading">Change Password</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <PasswordField
          label="Current Password"
          value={form.oldPassword}
          onChange={set("oldPassword")}
          show={show.old}
          onToggle={() => toggle("old")}
        />
        <div>
          <PasswordField
            label="New Password"
            value={form.newPassword}
            onChange={set("newPassword")}
            show={show.new}
            onToggle={() => toggle("new")}
          />
          {form.newPassword && (
            <div style={{ marginTop: 8 }}>
              <div className="strength-bar">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`strength-seg ${i <= strength ? (strength === 1 ? "weak" : strength === 2 ? "medium" : "strong") : ""}`} />
                ))}
              </div>
              <span style={{ fontSize: "0.72rem", color: strengthColor, fontWeight: 600, marginTop: 4, display: "block" }}>
                {strengthLabel}
              </span>
            </div>
          )}
        </div>
        <PasswordField
          label="Confirm New Password"
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          show={show.confirm}
          onToggle={() => toggle("confirm")}
          error={form.confirmPassword && form.confirmPassword !== form.newPassword ? "Passwords do not match" : ""}
        />
      </div>

      <div className="btn-row">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
          {saving ? "Updating…" : "Update Password"}
        </button>
      </div>
    </form>
  );
};

/* ============================================================
   FIELD COMPONENTS
============================================================ */
const Field = ({ label, value, onChange, disabled, placeholder }: {
  label: string; value: string;
  onChange: (v: string) => void;
  disabled: boolean; placeholder?: string;
}) => (
  <div>
    <label className="field-label">{label}</label>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className="field-input"
    />
  </div>
);

const PasswordField = ({ label, value, onChange, show, onToggle, error }: {
  label: string; value: string;
  onChange: (v: string) => void;
  show: boolean; onToggle: () => void;
  error?: string;
}) => (
  <div>
    <label className="field-label">{label}</label>
    <div className="field-input-wrap">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="field-input"
        placeholder="••••••••"
        autoComplete="new-password"
      />
      <button type="button" className="eye-btn" onClick={onToggle}>
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
    {error && <p style={{ fontSize: "0.75rem", color: "#f87171", marginTop: 5 }}>{error}</p>}
  </div>
);

export default UserProfile;