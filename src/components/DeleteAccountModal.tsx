import { X, AlertTriangle } from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteAccountModal({
  open,
  onClose,
  onConfirm
}: Props) {

  if (!open) return null;

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.4)",
        backdropBlur: "2px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zindex: 9999,
        padding: "16px",
        fontFamily: "Inter, system-ui, sans-serif"
      }}
    >
      <div 
        style={{
          background: "#fff",
          padding: "28px",
          borderRadius: 20,
          width: "100%",
          maxWidth: 400,
          border: "1.5px solid #E5E7EB",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          position: "relative"
        }}
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            right: 18,
            top: 18,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#9CA3AF"
          }}
        >
          <X size={18} />
        </button>

        {/* Header Icon + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ background: "#FEF2F2", p: "8px", borderRadius: 10, display: "flex", color: "#EF4444" }}>
            <AlertTriangle size={20} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0, fontFamily: "Georgia, serif" }}>
            Delete Account
          </h2>
        </div>

        {/* Content Statement */}
        <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.5, margin: "0 0 24px" }}>
          Are you completely sure? This action is permanent, cannot be reversed, and will instantly purge your platform profile data configuration links.
        </p>

        {/* Form Action Buttons Container */}
        <div style={{ display: "flex", justifycontent: "flex-end", gap: 10 }}>
          <button 
            type="button" 
            onClick={onClose} 
            style={{
              background: "#F3F4F6", 
              color: "#6B7280", 
              border: "none",
              borderRadius: 12, 
              padding: "12px 20px", 
              fontSize: 13, 
              fontWeight: 700, 
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
          
          <PrimaryButton 
            type="button" 
            onClick={onConfirm}
            style={{
              background: "#EF4444"
            }}
          >
            Confirm Delete
          </PrimaryButton>
        </div>

      </div>
    </div>
  );
}