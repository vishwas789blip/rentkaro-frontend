import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { userAPI } from "@/api";
import { Loader2, ShieldCheck, Pencil, X, Save, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ── Reusing shared components ─────────────────────────────────
import { Input, Label, InputWrapper } from "@/components/FormInput";
import PrimaryButton                  from "@/components/PrimaryButton";
import Alert                          from "@/components/Alert";

// ── Avatar initials helper ────────────────────────────────────
function initials(name: string) {
  return (name || "U")
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Color based on first char — consistent per user
const AVATAR_COLORS = ["#1DB47F","#6366F1","#F59E0B","#EF4444","#8B5CF6","#EC4899"];
function avatarColor(name: string) {
  return AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

// ── AvatarCard ────────────────────────────────────────────────
const AvatarCard = ({ user }: { user: any }) => (
  <div style={{
    background: "linear-gradient(145deg, #0f1f17 0%, #1a3828 100%)",
    borderRadius: 20, padding: "28px 20px", textAlign: "center",
  }}>
    <div style={{
      width: 80, height: 80, borderRadius: "50%",
      background: avatarColor(user?.name || ""),
      margin: "0 auto 14px",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 26, fontWeight: 800, color: "#fff",
      border: "3px solid rgba(255,255,255,0.15)",
      fontFamily: "Georgia, serif",
    }}>
      {initials(user?.name || "")}
    </div>
    <p style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: "0 0 8px", fontFamily: "Georgia, serif" }}>
      {user?.name}
    </p>
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "rgba(29,180,127,0.2)", color: "#34D399",
      borderRadius: 999, padding: "4px 12px",
      fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
    }}>
      <ShieldCheck size={10} />
      {user?.role?.replace("_", " ")}
    </span>
  </div>
);

// ── InfoCard ──────────────────────────────────────────────────
const InfoCard = ({ user }: { user: any }) => {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
      <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 16, padding: "6px 0" }}>
        {[
          { label: "Email",   value: user?.email },
          { label: "Phone",   value: user?.phone || "—" },
          { label: "Role",    value: user?.role?.replace("_", " ") },
          { label: "Status",  value: "Verified ✓" },
        ].map(row => (
          <div key={row.label} style={{
            padding: "11px 16px",
            borderBottom: "1px solid #F9FAFB",
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
              {row.label}
            </p>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#111827", margin: "2px 0 0", wordBreak: "break-all" }}>
              {row.value}
            </p>
          </div>
        ))}
      </div>

      {/* Dynamic Link Configuration Button to route into Change Password view */}
      <button
        type="button"
        onClick={() => navigate("/change-password")}
        style={{
          width: "100%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background: "#FFF",
          color: "#EF4444",
          border: "1.5px solid #FCA5A5",
          borderRadius: 16,
          padding: "12px",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#FEF2F2";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#FFF";
        }}
      >
        <Lock size={14} />
        Change Password
      </button>
    </div>
  );
};

// ── ProfileForm ───────────────────────────────────────────────
const ProfileForm = ({ user, setUser }: { user: any; setUser: any }) => {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [message, setMessage] = useState("");
  const [error,   setError]   = useState("");
  const [form, setForm]       = useState({ name: "", phone: "" });

  useEffect(() => {
    if (user) setForm({ name: user.name || "", phone: user.phone || "" });
  }, [user]);

  const set = (k: "name" | "phone") => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCancel = () => {
    setForm({ name: user?.name || "", phone: user?.phone || "" });
    setError(""); setMessage("");
    setEditing(false);
  };

  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(""); setMessage("");
    if (!form.name.trim())                           return setError("Name is required");
    if (form.phone && !/^\d{10}$/.test(form.phone)) return setError("Phone must be exactly 10 digits");

    setSaving(true);
    try {
      const res     = await userAPI.updateProfile({ name: form.name, phone: form.phone });
      const updated = res.data?.data?.user || res.data?.user;
      if (updated && setUser) setUser((prev: any) => ({ ...prev, ...updated }));
      setMessage("Profile updated successfully!");
      setEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Update failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 20, padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0, fontFamily: "Georgia, serif" }}>
          Personal Information
        </h2>
        <button type="button" onClick={() => editing ? handleCancel() : setEditing(true)} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: editing ? "#F3F4F6" : "#111827",
          color: editing ? "#6B7280" : "#fff",
          border: "none", borderRadius: 10, padding: "9px 18px",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>
          {editing ? <><X size={13} /> Cancel</> : <><Pencil size={13} /> Edit</>}
        </button>
      </div>

      {message && <Alert type="success" message={message} />}
      {error   && <Alert type="error"   message={error}   />}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <InputWrapper>
          <Label>Full Name</Label>
          <Input
            type="text"
            placeholder="Your full name"
            value={form.name}
            onChange={set("name")}
            disabled={!editing}
          />
        </InputWrapper>
        <InputWrapper>
          <Label>Phone Number</Label>
          <Input
            type="text"
            placeholder="10-digit mobile"
            value={form.phone}
            onChange={set("phone")}
            disabled={!editing}
          />
        </InputWrapper>
      </div>

      <InputWrapper>
        <Label>Email Address</Label>
        <Input type="email" value={user?.email || ""} disabled />
        <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 5 }}>
          Email cannot be changed. Contact support if needed.
        </p>
      </InputWrapper>

      <InputWrapper>
        <Label>Account Role</Label>
        <Input
          type="text"
          value={(user?.role || "").replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
          disabled
        />
        <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 5 }}>
          Role is assigned by the platform.
        </p>
      </InputWrapper>

      {editing && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 20, borderTop: "1px solid #F3F4F6" }}>
          <button type="button" onClick={handleCancel} style={{
            background: "#F3F4F6", color: "#6B7280", border: "none",
            borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            Discard
          </button>
          <PrimaryButton type="submit" loading={saving}>
            <Save size={14} /> Save Changes
          </PrimaryButton>
        </div>
      )}
    </form>
  );
};

// ── Main Page ─────────────────────────────────────────────────
const UserProfile = () => {
  const { user, loading: authLoading, setUser } = useAuth();

  if (authLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" size={36} style={{ color: "#1DB47F" }} />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <style>{`
        @keyframes rk-fade { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        .rk-fade { animation: rk-fade 0.25s ease; }
        @media (max-width: 768px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px", fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: 0, fontFamily: "Georgia, serif" }}>
            My Profile
          </h1>
          <p style={{ color: "#6B7280", fontSize: 14, marginTop: 4 }}>
            Manage your personal details and account configurations
          </p>
        </div>

        <div className="profile-grid" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "start" }}>
          <div>
            <AvatarCard user={user} />
            <InfoCard   user={user} />
          </div>

          <div className="rk-fade">
            <ProfileForm user={user} setUser={setUser} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;