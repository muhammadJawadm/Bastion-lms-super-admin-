export type Ownership =
  | "Bastion Master"
  | "Client Exclusive"
  | "Shared Content"
  | "Client Editable Copy"
  | "Locked Client Copy";

export interface VersionEntry {
  version: string;
  date: string;
  author: string;
  reviewer: string;
  summary: string;
  publicationState: "Published" | "Draft" | "Archived";
}

export const COURSE_CATEGORIES = [
  "Excavation & Trenching",
  "Fall Protection",
  "Confined Space",
  "Electrical Safety",
  "Equipment Operation",
  "Hazard Communication",
  "PPE",
  "Emergency Response",
  "Environmental Compliance",
  "General Orientation",
];

export const TEMPLATE_CATEGORIES = [
  "JHA / JSA",
  "Daily Audits",
  "Permits",
  "Equipment Inspection",
  "Toolbox Talks",
  "Incident Reports",
  "Pre-Task Plans",
  "Corrective Actions",
];

export const INDUSTRY_TAGS = [
  "Construction",
  "Oil & Gas",
  "Utilities",
  "Manufacturing",
  "Demolition",
  "Electrical",
  "Roofing",
  "Excavation",
];

export const HAZARD_TAGS = [
  "Fall Hazard",
  "Confined Space",
  "Electrical",
  "Struck-By",
  "Caught-In/Between",
  "Chemical Exposure",
  "Noise",
  "Heat Stress",
  "Excavation Collapse",
  "Fire/Explosion",
];
