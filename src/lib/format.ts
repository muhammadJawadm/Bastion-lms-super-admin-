import type { CourseStatus, Role } from "./types";

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatBytes(bytes?: number): string {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function initials(name?: string): string {
  if (!name) return "?";
  return name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-orange-500",
  "bg-pink-500", "bg-cyan-500", "bg-rose-500", "bg-indigo-500",
];
export function avatarColor(seed?: string): string {
  if (!seed) return AVATAR_COLORS[0];
  return AVATAR_COLORS[seed.charCodeAt(0) % AVATAR_COLORS.length];
}

export const ROLE_LABEL: Record<Role, string> = {
  platform_admin: "Super Admin",
  client_admin: "Company Admin",
  user: "Employee",
};

export const INDUSTRIES = ["Construction", "Excavation", "Electrical", "Utilities", "Manufacturing", "Oil & Gas", "Roofing", "Demolition"];

export function courseStatusVariant(s: CourseStatus): "success" | "neutral" | "warning" {
  if (s === "published") return "success";
  if (s === "archived") return "warning";
  return "neutral";
}

export function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint32Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("") + "!7";
}

export function titleCase(s?: string): string {
  if (!s) return "—";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// API amounts are in the smallest currency unit (cents for USD), per Stripe's convention.
export function formatMoney(minorUnits?: number | null, currency = "usd"): string {
  if (minorUnits === undefined || minorUnits === null) return "—";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(minorUnits / 100);
  } catch {
    return `${(minorUnits / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export const SUBSCRIPTION_STATUS_LABEL: Record<string, string> = {
  trialing: "Trialing",
  active: "Active",
  past_due: "Past due",
  canceled: "Canceled",
  incomplete: "Incomplete",
  incomplete_expired: "Incomplete (expired)",
  unpaid: "Unpaid",
};

export function subscriptionStatusVariant(s: string): "success" | "danger" | "warning" | "info" | "neutral" {
  if (s === "active") return "success";
  if (s === "trialing") return "info";
  if (s === "past_due" || s === "unpaid") return "danger";
  if (s === "incomplete" || s === "incomplete_expired") return "warning";
  return "neutral";
}

export function invoiceStatusVariant(s: string): "success" | "danger" | "warning" | "info" | "neutral" {
  if (s === "paid") return "success";
  if (s === "payment_failed" || s === "uncollectible") return "danger";
  if (s === "open") return "warning";
  if (s === "draft") return "info";
  return "neutral";
}
