export interface PaymentMethod {
  type: "card" | "ach" | "invoice" | "none";
  brand?: string;
  last4?: string;
  bankName?: string;
  accountType?: string;
  maskedAccountNumber?: string;
}

export interface Entitlements {
  includedCourses: number | "Unlimited";
  includedForms: number | "Unlimited";
  customContentAllowance: number;
  storageLimit: string;
  premiumFeatures: string[];
  reportingAccess: boolean;
  mobileAccess: boolean;
  contractStart: string;
  cancellationDate: string | null;
}

export interface BillingProfile {
  setupFee: number;
  contentDevelopmentFee: number;
  recurringPlatformFee: number;
  billingFrequency: "Monthly" | "Quarterly" | "Annual";
  discountPercent: number;
  taxInfo: string;
  poReference: string;
  internalNotes: string;
  paymentMethod: PaymentMethod;
  billingContactName: string;
  billingContactEmail: string;
  billingAddress: string;
  outstandingBalance: number;
  suspensionRules: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  plan: "Starter" | "Professional" | "Enterprise";
  seatsBought: number;
  seatsUsed: number;
  status: "Active" | "Onboarding" | "Suspended" | "Archived";
  health: "green" | "amber" | "red";
  completionRate: number;
  complianceRate: number;
  formsSubmitted: number;
  renewalDate: string;
  paymentStatus: "Current" | "Overdue" | "Failed";
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  companyAdmin: string;
  sites: string[];
  logoColor: string;
  createdAt: string;
  entitlements: Entitlements;
  billing: BillingProfile;
}

const PLAN_DEFAULTS: Record<Company["plan"], Omit<Entitlements, "contractStart" | "cancellationDate"> & Pick<BillingProfile, "setupFee" | "contentDevelopmentFee" | "billingFrequency">> = {
  Starter: {
    includedCourses: 10,
    includedForms: 10,
    customContentAllowance: 0,
    storageLimit: "5 GB",
    premiumFeatures: [],
    reportingAccess: false,
    mobileAccess: true,
    setupFee: 500,
    contentDevelopmentFee: 0,
    billingFrequency: "Monthly",
  },
  Professional: {
    includedCourses: 25,
    includedForms: 25,
    customContentAllowance: 3,
    storageLimit: "50 GB",
    premiumFeatures: ["Custom Branding", "Compliance Dashboard"],
    reportingAccess: true,
    mobileAccess: true,
    setupFee: 1500,
    contentDevelopmentFee: 2000,
    billingFrequency: "Quarterly",
  },
  Enterprise: {
    includedCourses: "Unlimited",
    includedForms: "Unlimited",
    customContentAllowance: 10,
    storageLimit: "500 GB",
    premiumFeatures: ["Custom Branding", "API Access", "Priority SLA", "White-Labeling"],
    reportingAccess: true,
    mobileAccess: true,
    setupFee: 5000,
    contentDevelopmentFee: 8000,
    billingFrequency: "Annual",
  },
};

function makeCompany(
  base: Omit<Company, "entitlements" | "billing">,
  overrides: {
    discountPercent?: number;
    taxInfo?: string;
    poReference?: string;
    internalNotes?: string;
    paymentMethod: PaymentMethod;
    billingContactName?: string;
    billingContactEmail?: string;
    billingAddress: string;
    outstandingBalance?: number;
    suspensionRules?: string;
    cancellationDate?: string | null;
    customContentAllowance?: number;
  }
): Company {
  const d = PLAN_DEFAULTS[base.plan];
  const recurringPlatformFee =
    base.plan === "Enterprise" ? base.seatsBought * 85 : base.plan === "Professional" ? base.seatsBought * 65 : base.seatsBought * 45;
  return {
    ...base,
    entitlements: {
      includedCourses: d.includedCourses,
      includedForms: d.includedForms,
      customContentAllowance: overrides.customContentAllowance ?? d.customContentAllowance,
      storageLimit: d.storageLimit,
      premiumFeatures: d.premiumFeatures,
      reportingAccess: d.reportingAccess,
      mobileAccess: d.mobileAccess,
      contractStart: base.createdAt,
      cancellationDate: overrides.cancellationDate ?? null,
    },
    billing: {
      setupFee: d.setupFee,
      contentDevelopmentFee: d.contentDevelopmentFee,
      recurringPlatformFee,
      billingFrequency: d.billingFrequency,
      discountPercent: overrides.discountPercent ?? 0,
      taxInfo: overrides.taxInfo ?? "Standard — taxable",
      poReference: overrides.poReference ?? "—",
      internalNotes: overrides.internalNotes ?? "",
      paymentMethod: overrides.paymentMethod,
      billingContactName: overrides.billingContactName ?? base.contactName,
      billingContactEmail: overrides.billingContactEmail ?? base.contactEmail,
      billingAddress: overrides.billingAddress,
      outstandingBalance: overrides.outstandingBalance ?? 0,
      suspensionRules: overrides.suspensionRules ?? "Access suspended after 15 days past due; data retained 90 days.",
    },
  };
}

export const COMPANIES: Company[] = [
  makeCompany(
    { id: "c1", name: "Titan Steel Erectors", industry: "Construction", plan: "Enterprise", seatsBought: 220, seatsUsed: 204, status: "Active", health: "green", completionRate: 91, complianceRate: 94, formsSubmitted: 1284, renewalDate: "12 Mar 2027", paymentStatus: "Current", contactName: "Rachel Voss", contactEmail: "rachel.voss@titansteel.com", contactPhone: "+1 (704) 555-0142", companyAdmin: "Rachel Voss", sites: ["Charlotte Yard", "Greenville Site A", "Greenville Site B"], logoColor: "bg-blue-600", createdAt: "18 Jan 2024" },
    { discountPercent: 8, poReference: "PO-TSE-2024-04", billingAddress: "4820 Yorkmont Rd, Charlotte, NC 28208", paymentMethod: { type: "card", brand: "Visa", last4: "4242" }, internalNotes: "2-year enterprise contract, priority support SLA." }
  ),
  makeCompany(
    { id: "c2", name: "Coastal Excavation Co.", industry: "Excavation", plan: "Professional", seatsBought: 85, seatsUsed: 61, status: "Active", health: "amber", completionRate: 74, complianceRate: 79, formsSubmitted: 612, renewalDate: "04 Nov 2026", paymentStatus: "Current", contactName: "Marcus Ibe", contactEmail: "marcus@coastalexcavation.com", contactPhone: "+1 (912) 555-0199", companyAdmin: "Marcus Ibe", sites: ["Savannah Trench Site", "Pooler Depot"], logoColor: "bg-emerald-600", createdAt: "02 Apr 2024" },
    { billingAddress: "112 Bay St, Savannah, GA 31401", paymentMethod: { type: "ach", bankName: "Truist", accountType: "Business Checking", maskedAccountNumber: "••••6631" } }
  ),
  makeCompany(
    { id: "c3", name: "Apex Electrical Contractors", industry: "Electrical", plan: "Professional", seatsBought: 60, seatsUsed: 58, status: "Active", health: "green", completionRate: 88, complianceRate: 90, formsSubmitted: 447, renewalDate: "22 Jan 2027", paymentStatus: "Current", contactName: "Denise Falk", contactEmail: "denise.falk@apexelectrical.com", contactPhone: "+1 (615) 555-0110", companyAdmin: "Denise Falk", sites: ["Nashville HQ"], logoColor: "bg-yellow-500", createdAt: "30 Jun 2024" },
    { billingAddress: "900 Demonbreun St, Nashville, TN 37203", paymentMethod: { type: "card", brand: "Mastercard", last4: "8871" } }
  ),
  makeCompany(
    { id: "c4", name: "Northbridge Utilities", industry: "Utilities", plan: "Enterprise", seatsBought: 340, seatsUsed: 298, status: "Active", health: "green", completionRate: 86, complianceRate: 92, formsSubmitted: 2190, renewalDate: "15 Aug 2026", paymentStatus: "Current", contactName: "Owen Pratt", contactEmail: "owen.pratt@northbridge.com", contactPhone: "+1 (503) 555-0177", companyAdmin: "Owen Pratt", sites: ["Portland North", "Portland South", "Salem Depot", "Eugene Yard"], logoColor: "bg-indigo-600", createdAt: "11 Sep 2023" },
    { discountPercent: 12, poReference: "PO-NBU-2023-11", billingAddress: "1500 SW 5th Ave, Portland, OR 97201", paymentMethod: { type: "invoice" }, internalNotes: "Net-30 invoice billing per MSA; renewal due — outreach in progress." }
  ),
  makeCompany(
    { id: "c5", name: "Summit Roofing & Restoration", industry: "Roofing", plan: "Starter", seatsBought: 25, seatsUsed: 12, status: "Active", health: "red", completionRate: 48, complianceRate: 55, formsSubmitted: 96, renewalDate: "09 Oct 2026", paymentStatus: "Overdue", contactName: "Casey Mullen", contactEmail: "casey@summitroofing.com", contactPhone: "+1 (303) 555-0163", companyAdmin: "Casey Mullen", sites: ["Denver Metro"], logoColor: "bg-orange-500", createdAt: "05 Feb 2025" },
    { billingAddress: "2200 Larimer St, Denver, CO 80205", paymentMethod: { type: "card", brand: "Visa", last4: "1187" }, outstandingBalance: 625, suspensionRules: "Suspend on 2nd failed retry; grace period 5 days." }
  ),
  makeCompany(
    { id: "c6", name: "Ironclad Industrial Services", industry: "Manufacturing", plan: "Professional", seatsBought: 110, seatsUsed: 93, status: "Active", health: "amber", completionRate: 77, complianceRate: 81, formsSubmitted: 803, renewalDate: "28 Dec 2026", paymentStatus: "Current", contactName: "Priya Nandan", contactEmail: "priya.nandan@ironcladis.com", contactPhone: "+1 (216) 555-0128", companyAdmin: "Priya Nandan", sites: ["Cleveland Plant 1", "Cleveland Plant 2"], logoColor: "bg-slate-600", createdAt: "19 Nov 2023" },
    { billingAddress: "3800 Chester Ave, Cleveland, OH 44114", paymentMethod: { type: "ach", bankName: "KeyBank", accountType: "Business Checking", maskedAccountNumber: "••••2290" } }
  ),
  makeCompany(
    { id: "c7", name: "Beacon Energy Field Services", industry: "Oil & Gas", plan: "Enterprise", seatsBought: 175, seatsUsed: 168, status: "Active", health: "green", completionRate: 93, complianceRate: 96, formsSubmitted: 1567, renewalDate: "03 May 2027", paymentStatus: "Current", contactName: "Todd Warrick", contactEmail: "todd.warrick@beaconenergy.com", contactPhone: "+1 (432) 555-0155", companyAdmin: "Todd Warrick", sites: ["Permian Basin Field 4", "Midland Yard"], logoColor: "bg-red-600", createdAt: "27 Jul 2023" },
    { discountPercent: 5, poReference: "PO-BEF-2023-07", billingAddress: "800 W Wall St, Midland, TX 79701", paymentMethod: { type: "card", brand: "Amex", last4: "10021" } }
  ),
  makeCompany(
    { id: "c8", name: "Granite Peak Construction", industry: "Construction", plan: "Starter", seatsBought: 40, seatsUsed: 22, status: "Suspended", health: "red", completionRate: 39, complianceRate: 44, formsSubmitted: 58, renewalDate: "17 Jun 2026", paymentStatus: "Failed", contactName: "Nina Aguilar", contactEmail: "nina@granitepeakco.com", contactPhone: "+1 (801) 555-0184", companyAdmin: "Nina Aguilar", sites: ["Salt Lake Site"], logoColor: "bg-purple-600", createdAt: "14 Dec 2024" },
    { billingAddress: "455 S 300 E, Salt Lake City, UT 84111", paymentMethod: { type: "none" }, outstandingBalance: 1240, suspensionRules: "Suspended after 2 consecutive failed charges.", internalNotes: "Suspended for non-payment — awaiting updated payment method." }
  ),
  makeCompany(
    { id: "c9", name: "Vanguard Pipeline Solutions", industry: "Oil & Gas", plan: "Professional", seatsBought: 95, seatsUsed: 80, status: "Active", health: "green", completionRate: 84, complianceRate: 88, formsSubmitted: 691, renewalDate: "21 Feb 2027", paymentStatus: "Current", contactName: "Hal Fenwick", contactEmail: "hal.fenwick@vanguardpipeline.com", contactPhone: "+1 (713) 555-0139", companyAdmin: "Hal Fenwick", sites: ["Houston East", "Baytown Corridor"], logoColor: "bg-cyan-600", createdAt: "08 Mar 2024" },
    { billingAddress: "1200 Smith St, Houston, TX 77002", paymentMethod: { type: "card", brand: "Visa", last4: "5509" } }
  ),
  makeCompany(
    { id: "c10", name: "Redline Demolition Group", industry: "Demolition", plan: "Professional", seatsBought: 55, seatsUsed: 34, status: "Archived", health: "amber", completionRate: 68, complianceRate: 71, formsSubmitted: 214, renewalDate: "—", paymentStatus: "Current", contactName: "Wes Trundle", contactEmail: "wes@redlinedemo.com", contactPhone: "+1 (312) 555-0121", companyAdmin: "Wes Trundle", sites: ["Chicago South Yard"], logoColor: "bg-rose-600", createdAt: "22 Aug 2022" },
    { billingAddress: "1801 W Fulton St, Chicago, IL 60612", paymentMethod: { type: "invoice" }, cancellationDate: "22 Aug 2025", internalNotes: "Contract not renewed; workspace archived, records retained." }
  ),
  makeCompany(
    { id: "c11", name: "Meridian Scaffold Solutions", industry: "Construction", plan: "Starter", seatsBought: 30, seatsUsed: 0, status: "Onboarding", health: "amber", completionRate: 0, complianceRate: 0, formsSubmitted: 0, renewalDate: "—", paymentStatus: "Current", contactName: "Alicia Fenn", contactEmail: "alicia@meridianscaffold.com", contactPhone: "+1 (602) 555-0177", companyAdmin: "Alicia Fenn", sites: ["Phoenix Yard"], logoColor: "bg-teal-600", createdAt: "20 Aug 2026" },
    { billingAddress: "2200 N Central Ave, Phoenix, AZ 85004", paymentMethod: { type: "card", brand: "Visa", last4: "3320" }, internalNotes: "Signed 18 Aug 2026 — workspace provisioning in progress, awaiting admin activation." }
  ),
];

export function companyById(id: string): Company | undefined {
  return COMPANIES.find((c) => c.id === id);
}
