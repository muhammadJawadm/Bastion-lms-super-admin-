import type { ElementType } from "react";
import { COMPANIES } from "../data/companies";
import { COURSES } from "../data/courses";
import { FORMS } from "../data/forms";
import {
  FaDollarSign, FaBuilding, FaGraduationCap, FaShieldAlt,
} from "react-icons/fa";

const BRAND_BLUE = "#2563eb";

function Sparkline({ data }: { data: number[] }) {
  const w = 120, h = 36, pad = 3;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * w,
    y: pad + (1 - (val - min) / range) * (h - pad * 2),
  }));
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`;
  const last = points[points.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="analyticsSparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BRAND_BLUE} stopOpacity="0.18" />
          <stop offset="100%" stopColor={BRAND_BLUE} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#analyticsSparkFill)" />
      <path d={line} fill="none" stroke={BRAND_BLUE} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r={2.5} fill={BRAND_BLUE} stroke="#fff" strokeWidth={1.25} />
    </svg>
  );
}

function TrendCard({ label, value, delta, icon: Icon, iconBg, iconColor, data }: {
  label: string; value: string; delta: string; icon: ElementType; iconBg: string; iconColor: string; data: number[];
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
      <div className="mt-3"><Sparkline data={data} /></div>
    </div>
  );
}

export default function Analytics() {
  const activeClients = COMPANIES.filter((c) => c.status === "Active").length;
  const publishedCourses = COURSES.filter((c) => c.status === "Published").length;
  const publishedForms = FORMS.filter((f) => f.status === "Published").length;
  const avgCompliance = Math.round(COMPANIES.reduce((s, c) => s + c.complianceRate, 0) / COMPANIES.length);
  const mrr = COMPANIES.reduce((s, c) => s + c.billing.recurringPlatformFee * (1 - c.billing.discountPercent / 100), 0);

  const byIndustry = Array.from(new Set(COMPANIES.map((c) => c.industry))).map((industry) => {
    const inGroup = COMPANIES.filter((c) => c.industry === industry);
    const avg = Math.round(inGroup.reduce((s, c) => s + c.complianceRate, 0) / inGroup.length);
    return { industry, avg, count: inGroup.length };
  }).sort((a, b) => b.avg - a.avg);

  const byPlan = (["Starter", "Professional", "Enterprise"] as const).map((plan) => ({
    plan, count: COMPANIES.filter((c) => c.plan === plan).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Platform-wide aggregates for account oversight — no employee-level drill-down.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TrendCard label="Monthly Recurring Revenue" value={`$${Math.round(mrr).toLocaleString()}`} delta="↑ 9% vs last month" icon={FaDollarSign} iconBg="bg-green-50" iconColor="text-green-600" data={[155200, 161800, 168400, 172900, 179600, Math.round(mrr)]} />
        <TrendCard label="Active Clients" value={String(activeClients)} delta={`${COMPANIES.length} total companies`} icon={FaBuilding} iconBg="bg-blue-50" iconColor="text-blue-600" data={[6, 7, 7, 8, 9, activeClients]} />
        <TrendCard label="Published Content" value={String(publishedCourses + publishedForms)} delta={`${publishedCourses} courses · ${publishedForms} forms`} icon={FaGraduationCap} iconBg="bg-purple-50" iconColor="text-purple-600" data={[22, 24, 26, 28, 30, publishedCourses + publishedForms]} />
        <TrendCard label="Aggregate Compliance" value={`${avgCompliance}%`} delta="Across all active clients" icon={FaShieldAlt} iconBg="bg-cyan-50" iconColor="text-cyan-600" data={[74, 78, 80, 82, 84, avgCompliance]} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-800">Compliance by Industry</h2>
          <div className="space-y-2.5">
            {byIndustry.map((row) => (
              <div key={row.industry} className="flex items-center gap-3">
                <span className="w-36 shrink-0 truncate text-xs text-gray-500">{row.industry}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-cyan-500" style={{ width: `${row.avg}%` }} />
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-medium text-gray-700">{row.avg}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-800">Clients by Plan</h2>
          <div className="space-y-2.5">
            {byPlan.map((row) => (
              <div key={row.plan} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-xs text-gray-500">{row.plan}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${(row.count / Math.max(1, COMPANIES.length)) * 100}%` }} />
                </div>
                <span className="w-6 shrink-0 text-right text-xs font-medium text-gray-700">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
