import { COMPANIES } from "./companies";

export type RequestStatus =
  | "Requested"
  | "Scoping"
  | "In Development"
  | "Internal Review"
  | "Client Review"
  | "Ready to Publish"
  | "Published"
  | "On Hold"
  | "Cancelled";

export const REQUEST_STATUSES: RequestStatus[] = [
  "Requested", "Scoping", "In Development", "Internal Review",
  "Client Review", "Ready to Publish", "Published", "On Hold", "Cancelled",
];

export interface ContentRequest {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  contentType: "Course" | "Form" | "Bundle" | "Certificate Layout";
  description: string;
  requestedScope: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  dueDate: string;
  sowReference: string;
  status: RequestStatus;
  assignedDeveloper: string;
  internalReviewer: string;
  owner: string;
  contributors: string[];
  internalNotes: string;
  clientVisibleNotes: string;
  linkedContentId?: string;
  linkedContentType?: "course" | "form";
  createdAt: string;
  deliveredAt?: string;
  revisionHistory: { date: string; author: string; summary: string }[];
}

export const CONTENT_REQUESTS: ContentRequest[] = [
  {
    id: "req1", title: "Bilingual JHA Templates (Spanish)", companyId: COMPANIES[0].id, companyName: COMPANIES[0].name,
    contentType: "Form", description: "Spanish-language versions of the standard JHA form for Spanish-speaking crews.",
    requestedScope: "Translate existing 6-question JHA into Spanish, keep identical logic and required fields.",
    priority: "Medium", dueDate: "05 Sep 2026", sowReference: "SOW-TSE-2026-03", status: "In Development",
    assignedDeveloper: "Marisol Cruz", internalReviewer: "Danny Osei", owner: "Danny Osei", contributors: ["Marisol Cruz"],
    internalNotes: "Using existing JHA v4.0 as base; confirm terminology with client before client review.",
    clientVisibleNotes: "In progress — targeting early September delivery.",
    linkedContentId: "t1", linkedContentType: "form", createdAt: "12 Aug 2026",
    revisionHistory: [{ date: "14 Aug 2026", author: "Marisol Cruz", summary: "Scope confirmed with client contact." }],
  },
  {
    id: "req2", title: "Confined Space Entry — Field Update", companyId: COMPANIES[8].id, companyName: COMPANIES[8].name,
    contentType: "Course", description: "Update confined space course to reflect new atmospheric monitoring equipment.",
    requestedScope: "Revise slides 3–5, add new equipment photos and a revised knowledge check.",
    priority: "High", dueDate: "28 Aug 2026", sowReference: "SOW-VPS-2026-05", status: "Client Review",
    assignedDeveloper: "Jon Ackerman", internalReviewer: "Priya Shah", owner: "Priya Shah", contributors: ["Jon Ackerman", "Priya Shah"],
    internalNotes: "Awaiting client sign-off on revised equipment photos before publish.",
    clientVisibleNotes: "Draft sent for your review on 20 Aug — let us know if the equipment photos need changes.",
    linkedContentId: "co3", linkedContentType: "course", createdAt: "02 Aug 2026",
    revisionHistory: [
      { date: "10 Aug 2026", author: "Jon Ackerman", summary: "First draft of revised slides completed." },
      { date: "20 Aug 2026", author: "Priya Shah", summary: "Sent to client for review." },
    ],
  },
  {
    id: "req3", title: "Custom Site Orientation — Phoenix Yard", companyId: COMPANIES[10].id, companyName: COMPANIES[10].name,
    contentType: "Course", description: "New-hire site orientation course specific to the Phoenix Yard scaffold operation.",
    requestedScope: "Full custom course: company intro, PPE requirements, scaffold-specific hazards, sign-off quiz.",
    priority: "High", dueDate: "10 Sep 2026", sowReference: "SOW-MSS-2026-01", status: "Scoping",
    assignedDeveloper: "Unassigned", internalReviewer: "Unassigned", owner: "Danny Osei", contributors: [],
    internalNotes: "Part of onboarding package — needs branding assets from client before scoping can close.",
    clientVisibleNotes: "Kickoff call scheduled — we'll confirm scope after receiving your branding assets.",
    createdAt: "21 Aug 2026", revisionHistory: [],
  },
  {
    id: "req4", title: "Heat Stress Prevention — Initial Build", companyId: COMPANIES[0].id, companyName: COMPANIES[0].name,
    contentType: "Course", description: "New master course covering heat illness recognition and prevention for outdoor crews.",
    requestedScope: "Standard 4-slide course, intended for All Clients visibility once published.",
    priority: "Medium", dueDate: "01 Sep 2026", sowReference: "—", status: "Internal Review",
    assignedDeveloper: "Marisol Cruz", internalReviewer: "Danny Osei", owner: "Danny Osei", contributors: ["Marisol Cruz"],
    internalNotes: "Internal Bastion-master build, not client-exclusive — Titan Steel requested it first.",
    clientVisibleNotes: "In final internal review, on track for early September.",
    linkedContentId: "co6", linkedContentType: "course", createdAt: "30 Jul 2026",
    revisionHistory: [{ date: "15 Aug 2026", author: "Danny Osei", summary: "Draft complete, entered internal review." }],
  },
  {
    id: "req5", title: "Trench Inspection — Coastal Customization", companyId: COMPANIES[1].id, companyName: COMPANIES[1].name,
    contentType: "Form", description: "Client-specific trench inspection checklist matching Coastal's internal safety program.",
    requestedScope: "Customize base template with Coastal's 12-point checklist and their logo.",
    priority: "Low", dueDate: "18 Sep 2026", sowReference: "SOW-CEC-2026-02", status: "Ready to Publish",
    assignedDeveloper: "Jon Ackerman", internalReviewer: "Priya Shah", owner: "Priya Shah", contributors: ["Jon Ackerman"],
    internalNotes: "Client approved final draft 19 Aug — publishing pending version-control confirmation.",
    clientVisibleNotes: "Approved — publishing shortly.",
    linkedContentId: "t9", linkedContentType: "form", createdAt: "22 Jul 2026",
    revisionHistory: [
      { date: "05 Aug 2026", author: "Jon Ackerman", summary: "First draft delivered." },
      { date: "19 Aug 2026", author: "Priya Shah", summary: "Client approved final draft." },
    ],
  },
  {
    id: "req6", title: "Hot Work Permit — Manufacturing Variant", companyId: COMPANIES[5].id, companyName: COMPANIES[5].name,
    contentType: "Form", description: "Manufacturing-specific hot work permit with additional fire-watch fields.",
    requestedScope: "Extend base Hot Work Permit with fire-watch assignment and extinguisher check fields.",
    priority: "Medium", dueDate: "15 Aug 2026", sowReference: "SOW-IIS-2026-04", status: "On Hold",
    assignedDeveloper: "Marisol Cruz", internalReviewer: "Danny Osei", owner: "Danny Osei", contributors: [],
    internalNotes: "Client paused request pending internal budget approval — resume when confirmed.",
    clientVisibleNotes: "On hold per your request — reach out when ready to resume.",
    linkedContentId: "t8", linkedContentType: "form", createdAt: "20 Jul 2026",
    revisionHistory: [{ date: "14 Aug 2026", author: "Danny Osei", summary: "Client requested hold pending budget approval." }],
  },
  {
    id: "req7", title: "PPE Selection Refresh — Photography", companyId: COMPANIES[3].id, companyName: COMPANIES[3].name,
    contentType: "Course", description: "Replace stock PPE photography with utility-sector-specific imagery.",
    requestedScope: "Swap 6 images in existing PPE course, no content/logic changes.",
    priority: "Low", dueDate: "30 Aug 2026", sowReference: "—", status: "Cancelled",
    assignedDeveloper: "Jon Ackerman", internalReviewer: "—", owner: "Priya Shah", contributors: [],
    internalNotes: "Client decided the stock imagery was acceptable after all — cancelled 18 Aug.",
    clientVisibleNotes: "Cancelled at your request.",
    linkedContentId: "co9", linkedContentType: "course", createdAt: "05 Aug 2026",
    revisionHistory: [{ date: "18 Aug 2026", author: "Priya Shah", summary: "Cancelled — client confirmed no change needed." }],
  },
  {
    id: "req8", title: "Excavation Safety Fundamentals — Annual Refresh", companyId: COMPANIES[6].id, companyName: COMPANIES[6].name,
    contentType: "Course", description: "Annual regulatory refresh of the excavation safety master course.",
    requestedScope: "Update citations to current OSHA subpart references, refresh quiz question bank.",
    priority: "Urgent", dueDate: "27 Aug 2026", sowReference: "—", status: "Requested",
    assignedDeveloper: "Unassigned", internalReviewer: "Unassigned", owner: "Danny Osei", contributors: [],
    internalNotes: "Annual compliance refresh cycle — needs developer assignment this week.",
    clientVisibleNotes: "",
    linkedContentId: "co1", linkedContentType: "course", createdAt: "23 Aug 2026", revisionHistory: [],
  },
];

export function contentRequestById(id: string): ContentRequest | undefined {
  return CONTENT_REQUESTS.find((r) => r.id === id);
}
