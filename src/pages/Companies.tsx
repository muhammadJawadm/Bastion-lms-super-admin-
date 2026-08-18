import { useState } from "react";
import { useNavigate } from "react-router";
import { Badge } from "../components/ui/Badge";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Modal, FieldLabel, FieldInput, FieldSelect, ModalBtn } from "../components/ui/Modal";
import { COMPANIES, type Company } from "../data/companies";
import { FaSearch, FaPlus, FaBuilding, FaEye } from "react-icons/fa";

function statusBadge(s: Company["status"]): "success" | "danger" | "neutral" {
  if (s === "Active") return "success";
  if (s === "Suspended") return "danger";
  return "neutral";
}
function paymentBadge(p: Company["paymentStatus"]): "success" | "warning" | "danger" {
  if (p === "Current") return "success";
  if (p === "Overdue") return "warning";
  return "danger";
}
function healthDot(h: Company["health"]) {
  return h === "green" ? "bg-green-500" : h === "amber" ? "bg-yellow-500" : "bg-red-500";
}

function AddCompanyContent() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><FieldLabel>Company Name</FieldLabel><FieldInput placeholder="e.g. Titan Steel Erectors" /></div>
        <div>
          <FieldLabel>Industry</FieldLabel>
          <FieldSelect>
            {["Construction", "Excavation", "Electrical", "Utilities", "Manufacturing", "Oil & Gas", "Roofing", "Demolition"].map((i) => (
              <option key={i}>{i}</option>
            ))}
          </FieldSelect>
        </div>
        <div>
          <FieldLabel>Plan</FieldLabel>
          <FieldSelect><option>Starter</option><option>Professional</option><option>Enterprise</option></FieldSelect>
        </div>
        <div><FieldLabel>Seat Count</FieldLabel><FieldInput type="number" placeholder="e.g. 50" /></div>
        <div><FieldLabel>Primary Contact Name</FieldLabel><FieldInput placeholder="e.g. Jane Doe" /></div>
        <div><FieldLabel>Contact Email</FieldLabel><FieldInput type="email" placeholder="jane@client.com" /></div>
      </div>
      <div><FieldLabel>Contract Start Date</FieldLabel><FieldInput type="date" /></div>
    </div>
  );
}

export default function Companies() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = COMPANIES.filter(
    (c) =>
      (c.name.toLowerCase().includes(search.toLowerCase()) || c.industry.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === "All" || c.status === statusFilter) &&
      (planFilter === "All" || c.plan === planFilter)
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="mt-1 text-sm text-gray-500">Every client company on the platform, in one place.</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <FaPlus size={12} /> Add Company
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-50 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <FaSearch size={13} className="shrink-0 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none cursor-pointer">
          {["All", "Active", "Suspended", "Archived"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none cursor-pointer">
          {["All", "Starter", "Professional", "Enterprise"].map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/70">
              <tr>
                {["Company", "Plan", "Seats", "Completion", "Compliance", "Renewal", "Payment", "Status", "Actions"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-8 text-center text-sm text-gray-400">No companies match your filters.</td></tr>
              ) : filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/companies/${c.id}`)}
                  className="cursor-pointer hover:bg-gray-50/60 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white ${c.logoColor}`}>
                        <FaBuilding size={13} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${healthDot(c.health)}`} />
                          <p className="truncate text-sm font-medium text-gray-900">{c.name}</p>
                        </div>
                        <p className="text-xs text-gray-400">{c.industry}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><Badge variant="info">{c.plan}</Badge></td>
                  <td className="px-5 py-3.5 w-36">
                    <p className="mb-1 text-xs text-gray-600">{c.seatsUsed} / {c.seatsBought}</p>
                    <ProgressBar value={(c.seatsUsed / c.seatsBought) * 100} color="bg-indigo-500" />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm font-medium text-gray-700">{c.completionRate}%</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm font-medium text-gray-700">{c.complianceRate}%</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">{c.renewalDate}</td>
                  <td className="px-5 py-3.5"><Badge variant={paymentBadge(c.paymentStatus)}>{c.paymentStatus}</Badge></td>
                  <td className="px-5 py-3.5"><Badge variant={statusBadge(c.status)}>{c.status}</Badge></td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/companies/${c.id}`); }}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FaEye size={11} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
          Showing {filtered.length} of {COMPANIES.length} companies
        </div>
      </div>

      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Company"
        footer={
          <>
            <ModalBtn variant="secondary" onClick={() => setAddOpen(false)}>Cancel</ModalBtn>
            <ModalBtn variant="primary" onClick={() => setAddOpen(false)}>Create Company</ModalBtn>
          </>
        }
      >
        <AddCompanyContent />
      </Modal>
    </div>
  );
}
