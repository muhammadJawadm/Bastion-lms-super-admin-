import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Badge } from "../components/ui/Badge";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Tabs } from "../components/ui/Tabs";
import { Modal, FieldLabel, FieldInput, FieldTextarea, ModalBtn } from "../components/ui/Modal";
import { companyById } from "../data/companies";
import {
  FaArrowLeft, FaBuilding, FaEye, FaEyeSlash, FaMapMarkerAlt,
  FaFileInvoiceDollar, FaStickyNote, FaHistory, FaGraduationCap,
  FaClipboardList, FaUsers, FaPlus, FaDownload, FaLock, FaCreditCard,
} from "react-icons/fa";

function maskedPaymentMethod(pm: { type: string; brand?: string; last4?: string; bankName?: string; accountType?: string; maskedAccountNumber?: string }) {
  if (pm.type === "card") return `${pm.brand} •••• ${pm.last4}`;
  if (pm.type === "ach") return `${pm.bankName} ${pm.accountType} ${pm.maskedAccountNumber}`;
  if (pm.type === "invoice") return "Invoice / manual payment";
  return "No payment method on file";
}

const initials = (n: string) => n.trim().split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

function statusBadge(s: string): "success" | "danger" | "info" | "neutral" {
  if (s === "Active") return "success";
  if (s === "Suspended") return "danger";
  if (s === "Onboarding") return "info";
  return "neutral";
}

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const company = id ? companyById(id) : undefined;
  const [tab, setTab] = useState("overview");
  const [viewAs, setViewAs] = useState(false);
  const [startSupportOpen, setStartSupportOpen] = useState(false);
  const [supportReason, setSupportReason] = useState("");
  const [supportTicket, setSupportTicket] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);

  if (!company) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-gray-500">Company not found.</p>
        <button onClick={() => navigate("/companies")} className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800">
          &larr; Back to Companies
        </button>
      </div>
    );
  }

  const employees = [
    { name: "Rachel Voss", role: "Company Admin", status: "Active" },
    { name: "Devon Marsh", role: "Employee", status: "Active" },
    { name: "Lucia Ferreira", role: "Employee", status: "Active" },
    { name: "Sam Whitfield", role: "Employee", status: "Suspended" },
  ];

  const courses = [
    { name: "Excavation Safety Fundamentals", enrolled: 84, completion: 91 },
    { name: "Fall Protection Basics", enrolled: 62, completion: 78 },
    { name: "Confined Space Awareness", enrolled: 40, completion: 65 },
  ];

  const templates = [
    { name: "Trench Inspection Report", frequency: "Every shift", submissions: 214 },
    { name: "Daily Jobsite Audit", frequency: "Daily", submissions: 189 },
    { name: "Toolbox Talk Sign-In", frequency: "Weekly", submissions: 96 },
  ];

  const submissions = [
    { form: "Trench Inspection Report", site: company.sites[0], submitter: "Devon Marsh", date: "16 Aug 2026", result: "Pass" },
    { form: "Daily Jobsite Audit", site: company.sites[0], submitter: "Lucia Ferreira", date: "15 Aug 2026", result: "Fail" },
    { form: "Toolbox Talk Sign-In", site: company.sites[company.sites.length - 1], submitter: "Sam Whitfield", date: "14 Aug 2026", result: "Pass" },
  ];

  const invoices = [
    { number: `INV-${company.id.toUpperCase()}-08`, amount: "$12,400.00", status: "Paid",  date: "01 Aug 2026" },
    { number: `INV-${company.id.toUpperCase()}-07`, amount: "$12,400.00", status: "Paid",  date: "01 Jul 2026" },
    { number: `INV-${company.id.toUpperCase()}-06`, amount: "$11,850.00", status: company.paymentStatus === "Current" ? "Paid" : company.paymentStatus, date: "01 Jun 2026" },
  ];

  const activity = [
    { text: `${company.contactName} logged in`, time: "2 hrs ago" },
    { text: "Bulk-imported 8 new employee accounts", time: "1 day ago" },
    { text: "Assigned \"Fall Protection Basics\" to all site crews", time: "3 days ago" },
    { text: "Submitted Daily Jobsite Audit — flagged Fail", time: "4 days ago" },
  ];

  const tabs = [
    { key: "overview",  label: "Overview" },
    { key: "users",     label: "Users",     count: employees.length },
    { key: "courses",   label: "Courses",   count: courses.length   },
    { key: "templates", label: "Templates", count: templates.length },
    { key: "forms",     label: "Submitted Forms", count: submissions.length },
    { key: "billing",   label: "Billing" },
    { key: "sites",     label: "Sites & Branding" },
    { key: "notes",     label: "Notes & Docs" },
    { key: "activity",  label: "Activity" },
  ];

  return (
    <div className="space-y-5">
      <button onClick={() => navigate("/companies")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <FaArrowLeft size={11} /> Back to Companies
      </button>

      {viewAs && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2.5 text-amber-800">
            <FaEye size={14} />
            <div>
              <p className="text-sm font-medium">Support Mode active — viewing {company.name} — Read-only.</p>
              <p className="text-xs text-amber-700">Ticket {supportTicket || "—"} · {supportReason || "No reason recorded"}</p>
            </div>
          </div>
          <button onClick={() => { setViewAs(false); setSupportReason(""); setSupportTicket(""); }} className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900">
            <FaEyeSlash size={11} /> End Session
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white ${company.logoColor}`}>
            <FaBuilding size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
              <Badge variant={statusBadge(company.status)}>{company.status}</Badge>
              <Badge variant="info">{company.plan}</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500">{company.industry} · Client since {company.createdAt}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStartSupportOpen(true)}
            disabled={viewAs}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FaEye size={12} /> View as company
          </button>
          <button className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
            Edit Details
          </button>
          {company.status === "Active" ? (
            <button className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
              Suspend
            </button>
          ) : (
            <button className="rounded-lg border border-green-200 bg-green-50 px-3.5 py-2 text-sm font-medium text-green-600 hover:bg-green-100 transition-colors">
              Reactivate
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="px-5 pt-2">
          <Tabs tabs={tabs} active={tab} onChange={setTab} />
        </div>
        <div className="p-5">
          {tab === "overview" && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: "Seats", value: `${company.seatsUsed}/${company.seatsBought}` },
                    { label: "Completion", value: `${company.completionRate}%` },
                    { label: "Compliance", value: `${company.complianceRate}%` },
                    { label: "Forms Submitted", value: company.formsSubmitted.toLocaleString() },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg bg-gray-50 p-3.5 text-center">
                      <p className="text-lg font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 rounded-lg border border-gray-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Seat Utilization</p>
                  <ProgressBar
                    value={(company.seatsUsed / company.seatsBought) * 100}
                    color="bg-indigo-500"
                    trailing={`${Math.round((company.seatsUsed / company.seatsBought) * 100)}%`}
                  />
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 pt-1">Compliance Rate</p>
                  <ProgressBar value={company.complianceRate} color="bg-cyan-500" trailing={`${company.complianceRate}%`} />
                </div>
              </div>
              <div className="space-y-3 rounded-lg border border-gray-100 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Primary Contact</p>
                <p className="font-medium text-gray-800">{company.contactName}</p>
                <p className="text-gray-500">{company.contactEmail}</p>
                <p className="text-gray-500">{company.contactPhone}</p>
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Renewal</p>
                  <p className="text-gray-700">{company.renewalDate}</p>
                  <Badge variant={company.paymentStatus === "Current" ? "success" : "danger"}>{company.paymentStatus}</Badge>
                </div>
              </div>
            </div>
          )}

          {tab === "users" && (
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <table className="min-w-full">
                <thead className="bg-gray-50/70">
                  <tr>{["Name", "Role", "Status", ""].map((h) => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employees.map((e) => (
                    <tr key={e.name} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">{initials(e.name)}</div>
                          <span className="text-sm font-medium text-gray-900">{e.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge variant={e.role === "Company Admin" ? "purple" : "info"}>{e.role}</Badge></td>
                      <td className="px-4 py-3"><Badge variant={e.status === "Active" ? "success" : "danger"}>{e.status}</Badge></td>
                      <td className="px-4 py-3 text-right"><Link to="/admins" className="text-xs font-medium text-blue-600 hover:text-blue-800">Manage &rarr;</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "courses" && (
            <div className="space-y-3">
              {courses.map((c) => (
                <div key={c.name} className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 p-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50"><FaGraduationCap size={14} className="text-blue-600" /></div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.enrolled} enrolled</p>
                    </div>
                  </div>
                  <div className="w-32 shrink-0"><ProgressBar value={c.completion} trailing={`${c.completion}%`} /></div>
                </div>
              ))}
            </div>
          )}

          {tab === "templates" && (
            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t.name} className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 p-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50"><FaClipboardList size={14} className="text-purple-600" /></div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.frequency}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-gray-700">{t.submissions} submissions</span>
                </div>
              ))}
            </div>
          )}

          {tab === "forms" && (
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <table className="min-w-full">
                <thead className="bg-gray-50/70">
                  <tr>{["Form", "Site", "Submitter", "Date", "Result"].map((h) => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map((s, i) => (
                    <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.form}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.site}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.submitter}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.date}</td>
                      <td className="px-4 py-3"><Badge variant={s.result === "Pass" ? "success" : "danger"}>{s.result}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "billing" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Plan", value: company.plan },
                  { label: "Seats", value: `${company.seatsBought}` },
                  { label: "Payment Status", value: company.paymentStatus },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-gray-50 p-3.5 text-center">
                    <p className="text-sm font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-100 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Contract &amp; Fees</p>
                  <div className="divide-y divide-gray-50 text-sm">
                    {[
                      { label: "Contract Start", value: company.entitlements.contractStart },
                      { label: "Renewal", value: company.renewalDate },
                      { label: "Cancellation Date", value: company.entitlements.cancellationDate ?? "—" },
                      { label: "Setup Fee", value: `$${company.billing.setupFee.toLocaleString()}` },
                      { label: "Content Development Fee", value: `$${company.billing.contentDevelopmentFee.toLocaleString()}` },
                      { label: "Recurring Platform Fee", value: `$${company.billing.recurringPlatformFee.toLocaleString()} / ${company.billing.billingFrequency.toLowerCase()}` },
                      { label: "Discount", value: `${company.billing.discountPercent}%` },
                      { label: "Purchase Order Ref", value: company.billing.poReference },
                      { label: "Tax Info", value: company.billing.taxInfo },
                    ].map((d) => (
                      <div key={d.label} className="flex items-center justify-between gap-3 py-1.5">
                        <span className="text-xs text-gray-400">{d.label}</span>
                        <span className="font-medium text-gray-800">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-100 p-4">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400"><FaCreditCard size={10} /> Payment Method</p>
                    <p className="text-sm font-medium text-gray-800">{maskedPaymentMethod(company.billing.paymentMethod)}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400"><FaLock size={9} /> Collected via payment-provider-hosted fields — no full card or bank numbers stored here.</p>
                    {company.billing.outstandingBalance > 0 && (
                      <p className="mt-2 text-xs font-semibold text-red-600">Outstanding balance: ${company.billing.outstandingBalance.toLocaleString()}</p>
                    )}
                  </div>
                  <div className="rounded-lg border border-gray-100 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Entitlements</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600">{company.entitlements.includedCourses} courses</span>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600">{company.entitlements.includedForms} forms</span>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600">{company.entitlements.storageLimit} storage</span>
                      {company.entitlements.premiumFeatures.map((f) => <span key={f} className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] text-blue-600">{f}</span>)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-100">
                <table className="min-w-full">
                  <thead className="bg-gray-50/70">
                    <tr>{["Invoice", "Amount", "Status", "Date", ""].map((h) => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoices.map((inv) => (
                      <tr key={inv.number} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono text-gray-700">{inv.number}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{inv.amount}</td>
                        <td className="px-4 py-3"><Badge variant={inv.status === "Paid" ? "success" : "danger"}>{inv.status}</Badge></td>
                        <td className="px-4 py-3 text-sm text-gray-500">{inv.date}</td>
                        <td className="px-4 py-3 text-right">
                          <button className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 ml-auto">
                            <FaDownload size={10} /> PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "sites" && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Sites / Project Locations</p>
                <div className="space-y-2">
                  {company.sites.map((s) => (
                    <div key={s} className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3.5 py-2.5">
                      <FaMapMarkerAlt size={12} className="shrink-0 text-gray-400" />
                      <span className="text-sm text-gray-700">{s}</span>
                    </div>
                  ))}
                  <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-200 py-2 text-xs text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
                    <FaPlus size={10} /> Add Site
                  </button>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Branding</p>
                <div className="space-y-3 rounded-lg border border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${company.logoColor}`}><FaBuilding size={16} /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Client logo</p>
                      <p className="text-xs text-gray-400">Used on generated PDFs and certificates</p>
                    </div>
                  </div>
                  <button className="w-full rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Upload New Logo
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === "notes" && (
            <div className="space-y-3">
              <button
                onClick={() => setNoteOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-dashed border-gray-200 px-3.5 py-2 text-xs font-medium text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                <FaPlus size={10} /> Add Note
              </button>
              {[
                { text: "Signed 2-year enterprise contract, includes priority support SLA.", author: "Super Admin", date: "18 Jan 2024" },
                { text: "Client requested bilingual JHA templates for Spanish-speaking crews.", author: "Super Admin", date: "02 Mar 2025" },
              ].map((n, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3.5">
                  <FaStickyNote size={13} className="mt-0.5 shrink-0 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-700">{n.text}</p>
                    <p className="mt-1 text-xs text-gray-400">{n.author} · {n.date}</p>
                  </div>
                </div>
              ))}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 flex items-center gap-1.5"><FaFileInvoiceDollar size={11} /> Documents</p>
                <div className="grid grid-cols-2 gap-3">
                  {["Master Services Agreement.pdf", "PO-2026-0184.pdf"].map((doc) => (
                    <div key={doc} className="flex h-16 items-center justify-center rounded-lg border border-dashed border-gray-200 px-3 text-center text-xs text-gray-400">
                      {doc}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "activity" && (
            <ul className="divide-y divide-gray-50">
              {activity.map((a, i) => (
                <li key={i} className="flex items-start gap-3 py-3">
                  <FaHistory size={12} className="mt-1 shrink-0 text-gray-300" />
                  <div>
                    <p className="text-sm text-gray-700">{a.text}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Modal
        isOpen={noteOpen}
        onClose={() => setNoteOpen(false)}
        title="Add Internal Note"
        footer={<><ModalBtn variant="secondary" onClick={() => setNoteOpen(false)}>Cancel</ModalBtn><ModalBtn variant="primary" onClick={() => setNoteOpen(false)}>Save Note</ModalBtn></>}
      >
        <FieldLabel>Note</FieldLabel>
        <FieldTextarea rows={4} placeholder="Internal note visible only to Bastion staff..." />
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <FaUsers size={11} /> Only visible to Super Admins
        </div>
      </Modal>

      <Modal
        isOpen={startSupportOpen}
        onClose={() => setStartSupportOpen(false)}
        title="Start Support Session"
        footer={
          <>
            <ModalBtn variant="secondary" onClick={() => setStartSupportOpen(false)}>Cancel</ModalBtn>
            <ModalBtn variant="primary" disabled={!supportReason.trim()} onClick={() => { setStartSupportOpen(false); setViewAs(true); }}>Start Session</ModalBtn>
          </>
        }
      >
        <div className="space-y-4">
          <div><FieldLabel>Ticket / Request Reference</FieldLabel><FieldInput value={supportTicket} onChange={(e) => setSupportTicket(e.target.value)} placeholder="e.g. #4821" /></div>
          <div><FieldLabel>Reason (required)</FieldLabel><FieldTextarea rows={3} value={supportReason} onChange={(e) => setSupportReason(e.target.value)} placeholder={`Why are you accessing ${company.name}'s workspace?`} /></div>
          <p className="text-xs text-gray-400">Access starts read-only. Elevated actions require a separate explicit step and are logged to the Audit Log.</p>
        </div>
      </Modal>
    </div>
  );
}
