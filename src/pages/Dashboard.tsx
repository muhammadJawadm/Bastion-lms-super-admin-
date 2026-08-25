import { StatCard } from "../components/ui/StatCard";
import { Badge } from "../components/ui/Badge";
import { COMPANIES } from "../data/companies";
import { COURSES } from "./CourseLibrary";
import { FORMS } from "../data/forms";
import { CONTENT_REQUESTS } from "../data/contentRequests";
import { DISTRIBUTIONS } from "../data/distributions";
import { AUDIT_LOG } from "../data/auditLog";
import { SUPPORT_SESSIONS } from "../data/supportSessions";
import {
  FaBuilding, FaUserClock, FaBan, FaExclamationTriangle, FaSyncAlt,
  FaDollarSign, FaFileInvoice, FaTimesCircle, FaUsers,
  FaHistory, FaHeadset, FaShieldAlt, FaCloudUploadAlt,
} from "react-icons/fa";

const REFERENCE_DATE = new Date("2026-08-25");
const RENEWAL_WINDOW_DAYS = 90;

function daysUntil(dateStr: string): number | null {
  if (!dateStr || dateStr === "—") return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return Math.round((d.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24));
}

export default function Dashboard() {
  const active = COMPANIES.filter((c) => c.status === "Active").length;
  const onboarding = COMPANIES.filter((c) => c.status === "Onboarding").length;
  const suspended = COMPANIES.filter((c) => c.status === "Suspended").length;
  const overdue = COMPANIES.filter((c) => c.paymentStatus !== "Current").length;
  const renewalDue = COMPANIES.filter((c) => {
    const d = daysUntil(c.renewalDate);
    return d !== null && d <= RENEWAL_WINDOW_DAYS;
  }).length;

  const pipelineStages = ["Requested", "Scoping", "In Development", "Internal Review", "Client Review", "Ready to Publish", "Published"] as const;
  const pipelineCounts = pipelineStages.map((stage) => ({ stage, count: CONTENT_REQUESTS.filter((r) => r.status === stage).length }));

  const upcomingDeadlines = [...CONTENT_REQUESTS]
    .filter((r) => r.status !== "Published" && r.status !== "Cancelled")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const outdatedCompanies = Array.from(
    new Set(DISTRIBUTIONS.filter((d) => d.clientVersion !== d.currentMasterVersion).map((d) => d.companyName))
  );

  const mrr = COMPANIES.reduce((s, c) => s + c.billing.recurringPlatformFee * (1 - c.billing.discountPercent / 100), 0);
  const outstandingInvoices = COMPANIES.reduce((s, c) => s + c.billing.outstandingBalance, 0);
  const failedPayments = COMPANIES.filter((c) => c.paymentStatus === "Failed").length;
  const seatLimitExceeded = COMPANIES.filter((c) => c.seatsUsed >= c.seatsBought).length;

  const openSupportSessions = SUPPORT_SESSIONS.filter((s) => s.endTime === null).length;
  const securityAlerts = AUDIT_LOG.filter((e) => e.category === "Auth" && e.action.toLowerCase().includes("denied")).length;
  const failedImports = 0;
  const recentActivity = [...AUDIT_LOG].slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Bastion's platform snapshot — client health, content production and business oversight.</p>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Client Companies</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Active"        value={String(active)}      sub={`of ${COMPANIES.length} companies`} icon={FaBuilding}      iconBg="bg-green-50"  iconColor="text-green-600" />
          <StatCard label="Onboarding"    value={String(onboarding)}  sub="Provisioning in progress"           icon={FaUserClock}     iconBg="bg-blue-50"   iconColor="text-blue-600" subColor="text-blue-500" />
          <StatCard label="Suspended"     value={String(suspended)}   sub="Access blocked"                     icon={FaBan}           iconBg="bg-red-50"    iconColor="text-red-500" subColor="text-red-500" />
          <StatCard label="Overdue"       value={String(overdue)}     sub="Payment past due"                   icon={FaExclamationTriangle} iconBg="bg-orange-50" iconColor="text-orange-500" subColor="text-orange-500" />
          <StatCard label="Renewal Due"   value={String(renewalDue)}  sub={`Within ${RENEWAL_WINDOW_DAYS} days`} icon={FaSyncAlt}      iconBg="bg-amber-50"  iconColor="text-amber-600" subColor="text-amber-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-gray-800">Content Pipeline</h2>
          <div className="space-y-2.5">
            {pipelineCounts.map((row) => (
              <div key={row.stage} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-xs text-gray-500">{row.stage}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${(row.count / Math.max(1, CONTENT_REQUESTS.length)) * 100}%` }} />
                </div>
                <span className="w-5 shrink-0 text-right text-xs font-medium text-gray-700">{row.count}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-400">{COURSES.filter((c) => c.status === "Published").length} courses · {FORMS.filter((f) => f.status === "Published").length} forms published</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm lg:col-span-1">
          <div className="border-b border-gray-100 px-5 py-3.5"><h2 className="text-sm font-semibold text-gray-800">Upcoming Production Deadlines</h2></div>
          <ul className="divide-y divide-gray-50">
            {upcomingDeadlines.length === 0 ? (
              <li className="px-5 py-6 text-center text-sm text-gray-400">Nothing due.</li>
            ) : upcomingDeadlines.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-gray-700">{r.title}</p>
                  <p className="text-xs text-gray-400">{r.companyName}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-gray-500">{r.dueDate}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm lg:col-span-1">
          <div className="border-b border-gray-100 px-5 py-3.5"><h2 className="text-sm font-semibold text-gray-800">Clients on Outdated Content Versions</h2></div>
          <ul className="divide-y divide-gray-50">
            {outdatedCompanies.length === 0 ? (
              <li className="px-5 py-6 text-center text-sm text-gray-400">Everyone is current.</li>
            ) : outdatedCompanies.map((name) => (
              <li key={name} className="flex items-center justify-between gap-3 px-5 py-3">
                <p className="text-sm text-gray-700">{name}</p>
                <Badge variant="warning">Outdated</Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Business</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Monthly Revenue"       value={`$${Math.round(mrr).toLocaleString()}`}    sub="Recurring platform fees"     icon={FaDollarSign}  iconBg="bg-green-50"  iconColor="text-green-600" subColor="text-green-600" />
          <StatCard label="Outstanding Invoices"  value={`$${outstandingInvoices.toLocaleString()}`} sub="Across all clients"          icon={FaFileInvoice} iconBg="bg-orange-50" iconColor="text-orange-600" />
          <StatCard label="Failed Payments"       value={String(failedPayments)}                     sub="Needs follow-up"             icon={FaTimesCircle} iconBg="bg-red-50"    iconColor="text-red-500" subColor="text-red-500" />
          <StatCard label="Renewals Due"          value={String(renewalDue)}                         sub={`Within ${RENEWAL_WINDOW_DAYS} days`} icon={FaSyncAlt} iconBg="bg-amber-50"  iconColor="text-amber-600" />
          <StatCard label="Seats Exceeded"        value={String(seatLimitExceeded)}                  sub="Over contracted seat count"  icon={FaUsers}       iconBg="bg-purple-50" iconColor="text-purple-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-800">Recent Super Admin Activity</h2>
            <span className="text-xs text-gray-400">From Audit Log</span>
          </div>
          <ul className="divide-y divide-gray-50">
            {recentActivity.map((e) => (
              <li key={e.id} className="flex items-start gap-3.5 px-5 py-3.5">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50">
                  <FaHistory size={12} className="text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700">{e.action}{e.affectedTenant ? ` — ${e.affectedTenant}` : ""}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{e.actor} · {e.timestamp}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50"><FaHeadset size={14} className="text-amber-600" /></div>
              <div>
                <p className="text-lg font-bold text-gray-900">{openSupportSessions}</p>
                <p className="text-xs text-gray-500">Open support sessions</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50"><FaShieldAlt size={14} className="text-red-500" /></div>
              <div>
                <p className="text-lg font-bold text-gray-900">{securityAlerts}</p>
                <p className="text-xs text-gray-500">Security alerts (7d)</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50"><FaCloudUploadAlt size={14} className="text-gray-400" /></div>
              <div>
                <p className="text-lg font-bold text-gray-900">{failedImports}</p>
                <p className="text-xs text-gray-500">Failed imports</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
