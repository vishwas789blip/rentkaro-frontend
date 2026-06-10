import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ── Existing ─────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Email helpers ─────────────────────────────────────────────

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(local.length - 2, 3))}@${domain}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidOTP(otp: string, length = 6): boolean {
  return new RegExp(`^\\d{${length}}$`).test(otp.trim());
}

// ── Password helpers ──────────────────────────────────────────

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Empty" | "Weak" | "Fair" | "Good" | "Strong";
  color: string;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: "Empty", color: "#E5E7EB" };

  let score = 0;
  if (password.length >= 8)          score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const map: Record<number, Omit<PasswordStrength, "score">> = {
    0: { label: "Weak",   color: "#EF4444" },
    1: { label: "Weak",   color: "#EF4444" },
    2: { label: "Fair",   color: "#F97316" },
    3: { label: "Good",   color: "#EAB308" },
    4: { label: "Strong", color: "#22C55E" },
  };

  return { score: score as PasswordStrength["score"], ...map[score] };
}

export function getPasswordErrors(password: string): string[] {
  const errs: string[] = [];
  if (password.length < 8)            errs.push("At least 8 characters");
  if (!/[A-Z]/.test(password))        errs.push("At least one uppercase letter");
  if (!/[0-9]/.test(password))        errs.push("At least one number");
  if (!/[^A-Za-z0-9]/.test(password)) errs.push("At least one special character");
  return errs;
}

// ── Timer helpers ─────────────────────────────────────────────

export function getRemainingSeconds(startedAt: number, durationSecs: number): number {
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  return Math.max(0, durationSecs - elapsed);
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}