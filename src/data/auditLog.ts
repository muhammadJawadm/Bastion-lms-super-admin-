import { COMPANIES } from "./companies";

export type AuditCategory = "Company" | "Content" | "Auth" | "Support" | "Billing";

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  category: AuditCategory;
  timestamp: string;
  affectedTenant?: string;
  affectedRecord: string;
  sourceIp: string;
  reason?: string;
  before?: string;
  after?: string;
}

const co = (i: number) => COMPANIES[i];

export const AUDIT_LOG: AuditEvent[] = [
  { id: "a1", actor: "Super Admin", action: "Company suspended", category: "Company", timestamp: "18 Aug 2026 09:14", affectedTenant: co(7).name, affectedRecord: co(7).id, sourceIp: "203.0.113.14", reason: "Two consecutive failed payments", before: "status: Active", after: "status: Suspended" },
  { id: "a2", actor: "Super Admin", action: "Entitlement changed", category: "Company", timestamp: "17 Aug 2026 14:02", affectedTenant: co(3).name, affectedRecord: co(3).id, sourceIp: "203.0.113.14", before: "seats: 320", after: "seats: 340" },
  { id: "a3", actor: "Danny Osei", action: "Course version published", category: "Content", timestamp: "16 Aug 2026 11:47", affectedRecord: "co1 — Excavation Safety Fundamentals", sourceIp: "198.51.100.22", before: "v3.0", after: "v3.1" },
  { id: "a4", actor: "Danny Osei", action: "Forced version update pushed to clients", category: "Content", timestamp: "16 Aug 2026 11:52", affectedRecord: "co1 — Excavation Safety Fundamentals", sourceIp: "198.51.100.22", reason: "Regulatory citation correction, all clients required to move to v3.1", before: "8 clients on mixed versions", after: "8 clients on v3.1" },
  { id: "a5", actor: "Priya Shah", action: "Form distributed to company", category: "Content", timestamp: "15 Aug 2026 16:30", affectedTenant: co(1).name, affectedRecord: "t9 — Trench Inspection (Coastal Excavation)", sourceIp: "198.51.100.40" },
  { id: "a6", actor: "Support: Jordan Kim", action: "Support session started", category: "Support", timestamp: "15 Aug 2026 10:05", affectedTenant: co(4).name, affectedRecord: "session s2", sourceIp: "198.51.100.7", reason: "Ticket #4821 — client reports employee cannot see assigned course" },
  { id: "a7", actor: "Support: Jordan Kim", action: "Support session ended", category: "Support", timestamp: "15 Aug 2026 10:22", affectedTenant: co(4).name, affectedRecord: "session s2", sourceIp: "198.51.100.7" },
  { id: "a8", actor: "Super Admin", action: "MFA reset", category: "Auth", timestamp: "14 Aug 2026 08:51", affectedTenant: co(6).name, affectedRecord: "Todd Warrick", sourceIp: "203.0.113.14", reason: "User lost authenticator device" },
  { id: "a9", actor: "Unknown", action: "Access denied — invalid tenant context", category: "Auth", timestamp: "13 Aug 2026 22:47", affectedRecord: "API request to /companies/c1/courses", sourceIp: "192.0.2.88" },
  { id: "a10", actor: "Super Admin", action: "Billing profile updated", category: "Billing", timestamp: "12 Aug 2026 13:10", affectedTenant: co(4).name, affectedRecord: co(4).id, sourceIp: "203.0.113.14", before: "discount: 8%", after: "discount: 12%" },
  { id: "a11", actor: "System", action: "Invoice payment failed", category: "Billing", timestamp: "11 Aug 2026 03:00", affectedTenant: co(7).name, affectedRecord: "INV-2026-0809", sourceIp: "—" },
  { id: "a12", actor: "Super Admin", action: "New company onboarded", category: "Company", timestamp: "20 Aug 2026 09:00", affectedTenant: co(10).name, affectedRecord: co(10).id, sourceIp: "203.0.113.14" },
  { id: "a13", actor: "Marisol Cruz", action: "Course archived", category: "Content", timestamp: "10 Aug 2026 15:44", affectedRecord: "co10 — Environmental Spill Response", sourceIp: "198.51.100.22", reason: "Client contract not renewed" },
  { id: "a14", actor: "Super Admin", action: "Export generated", category: "Auth", timestamp: "09 Aug 2026 17:20", affectedRecord: "Compliance report — all clients", sourceIp: "203.0.113.14" },
  { id: "a15", actor: "Super Admin", action: "Role changed", category: "Auth", timestamp: "08 Aug 2026 12:00", affectedTenant: co(0).name, affectedRecord: "Rachel Voss", sourceIp: "203.0.113.14", before: "role: Employee", after: "role: Company Admin" },
];
