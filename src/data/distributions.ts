import type { Ownership } from "./catalog";
import { COMPANIES } from "./companies";

export interface DistributionRecord {
  id: string;
  contentId: string;
  contentType: "course" | "form";
  contentTitle: string;
  companyId: string;
  companyName: string;
  ownership: Ownership;
  clientVersion: string;
  currentMasterVersion: string;
  availabilityDate: string;
  expirationDate: string | null;
  requiredTier: "Starter" | "Professional" | "Enterprise";
  revocationDate: string | null;
  status: "Active" | "Scheduled" | "Expired" | "Revoked";
}

const co = (i: number) => COMPANIES[i];

export const DISTRIBUTIONS: DistributionRecord[] = [
  { id: "d1", contentId: "co1", contentType: "course", contentTitle: "Excavation Safety Fundamentals", companyId: co(0).id, companyName: co(0).name, ownership: "Shared Content", clientVersion: "v3.1", currentMasterVersion: "v3.1", availabilityDate: "20 Jan 2024", expirationDate: null, requiredTier: "Starter", revocationDate: null, status: "Active" },
  { id: "d2", contentId: "co1", contentType: "course", contentTitle: "Excavation Safety Fundamentals", companyId: co(1).id, companyName: co(1).name, ownership: "Shared Content", clientVersion: "v2.9", currentMasterVersion: "v3.1", availabilityDate: "05 Apr 2024", expirationDate: null, requiredTier: "Starter", revocationDate: null, status: "Active" },
  { id: "d3", contentId: "co1", contentType: "course", contentTitle: "Excavation Safety Fundamentals", companyId: co(6).id, companyName: co(6).name, ownership: "Shared Content", clientVersion: "v3.1", currentMasterVersion: "v3.1", availabilityDate: "30 Jul 2023", expirationDate: null, requiredTier: "Starter", revocationDate: null, status: "Active" },
  { id: "d4", contentId: "co4", contentType: "course", contentTitle: "Electrical Safety — Arc Flash", companyId: co(2).id, companyName: co(2).name, ownership: "Shared Content", clientVersion: "v1.2", currentMasterVersion: "v1.2", availabilityDate: "01 Jul 2024", expirationDate: null, requiredTier: "Professional", revocationDate: null, status: "Active" },
  { id: "d5", contentId: "co4", contentType: "course", contentTitle: "Electrical Safety — Arc Flash", companyId: co(3).id, companyName: co(3).name, ownership: "Shared Content", clientVersion: "v1.0", currentMasterVersion: "v1.2", availabilityDate: "12 Sep 2023", expirationDate: null, requiredTier: "Professional", revocationDate: null, status: "Active" },
  { id: "d6", contentId: "co5", contentType: "course", contentTitle: "Titan Steel — Site Orientation", companyId: co(0).id, companyName: co(0).name, ownership: "Client Exclusive", clientVersion: "v1.0", currentMasterVersion: "v1.0", availabilityDate: "18 Jan 2024", expirationDate: null, requiredTier: "Enterprise", revocationDate: null, status: "Active" },
  { id: "d7", contentId: "co10", contentType: "course", contentTitle: "Environmental Spill Response", companyId: co(9).id, companyName: co(9).name, ownership: "Client Exclusive", clientVersion: "v1.0", currentMasterVersion: "v1.0", availabilityDate: "22 Aug 2022", expirationDate: "22 Aug 2025", requiredTier: "Professional", revocationDate: "22 Aug 2025", status: "Revoked" },
  { id: "d8", contentId: "t1", contentType: "form", contentTitle: "Job Hazard Analysis (JHA)", companyId: co(0).id, companyName: co(0).name, ownership: "Shared Content", clientVersion: "v4.0", currentMasterVersion: "v4.0", availabilityDate: "18 Jan 2024", expirationDate: null, requiredTier: "Starter", revocationDate: null, status: "Active" },
  { id: "d9", contentId: "t1", contentType: "form", contentTitle: "Job Hazard Analysis (JHA)", companyId: co(4).id, companyName: co(4).name, ownership: "Shared Content", clientVersion: "v3.2", currentMasterVersion: "v4.0", availabilityDate: "05 Feb 2025", expirationDate: null, requiredTier: "Starter", revocationDate: null, status: "Active" },
  { id: "d10", contentId: "t7", contentType: "form", contentTitle: "Titan Steel — Daily Site Audit", companyId: co(0).id, companyName: co(0).name, ownership: "Client Exclusive", clientVersion: "v1.0", currentMasterVersion: "v1.0", availabilityDate: "22 Jan 2024", expirationDate: null, requiredTier: "Enterprise", revocationDate: null, status: "Active" },
  { id: "d11", contentId: "t4", contentType: "form", contentTitle: "Equipment Pre-Use Inspection", companyId: co(5).id, companyName: co(5).name, ownership: "Shared Content", clientVersion: "v3.0", currentMasterVersion: "v3.0", availabilityDate: "19 Nov 2023", expirationDate: null, requiredTier: "Professional", revocationDate: null, status: "Active" },
  { id: "d12", contentId: "co1", contentType: "course", contentTitle: "Excavation Safety Fundamentals", companyId: co(10).id, companyName: co(10).name, ownership: "Shared Content", clientVersion: "v3.1", currentMasterVersion: "v3.1", availabilityDate: "01 Sep 2026", expirationDate: null, requiredTier: "Starter", revocationDate: null, status: "Scheduled" },
  { id: "d13", contentId: "t9", contentType: "form", contentTitle: "Trench Inspection — Coastal Excavation", companyId: co(1).id, companyName: co(1).name, ownership: "Client Editable Copy", clientVersion: "v1.0", currentMasterVersion: "v1.0", availabilityDate: "—", expirationDate: null, requiredTier: "Professional", revocationDate: null, status: "Scheduled" },
  { id: "d14", contentId: "co9", contentType: "course", contentTitle: "PPE Selection & Use", companyId: co(7).id, companyName: co(7).name, ownership: "Shared Content", clientVersion: "v1.4", currentMasterVersion: "v2.0", availabilityDate: "14 Dec 2024", expirationDate: "17 Jun 2026", requiredTier: "Starter", revocationDate: null, status: "Expired" },
];

export function distributionsForContent(contentId: string) {
  return DISTRIBUTIONS.filter((d) => d.contentId === contentId);
}
export function distributionsForCompany(companyId: string) {
  return DISTRIBUTIONS.filter((d) => d.companyId === companyId);
}
