export interface Company {
  id: string;
  name: string;
  industry: string;
  plan: "Starter" | "Professional" | "Enterprise";
  seatsBought: number;
  seatsUsed: number;
  status: "Active" | "Suspended" | "Archived";
  health: "green" | "amber" | "red";
  completionRate: number;
  complianceRate: number;
  formsSubmitted: number;
  renewalDate: string;
  paymentStatus: "Current" | "Overdue" | "Failed";
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  sites: string[];
  logoColor: string;
  createdAt: string;
}

export const COMPANIES: Company[] = [
  { id: "c1", name: "Titan Steel Erectors", industry: "Construction", plan: "Enterprise", seatsBought: 220, seatsUsed: 204, status: "Active", health: "green", completionRate: 91, complianceRate: 94, formsSubmitted: 1284, renewalDate: "12 Mar 2027", paymentStatus: "Current", contactName: "Rachel Voss", contactEmail: "rachel.voss@titansteel.com", contactPhone: "+1 (704) 555-0142", sites: ["Charlotte Yard", "Greenville Site A", "Greenville Site B"], logoColor: "bg-blue-600", createdAt: "18 Jan 2024" },
  { id: "c2", name: "Coastal Excavation Co.", industry: "Excavation", plan: "Professional", seatsBought: 85, seatsUsed: 61, status: "Active", health: "amber", completionRate: 74, complianceRate: 79, formsSubmitted: 612, renewalDate: "04 Nov 2026", paymentStatus: "Current", contactName: "Marcus Ibe", contactEmail: "marcus@coastalexcavation.com", contactPhone: "+1 (912) 555-0199", sites: ["Savannah Trench Site", "Pooler Depot"], logoColor: "bg-emerald-600", createdAt: "02 Apr 2024" },
  { id: "c3", name: "Apex Electrical Contractors", industry: "Electrical", plan: "Professional", seatsBought: 60, seatsUsed: 58, status: "Active", health: "green", completionRate: 88, complianceRate: 90, formsSubmitted: 447, renewalDate: "22 Jan 2027", paymentStatus: "Current", contactName: "Denise Falk", contactEmail: "denise.falk@apexelectrical.com", contactPhone: "+1 (615) 555-0110", sites: ["Nashville HQ"], logoColor: "bg-yellow-500", createdAt: "30 Jun 2024" },
  { id: "c4", name: "Northbridge Utilities", industry: "Utilities", plan: "Enterprise", seatsBought: 340, seatsUsed: 298, status: "Active", health: "green", completionRate: 86, complianceRate: 92, formsSubmitted: 2190, renewalDate: "15 Aug 2026", paymentStatus: "Current", contactName: "Owen Pratt", contactEmail: "owen.pratt@northbridge.com", contactPhone: "+1 (503) 555-0177", sites: ["Portland North", "Portland South", "Salem Depot", "Eugene Yard"], logoColor: "bg-indigo-600", createdAt: "11 Sep 2023" },
  { id: "c5", name: "Summit Roofing & Restoration", industry: "Roofing", plan: "Starter", seatsBought: 25, seatsUsed: 12, status: "Active", health: "red", completionRate: 48, complianceRate: 55, formsSubmitted: 96, renewalDate: "09 Oct 2026", paymentStatus: "Overdue", contactName: "Casey Mullen", contactEmail: "casey@summitroofing.com", contactPhone: "+1 (303) 555-0163", sites: ["Denver Metro"], logoColor: "bg-orange-500", createdAt: "05 Feb 2025" },
  { id: "c6", name: "Ironclad Industrial Services", industry: "Manufacturing", plan: "Professional", seatsBought: 110, seatsUsed: 93, status: "Active", health: "amber", completionRate: 77, complianceRate: 81, formsSubmitted: 803, renewalDate: "28 Dec 2026", paymentStatus: "Current", contactName: "Priya Nandan", contactEmail: "priya.nandan@ironcladis.com", contactPhone: "+1 (216) 555-0128", sites: ["Cleveland Plant 1", "Cleveland Plant 2"], logoColor: "bg-slate-600", createdAt: "19 Nov 2023" },
  { id: "c7", name: "Beacon Energy Field Services", industry: "Oil & Gas", plan: "Enterprise", seatsBought: 175, seatsUsed: 168, status: "Active", health: "green", completionRate: 93, complianceRate: 96, formsSubmitted: 1567, renewalDate: "03 May 2027", paymentStatus: "Current", contactName: "Todd Warrick", contactEmail: "todd.warrick@beaconenergy.com", contactPhone: "+1 (432) 555-0155", sites: ["Permian Basin Field 4", "Midland Yard"], logoColor: "bg-red-600", createdAt: "27 Jul 2023" },
  { id: "c8", name: "Granite Peak Construction", industry: "Construction", plan: "Starter", seatsBought: 40, seatsUsed: 22, status: "Suspended", health: "red", completionRate: 39, complianceRate: 44, formsSubmitted: 58, renewalDate: "17 Jun 2026", paymentStatus: "Failed", contactName: "Nina Aguilar", contactEmail: "nina@granitepeakco.com", contactPhone: "+1 (801) 555-0184", sites: ["Salt Lake Site"], logoColor: "bg-purple-600", createdAt: "14 Dec 2024" },
  { id: "c9", name: "Vanguard Pipeline Solutions", industry: "Oil & Gas", plan: "Professional", seatsBought: 95, seatsUsed: 80, status: "Active", health: "green", completionRate: 84, complianceRate: 88, formsSubmitted: 691, renewalDate: "21 Feb 2027", paymentStatus: "Current", contactName: "Hal Fenwick", contactEmail: "hal.fenwick@vanguardpipeline.com", contactPhone: "+1 (713) 555-0139", sites: ["Houston East", "Baytown Corridor"], logoColor: "bg-cyan-600", createdAt: "08 Mar 2024" },
  { id: "c10", name: "Redline Demolition Group", industry: "Demolition", plan: "Professional", seatsBought: 55, seatsUsed: 34, status: "Archived", health: "amber", completionRate: 68, complianceRate: 71, formsSubmitted: 214, renewalDate: "—", paymentStatus: "Current", contactName: "Wes Trundle", contactEmail: "wes@redlinedemo.com", contactPhone: "+1 (312) 555-0121", sites: ["Chicago South Yard"], logoColor: "bg-rose-600", createdAt: "22 Aug 2022" },
];

export function companyById(id: string): Company | undefined {
  return COMPANIES.find((c) => c.id === id);
}
