import { COMPANIES } from "./companies";

export interface SupportSession {
  id: string;
  supportUser: string;
  companyId: string;
  companyName: string;
  reason: string;
  ticketRef: string;
  accessLevel: "Read-only" | "Elevated";
  startTime: string;
  endTime: string | null;
  actions: string[];
}

const co = (i: number) => COMPANIES[i];

export const SUPPORT_SESSIONS: SupportSession[] = [
  { id: "s1", supportUser: "Super Admin", companyId: co(4).id, companyName: co(4).name, reason: "Investigate overdue invoice dispute", ticketRef: "#4790", accessLevel: "Read-only", startTime: "19 Aug 2026 09:12", endTime: "19 Aug 2026 09:31", actions: ["Viewed billing tab", "Viewed invoice INV-2026-0808"] },
  { id: "s2", supportUser: "Jordan Kim", companyId: co(3).id, companyName: co(3).name, reason: "Client reports employee cannot see assigned course", ticketRef: "#4821", accessLevel: "Elevated", startTime: "15 Aug 2026 10:05", endTime: "15 Aug 2026 10:22", actions: ["Viewed user roster", "Re-synced course assignment for user"] },
  { id: "s3", supportUser: "Super Admin", companyId: co(0).id, companyName: co(0).name, reason: "Pre-renewal account health check", ticketRef: "—", accessLevel: "Read-only", startTime: "10 Aug 2026 14:00", endTime: "10 Aug 2026 14:08", actions: ["Viewed overview tab"] },
  { id: "s4", supportUser: "Super Admin", companyId: co(7).id, companyName: co(7).name, reason: "Verify suspension applied correctly after failed payment", ticketRef: "#4650", accessLevel: "Read-only", startTime: "18 Aug 2026 09:16", endTime: "18 Aug 2026 09:20", actions: ["Viewed billing tab"] },
];
