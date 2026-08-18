import { Link } from "react-router";
import { StatCard } from "../components/ui/StatCard";
import { ProgressBar } from "../components/ui/ProgressBar";
import { COMPANIES } from "../data/companies";
import {
  FaBuilding, FaUsers, FaDollarSign, FaUserCheck,
  FaCheckCircle, FaShieldAlt, FaFileAlt, FaExclamationTriangle,
  FaArrowRight, FaGraduationCap, FaClipboardList, FaFileInvoiceDollar,
  FaUserPlus, FaFlag, FaClock,
} from "react-icons/fa";

const kpiStats = [
  { label: "Active Clients",        value: "9",        sub: "of 10 companies",          icon: FaBuilding,   iconBg: "bg-blue-50",    iconColor: "text-blue-600"   },
  { label: "Active Users",          value: "1,030",    sub: "↑ 6% from last month",       icon: FaUsers,      iconBg: "bg-indigo-50",  iconColor: "text-indigo-600" },
  { label: "Monthly Revenue",       value: "$184,200",  sub: "↑ 9% from last month",       icon: FaDollarSign, iconBg: "bg-green-50",   iconColor: "text-green-600"  },
  { label: "Seats Sold vs Used",    value: "1,205/1,030", sub: "85% utilization",          icon: FaUserCheck,  iconBg: "bg-purple-50",  iconColor: "text-purple-600" },
];

const secondaryStats = [
  { label: "Overall Completion Rate", value: "82%",  sub: "Across all clients",   icon: FaCheckCircle,        iconBg: "bg-teal-50",   iconColor: "text-teal-600"   },
  { label: "Overall Compliance Rate", value: "87%",  sub: "Required training + forms", icon: FaShieldAlt,     iconBg: "bg-cyan-50",   iconColor: "text-cyan-600"   },
  { label: "Forms Submitted",         value: "412",  sub: "This week",            icon: FaFileAlt,            iconBg: "bg-orange-50", iconColor: "text-orange-600" },
  { label: "Open Corrective Actions", value: "23",   sub: "6 overdue",            icon: FaExclamationTriangle, iconBg: "bg-red-50",   iconColor: "text-red-500"    },
];

const needsAttention = COMPANIES
  .filter((c) => c.health !== "green")
  .sort((a) => (a.health === "red" ? -1 : 1))
  .map((c) => ({
    id: c.id,
    name: c.name,
    reason: c.paymentStatus !== "Current" ? `Payment ${c.paymentStatus.toLowerCase()}` : `Compliance at ${c.complianceRate}%`,
    health: c.health,
  }));

const approvalQueue = [
  { id: 1, icon: FaGraduationCap, iconBg: "bg-blue-50",  iconColor: "text-blue-600",  title: "Confined Space Entry — v2",        sub: "Course · submitted by content team",     time: "3 hrs ago" },
  { id: 2, icon: FaClipboardList, iconBg: "bg-purple-50", iconColor: "text-purple-600", title: "Trench Inspection — Coastal Excavation", sub: "Template customization · client-specific", time: "5 hrs ago" },
  { id: 3, icon: FaFileInvoiceDollar, iconBg: "bg-green-50", iconColor: "text-green-600", title: "Custom build request — Vanguard Pipeline", sub: "Bilingual JHA translation request",     time: "1 day ago" },
  { id: 4, icon: FaExclamationTriangle, iconBg: "bg-red-50", iconColor: "text-red-500", title: "Failed payment — Granite Peak Construction", sub: "$1,240 — retry scheduled",             time: "1 day ago" },
];

const MONTHLY_REVENUE = [
  { month: "Mar", value: 155200 }, { month: "Apr", value: 161800 }, { month: "May", value: 168400 },
  { month: "Jun", value: 172900 }, { month: "Jul", value: 179600 }, { month: "Aug", value: 184200 },
];
const maxRevenue = Math.max(...MONTHLY_REVENUE.map((d) => d.value));

const FORMS_BY_TYPE = [
  { name: "Equipment Pre-Use Inspection",   value: 401 },
  { name: "Job Hazard Analysis (JHA)",      value: 312 },
  { name: "Toolbox Talk Sign-In",           value: 210 },
  { name: "Trench & Excavation Inspection", value: 148 },
];
const maxForms = Math.max(...FORMS_BY_TYPE.map((d) => d.value));

const complianceByClient = COMPANIES
  .filter((c) => c.status === "Active")
  .sort((a, b) => b.complianceRate - a.complianceRate)
  .slice(0, 5);

const activities = [
  { id: 1, icon: FaUserPlus,           iconBg: "bg-blue-50",   iconColor: "text-blue-500",   text: "Titan Steel Erectors added 12 new employee accounts",         time: "12 min ago" },
  { id: 2, icon: FaCheckCircle,        iconBg: "bg-green-50",  iconColor: "text-green-500",  text: "Beacon Energy Field Services completed Excavation Safety rollout", time: "40 min ago" },
  { id: 3, icon: FaFlag,               iconBg: "bg-red-50",    iconColor: "text-red-500",    text: "Corrective action CA-2291 flagged overdue at Ironclad Industrial", time: "1 hr ago"  },
  { id: 4, icon: FaGraduationCap,      iconBg: "bg-purple-50", iconColor: "text-purple-500", text: "\"Fall Protection Fundamentals\" course published to library",  time: "2 hrs ago"  },
  { id: 5, icon: FaClock,              iconBg: "bg-orange-50", iconColor: "text-orange-500", text: "Northbridge Utilities has 4 overdue inspections this week",     time: "3 hrs ago"  },
  { id: 6, icon: FaUserPlus,           iconBg: "bg-blue-50",   iconColor: "text-blue-500",   text: "New client onboarded — Vanguard Pipeline Solutions",             time: "1 day ago"  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back — here's the platform snapshot for today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiStats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Training &amp; Compliance
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {secondaryStats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Monthly Revenue</h2>
            <span className="text-xs text-gray-400">Mar – Aug</span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {MONTHLY_REVENUE.map((d) => (
              <div key={d.month} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-medium text-gray-500">${(d.value / 1000).toFixed(0)}k</span>
                <div className="w-full flex flex-col justify-end" style={{ height: "88px" }}>
                  <div className="w-full rounded-t-md bg-blue-500 hover:bg-blue-600 transition-colors" style={{ height: `${(d.value / maxRevenue) * 100}%` }} />
                </div>
                <span className="text-[10px] text-gray-400">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">Compliance Rate by Client</h2>
          <div className="space-y-3">
            {complianceByClient.map((c) => (
              <ProgressBar
                key={c.id}
                label={c.name}
                trailing={`${c.complianceRate}%`}
                value={c.complianceRate}
                color={c.complianceRate >= 85 ? "bg-green-500" : c.complianceRate >= 70 ? "bg-yellow-500" : "bg-red-500"}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">Submissions by Form Type</h2>
          <div className="space-y-3">
            {FORMS_BY_TYPE.map((f) => (
              <div key={f.name}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-gray-600">{f.name}</span>
                  <span className="text-xs font-medium text-gray-700">{f.value}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-orange-500" style={{ width: `${(f.value / maxForms) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Activity feed */}
        <div className="lg:col-span-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-800">Recent Activity</h2>
            <span className="text-xs text-gray-400">Live feed</span>
          </div>
          <ul className="divide-y divide-gray-50">
            {activities.map((a) => (
              <li key={a.id} className="flex items-start gap-3.5 px-5 py-3.5">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${a.iconBg}`}>
                  <a.icon size={13} className={a.iconColor} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700">{a.text}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Clients needing attention */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-800">Clients Needing Attention</h2>
          </div>
          <div className="space-y-3 p-4">
            {needsAttention.map((c) => (
              <Link
                key={c.id}
                to={`/companies/${c.id}`}
                className={`flex items-center justify-between rounded-lg border-l-4 px-4 py-3.5 transition-opacity hover:opacity-75 ${
                  c.health === "red"
                    ? "border-red-400 bg-red-50 text-red-700"
                    : "border-yellow-400 bg-yellow-50 text-yellow-700"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  <p className="text-xs opacity-75">{c.reason}</p>
                </div>
                <FaArrowRight size={12} className="shrink-0 opacity-50" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Queue waiting on us */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Waiting On Us</h2>
            <p className="text-xs text-gray-400">Approvals, custom build requests, and billing issues</p>
          </div>
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">
            {approvalQueue.length} pending
          </span>
        </div>
        <ul className="divide-y divide-gray-50">
          {approvalQueue.map((q) => (
            <li key={q.id} className="flex items-start gap-3.5 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${q.iconBg}`}>
                <q.icon size={14} className={q.iconColor} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800">{q.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">{q.sub}</p>
              </div>
              <span className="shrink-0 text-xs text-gray-300">{q.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
