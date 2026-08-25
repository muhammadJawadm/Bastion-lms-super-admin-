import { useState } from "react";
import { useNavigate } from "react-router";
import { Badge } from "../components/ui/Badge";
import { DISTRIBUTIONS, type DistributionRecord } from "../data/distributions";
import { COMPANIES } from "../data/companies";
import type { Ownership } from "../data/catalog";
import { FaSearch, FaGraduationCap, FaClipboardList } from "react-icons/fa";

function statusBadge(s: DistributionRecord["status"]): "success" | "info" | "warning" | "danger" {
  if (s === "Active") return "success";
  if (s === "Scheduled") return "info";
  if (s === "Expired") return "warning";
  return "danger";
}
function ownershipBadge(o: Ownership): "danger" | "purple" | "info" | "orange" {
  if (o === "Bastion Master") return "danger";
  if (o === "Client Exclusive") return "purple";
  if (o === "Locked Client Copy") return "orange";
  return "info";
}

export default function ClientDeliveries() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState<"All" | "course" | "form">("All");
  const [statusFilter, setStatusFilter] = useState<"All" | DistributionRecord["status"]>("All");

  const filtered = DISTRIBUTIONS.filter(
    (d) =>
      d.contentTitle.toLowerCase().includes(search.toLowerCase()) &&
      (companyFilter === "All" || d.companyName === companyFilter) &&
      (typeFilter === "All" || d.contentType === typeFilter) &&
      (statusFilter === "All" || d.status === statusFilter)
  );
  const outdatedCount = DISTRIBUTIONS.filter((d) => d.clientVersion !== d.currentMasterVersion).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Client Deliveries</h1>
        <p className="mt-1 text-sm text-gray-500">Every course and form issued to a client company — source master, current version, and distribution status in one ledger.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Deliveries", value: DISTRIBUTIONS.length },
          { label: "Active",           value: DISTRIBUTIONS.filter((d) => d.status === "Active").length },
          { label: "Clients on Outdated Version", value: outdatedCount },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="mt-0.5 text-xs font-medium text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-50 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <FaSearch size={13} className="shrink-0 text-gray-400" />
          <input
            type="text"
            placeholder="Search by content title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
          />
        </div>
        <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none cursor-pointer">
          <option>All</option>
          {COMPANIES.map((c) => <option key={c.id}>{c.name}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as "All" | "course" | "form")}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none cursor-pointer">
          <option value="All">All Types</option>
          <option value="course">Courses</option>
          <option value="form">Forms</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "All" | DistributionRecord["status"])}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none cursor-pointer">
          {["All", "Active", "Scheduled", "Expired", "Revoked"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/70">
              <tr>{["Content", "Company", "Ownership", "Client Version", "Availability", "Expiration", "Status"].map((h) => <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-400">No deliveries match your filters.</td></tr>
              ) : filtered.map((d) => (
                <tr key={d.id} onClick={() => navigate(`/${d.contentType === "form" ? "forms" : "courses"}/${d.contentId}`)} className="cursor-pointer hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${d.contentType === "course" ? "bg-blue-50" : "bg-purple-50"}`}>
                        {d.contentType === "course" ? <FaGraduationCap size={12} className="text-blue-600" /> : <FaClipboardList size={12} className="text-purple-600" />}
                      </div>
                      <p className="text-sm font-medium text-gray-900">{d.contentTitle}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-600">{d.companyName}</td>
                  <td className="px-5 py-3.5"><Badge variant={ownershipBadge(d.ownership)}>{d.ownership}</Badge></td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm font-mono text-gray-500">
                    {d.clientVersion}
                    {d.clientVersion !== d.currentMasterVersion && <span className="ml-1.5 text-[10px] font-sans font-semibold text-amber-600">outdated (master {d.currentMasterVersion})</span>}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">{d.availabilityDate}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">{d.expirationDate ?? "—"}</td>
                  <td className="px-5 py-3.5"><Badge variant={statusBadge(d.status)}>{d.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
          Showing {filtered.length} of {DISTRIBUTIONS.length} deliveries
        </div>
      </div>
    </div>
  );
}
