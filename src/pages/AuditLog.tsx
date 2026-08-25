import { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { AUDIT_LOG, type AuditEvent, type AuditCategory } from "../data/auditLog";
import { FaSearch, FaHistory } from "react-icons/fa";

const CATEGORIES: AuditCategory[] = ["Company", "Content", "Auth", "Support", "Billing"];

function categoryBadge(c: AuditCategory): "info" | "purple" | "danger" | "warning" | "success" {
  if (c === "Company") return "info";
  if (c === "Content") return "purple";
  if (c === "Auth") return "danger";
  if (c === "Support") return "warning";
  return "success";
}

function EventDetail({ e }: { e: AuditEvent }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {[
          { label: "Actor", value: e.actor },
          { label: "Timestamp", value: e.timestamp },
          { label: "Category", value: e.category },
          { label: "Source IP / Session", value: e.sourceIp },
          { label: "Affected Tenant", value: e.affectedTenant ?? "—" },
          { label: "Affected Record", value: e.affectedRecord },
        ].map((d) => (
          <div key={d.label}><p className="text-xs text-gray-400">{d.label}</p><p className="mt-0.5 font-medium text-gray-800">{d.value}</p></div>
        ))}
      </div>
      {e.reason && (
        <div className="rounded-lg bg-gray-50 px-3.5 py-2.5">
          <p className="text-xs text-gray-400">Reason</p>
          <p className="mt-0.5 text-gray-700">{e.reason}</p>
        </div>
      )}
      {(e.before || e.after) && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5">
            <p className="text-xs text-red-500">Before</p>
            <p className="mt-0.5 text-red-800">{e.before ?? "—"}</p>
          </div>
          <div className="rounded-lg border border-green-100 bg-green-50 px-3.5 py-2.5">
            <p className="text-xs text-green-600">After</p>
            <p className="mt-0.5 text-green-800">{e.after ?? "—"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | AuditCategory>("All");
  const [viewing, setViewing] = useState<AuditEvent | null>(null);

  const filtered = AUDIT_LOG.filter(
    (e) =>
      (e.action.toLowerCase().includes(search.toLowerCase()) || e.affectedRecord.toLowerCase().includes(search.toLowerCase()) || (e.affectedTenant ?? "").toLowerCase().includes(search.toLowerCase())) &&
      (categoryFilter === "All" || e.category === categoryFilter)
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="mt-1 text-sm text-gray-500">Every Super Admin action, authentication event, content change and support session, with actor, tenant and reason where required.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-50 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <FaSearch size={13} className="shrink-0 text-gray-400" />
          <input
            type="text"
            placeholder="Search by action, record or tenant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as "All" | AuditCategory)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none cursor-pointer">
          <option>All</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/70">
              <tr>{["Action", "Category", "Actor", "Tenant", "Timestamp", ""].map((h) => <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No events match your filters.</td></tr>
              ) : filtered.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50"><FaHistory size={11} className="text-gray-400" /></div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{e.action}</p>
                        <p className="truncate text-xs text-gray-400">{e.affectedRecord}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><Badge variant={categoryBadge(e.category)}>{e.category}</Badge></td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-600">{e.actor}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">{e.affectedTenant ?? "—"}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">{e.timestamp}</td>
                  <td className="px-5 py-3.5"><button onClick={() => setViewing(e)} className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
          Showing {filtered.length} of {AUDIT_LOG.length} events
        </div>
      </div>

      <Modal isOpen={viewing !== null} onClose={() => setViewing(null)} title="Event Details" size="lg">
        {viewing && <EventDetail e={viewing} />}
      </Modal>
    </div>
  );
}
