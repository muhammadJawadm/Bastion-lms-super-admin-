import type { Ownership, VersionEntry } from "./catalog";

export interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "checkbox" | "select" | "photo" | "signature";
  required: boolean;
  options?: string[];
}

export interface FormProduct {
  id: string;
  title: string;
  category: string;
  ownership: Ownership;
  status: "Published" | "Draft" | "Archived";
  clientsUsing: number;
  submissionsPerWeek: number;
  required: boolean;
  version: string;
  versionHistory: VersionEntry[];
  fields: FormField[];
}

const stdFields: FormField[] = [
  { id: "f1", label: "Site / Location", type: "text", required: true },
  { id: "f2", label: "Supervisor Name", type: "text", required: true },
  { id: "f3", label: "Hazards Identified", type: "checkbox", required: true, options: ["Fall Hazard", "Struck-By", "Caught-In/Between", "Electrical", "Chemical Exposure"] },
  { id: "f4", label: "Photo Evidence", type: "photo", required: false },
  { id: "f5", label: "Signature", type: "signature", required: true },
];

export const FORMS: FormProduct[] = [
  { id: "t1", title: "Job Hazard Analysis (JHA)", category: "JHA / JSA", ownership: "Bastion Master", status: "Published", clientsUsing: 9, submissionsPerWeek: 312, required: true, version: "v4.0",
    versionHistory: [
      { version: "v4.0", date: "10 Jun 2026", author: "Marisol Cruz", reviewer: "Danny Osei", summary: "Added chemical exposure hazard option.", publicationState: "Published" },
      { version: "v3.2", date: "02 Jan 2026", author: "Marisol Cruz", reviewer: "Danny Osei", summary: "Field relabeling for clarity.", publicationState: "Archived" },
    ], fields: stdFields },
  { id: "t2", title: "Trench & Excavation Inspection", category: "Daily Audits", ownership: "Bastion Master", status: "Published", clientsUsing: 5, submissionsPerWeek: 148, required: true, version: "v2.2",
    versionHistory: [{ version: "v2.2", date: "22 Mar 2026", author: "Jon Ackerman", reviewer: "Priya Shah", summary: "Added spoil pile setback field.", publicationState: "Published" }], fields: stdFields },
  { id: "t3", title: "Confined Space Entry Permit", category: "Permits", ownership: "Bastion Master", status: "Published", clientsUsing: 4, submissionsPerWeek: 62, required: true, version: "v1.6",
    versionHistory: [{ version: "v1.6", date: "15 Feb 2026", author: "Jon Ackerman", reviewer: "Priya Shah", summary: "Atmospheric monitoring field added.", publicationState: "Published" }], fields: stdFields },
  { id: "t4", title: "Equipment Pre-Use Inspection", category: "Equipment Inspection", ownership: "Shared Content", status: "Published", clientsUsing: 8, submissionsPerWeek: 401, required: true, version: "v3.0",
    versionHistory: [{ version: "v3.0", date: "01 Aug 2026", author: "Marisol Cruz", reviewer: "Danny Osei", summary: "Simplified equipment ID lookup.", publicationState: "Published" }], fields: stdFields },
  { id: "t5", title: "Toolbox Talk Sign-In", category: "Toolbox Talks", ownership: "Bastion Master", status: "Published", clientsUsing: 9, submissionsPerWeek: 210, required: false, version: "v1.3",
    versionHistory: [{ version: "v1.3", date: "18 May 2026", author: "Marisol Cruz", reviewer: "Danny Osei", summary: "Minor copy edits.", publicationState: "Published" }], fields: stdFields },
  { id: "t6", title: "Near-Miss / Incident Report", category: "Incident Reports", ownership: "Bastion Master", status: "Published", clientsUsing: 9, submissionsPerWeek: 24, required: false, version: "v2.0",
    versionHistory: [{ version: "v2.0", date: "09 Apr 2026", author: "Jon Ackerman", reviewer: "Priya Shah", summary: "Added witness contact field.", publicationState: "Published" }], fields: stdFields },
  { id: "t7", title: "Titan Steel — Daily Site Audit", category: "Daily Audits", ownership: "Client Exclusive", status: "Published", clientsUsing: 1, submissionsPerWeek: 38, required: true, version: "v1.0",
    versionHistory: [{ version: "v1.0", date: "22 Jan 2024", author: "Jon Ackerman", reviewer: "Priya Shah", summary: "Initial client-exclusive build for Titan Steel.", publicationState: "Published" }], fields: stdFields },
  { id: "t8", title: "Hot Work Permit", category: "Permits", ownership: "Bastion Master", status: "Draft", clientsUsing: 0, submissionsPerWeek: 0, required: true, version: "v0.4",
    versionHistory: [{ version: "v0.4", date: "20 Jul 2026", author: "Marisol Cruz", reviewer: "—", summary: "In-progress draft.", publicationState: "Draft" }], fields: stdFields },
  { id: "t9", title: "Trench Inspection — Coastal Excavation", category: "Daily Audits", ownership: "Client Editable Copy", status: "Draft", clientsUsing: 0, submissionsPerWeek: 0, required: true, version: "v1.0",
    versionHistory: [{ version: "v1.0", date: "19 Aug 2026", author: "Jon Ackerman", reviewer: "Priya Shah", summary: "Client-approved customization, pending publish.", publicationState: "Draft" }], fields: stdFields },
  { id: "t10", title: "Corrective Action Follow-Up", category: "Corrective Actions", ownership: "Bastion Master", status: "Published", clientsUsing: 9, submissionsPerWeek: 41, required: false, version: "v1.1",
    versionHistory: [{ version: "v1.1", date: "11 Jun 2026", author: "Marisol Cruz", reviewer: "Danny Osei", summary: "Added due-date field.", publicationState: "Published" }], fields: stdFields },
];

export function formById(id: string): FormProduct | undefined {
  return FORMS.find((f) => f.id === id);
}
