import type { Ownership, VersionEntry } from "./catalog";

export interface Course {
  id: string;
  title: string;
  category: string;
  tags: string[];
  visibility: "All Clients" | "Plan-Restricted" | "Exclusive";
  ownership: Ownership;
  status: "Published" | "Draft" | "Archived";
  clientsUsing: number;
  enrolled: number;
  completionRate: number;
  version: string;
  versionHistory: VersionEntry[];
}

const v = (version: string, date: string, summary: string, publicationState: VersionEntry["publicationState"] = "Published"): VersionEntry =>
  ({ version, date, author: "Marisol Cruz", reviewer: "Danny Osei", summary, publicationState });

export const COURSES: Course[] = [
  { id: "co1", title: "Excavation Safety Fundamentals", category: "Excavation & Trenching", tags: ["Construction", "Excavation"], visibility: "All Clients", ownership: "Shared Content", status: "Published", clientsUsing: 8, enrolled: 612, completionRate: 88, version: "v3.1", versionHistory: [v("v3.1", "16 Aug 2026", "Regulatory citation correction, pushed to all clients"), v("v3.0", "02 Jun 2026", "Refreshed field photography")] },
  { id: "co2", title: "Fall Protection Basics",          category: "Fall Protection",        tags: ["Construction", "Roofing"],   visibility: "All Clients", ownership: "Shared Content", status: "Published", clientsUsing: 9, enrolled: 744, completionRate: 91, version: "v2.4", versionHistory: [v("v2.4", "10 May 2026", "Added ladder safety segment"), v("v2.3", "14 Jan 2026", "Quiz bank refresh")] },
  { id: "co3", title: "Confined Space Awareness",        category: "Confined Space",         tags: ["Oil & Gas", "Utilities"],    visibility: "All Clients", ownership: "Shared Content", status: "Published", clientsUsing: 6, enrolled: 388, completionRate: 76, version: "v1.8", versionHistory: [v("v1.8", "20 Aug 2026", "Atmospheric monitoring equipment update, pending client review"), v("v1.7", "11 Mar 2026", "Added updated hazard signage")] },
  { id: "co4", title: "Electrical Safety — Arc Flash",   category: "Electrical Safety",      tags: ["Electrical", "Utilities"],   visibility: "Plan-Restricted", ownership: "Shared Content", status: "Published", clientsUsing: 4, enrolled: 210, completionRate: 82, version: "v1.2", versionHistory: [v("v1.2", "01 Jul 2024", "Added PPE category chart"), v("v1.1", "12 Sep 2023", "Initial arc-flash boundary content")] },
  { id: "co5", title: "Titan Steel — Site Orientation",  category: "General Orientation",    tags: ["Construction"],              visibility: "Exclusive", ownership: "Client Exclusive", status: "Published", clientsUsing: 1, enrolled: 204, completionRate: 95, version: "v1.0", versionHistory: [v("v1.0", "18 Jan 2024", "Initial client-exclusive build for Titan Steel")] },
  { id: "co6", title: "Heat Stress Prevention",          category: "Emergency Response",     tags: ["Construction", "Oil & Gas"], visibility: "All Clients", ownership: "Bastion Master", status: "Draft", clientsUsing: 0, enrolled: 0, completionRate: 0, version: "v0.3", versionHistory: [v("v0.3", "15 Aug 2026", "In internal review, requested by Titan Steel", "Draft")] },
  { id: "co7", title: "Confined Space Entry — v2",       category: "Confined Space",         tags: ["Oil & Gas"],                 visibility: "All Clients", ownership: "Bastion Master", status: "Draft", clientsUsing: 0, enrolled: 0, completionRate: 0, version: "v2.0", versionHistory: [v("v2.0", "05 Aug 2026", "Full rebuild in progress", "Draft")] },
  { id: "co8", title: "Hazard Communication (HazCom)",   category: "Hazard Communication",   tags: ["Manufacturing"],             visibility: "All Clients", ownership: "Shared Content", status: "Published", clientsUsing: 5, enrolled: 296, completionRate: 79, version: "v1.5", versionHistory: [v("v1.5", "09 Apr 2026", "GHS label update")] },
  { id: "co9", title: "PPE Selection & Use",             category: "PPE",                    tags: ["Construction", "Manufacturing"], visibility: "All Clients", ownership: "Shared Content", status: "Published", clientsUsing: 9, enrolled: 810, completionRate: 93, version: "v2.0", versionHistory: [v("v2.0", "14 Dec 2024", "Photography refresh"), v("v1.4", "19 Nov 2023", "Initial release")] },
  { id: "co10", title: "Environmental Spill Response",   category: "Environmental Compliance", tags: ["Oil & Gas"],               visibility: "Exclusive", ownership: "Client Exclusive", status: "Archived", clientsUsing: 0, enrolled: 64, completionRate: 71, version: "v1.0", versionHistory: [v("v1.0", "22 Aug 2022", "Initial release, archived after contract lapse", "Archived")] },
];

export function courseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}
