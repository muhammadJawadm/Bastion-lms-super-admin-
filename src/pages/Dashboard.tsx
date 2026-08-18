import type { ElementType } from "react";
import { StatCard } from "../components/ui/StatCard";
import {
  FaBuilding, FaUsers, FaDollarSign, FaShieldAlt, FaGraduationCap,
  FaCheckCircle, FaUserPlus, FaClock,
} from "react-icons/fa";

const BRAND_BLUE = "#2563eb";

const kpiStats = [
  { label: "Active Clients",  value: "9",        sub: "of 10 companies",       icon: FaBuilding,   iconBg: "bg-blue-50",   iconColor: "text-blue-600"   },
  { label: "Active Users",    value: "1,030",    sub: "↑ 6% vs last month",    icon: FaUsers,      iconBg: "bg-indigo-50", iconColor: "text-indigo-600", subColor: "text-green-600" },
  { label: "Monthly Revenue", value: "$184,200", sub: "↑ 9% vs last month",    icon: FaDollarSign, iconBg: "bg-green-50",  iconColor: "text-green-600",  subColor: "text-green-600" },
  { label: "Compliance Rate", value: "87%",      sub: "Across all clients",    icon: FaShieldAlt,  iconBg: "bg-cyan-50",   iconColor: "text-cyan-600"   },
];

const trendCards = [
  { label: "Companies", value: "9",       delta: "+1 this month",  icon: FaBuilding,      iconBg: "bg-blue-50",   iconColor: "text-blue-600",   data: [6, 7, 7, 8, 8, 9]                      },
  { label: "Users",     value: "1,030",   delta: "↑ 6%",           icon: FaUsers,         iconBg: "bg-indigo-50", iconColor: "text-indigo-600", data: [812, 866, 915, 958, 998, 1030]         },
  { label: "Revenue",   value: "$184.2K", delta: "↑ 9%",           icon: FaDollarSign,    iconBg: "bg-green-50",  iconColor: "text-green-600",  data: [155200, 161800, 168400, 172900, 179600, 184200] },
  { label: "Courses",   value: "32",      delta: "+2 this month",  icon: FaGraduationCap, iconBg: "bg-purple-50", iconColor: "text-purple-600", data: [22, 24, 26, 28, 30, 32]                },
];

const activities = [
  { id: 1, icon: FaUserPlus,      iconBg: "bg-blue-50",   iconColor: "text-blue-500",   text: "Titan Steel Erectors added 12 new employee accounts",             time: "12 min ago" },
  { id: 2, icon: FaCheckCircle,   iconBg: "bg-green-50",  iconColor: "text-green-500",  text: "Beacon Energy Field Services completed Excavation Safety rollout", time: "40 min ago" },
  { id: 3, icon: FaGraduationCap, iconBg: "bg-purple-50", iconColor: "text-purple-500", text: "\"Fall Protection Fundamentals\" course published to library",     time: "2 hrs ago"  },
  { id: 4, icon: FaClock,         iconBg: "bg-orange-50", iconColor: "text-orange-500", text: "Northbridge Utilities has 4 overdue inspections this week",        time: "3 hrs ago"  },
  { id: 5, icon: FaUserPlus,      iconBg: "bg-blue-50",   iconColor: "text-blue-500",   text: "New client onboarded — Vanguard Pipeline Solutions",               time: "1 day ago"  },
  { id: 6, icon: FaCheckCircle,   iconBg: "bg-green-50",  iconColor: "text-green-500",  text: "Apex Electrical Contractors renewed their Professional plan",      time: "1 day ago"  },
];

/* ── Trend card — stat tile + sparkline, single hue, small multiple ──── */

function Sparkline({ data }: { data: number[] }) {
  const w = 120, h = 36, pad = 3;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: pad + (1 - (v - min) / range) * (h - pad * 2),
  }));
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`;
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BRAND_BLUE} stopOpacity="0.18" />
          <stop offset="100%" stopColor={BRAND_BLUE} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkFill)" />
      <path d={line} fill="none" stroke={BRAND_BLUE} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r={2.5} fill={BRAND_BLUE} stroke="#fff" strokeWidth={1.25} />
    </svg>
  );
}

function TrendCard({ label, value, delta, icon: Icon, iconBg, iconColor, data }: {
  label: string; value: string; delta: string; icon: ElementType;
  iconBg: string; iconColor: string; data: number[];
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold text-gray-900">{value}</p>
          <p className="mt-1 text-xs font-medium text-green-600">{delta}</p>
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon size={15} className={iconColor} />
        </div>
      </div>
      <div className="mt-3">
        <Sparkline data={data} />
      </div>
    </div>
  );
}

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
          6-Month Trends
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {trendCards.map((t) => <TrendCard key={t.label} {...t} />)}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
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
    </div>
  );
}
