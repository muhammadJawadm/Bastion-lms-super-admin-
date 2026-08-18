import { useState } from "react";
import { useNavigate } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Tabs } from "../components/ui/Tabs";
import { Modal, ModalBtn } from "../components/ui/Modal";
import { TEMPLATE_CATEGORIES } from "../data/catalog";
import { FaSearch, FaClipboardList, FaCheckCircle, FaTimes, FaEye, FaTrash } from "react-icons/fa";

export interface FormTemplate {
  id: string;
  title: string;
  category: string;
  visibility: "All Clients" | "Plan-Restricted" | "Exclusive";
  status: "Published" | "Draft" | "Pending Approval" | "Archived";
  clientsUsing: number;
  submissionsPerWeek: number;
  required: boolean;
  version: string;
  submittedBy?: string;
}

export const TEMPLATES: FormTemplate[] = [
  { id: "t1", title: "Job Hazard Analysis (JHA)",       category: "JHA / JSA",           visibility: "All Clients", status: "Published", clientsUsing: 9, submissionsPerWeek: 312, required: true,  version: "v4.0" },
  { id: "t2", title: "Trench & Excavation Inspection",  category: "Daily Audits",        visibility: "All Clients", status: "Published", clientsUsing: 5, submissionsPerWeek: 148, required: true,  version: "v2.2" },
  { id: "t3", title: "Confined Space Entry Permit",     category: "Permits",             visibility: "All Clients", status: "Published", clientsUsing: 4, submissionsPerWeek: 62,  required: true,  version: "v1.6" },
  { id: "t4", title: "Equipment Pre-Use Inspection",    category: "Equipment Inspection",visibility: "All Clients", status: "Published", clientsUsing: 8, submissionsPerWeek: 401, required: true,  version: "v3.0" },
  { id: "t5", title: "Toolbox Talk Sign-In",            category: "Toolbox Talks",       visibility: "All Clients", status: "Published", clientsUsing: 9, submissionsPerWeek: 210, required: false, version: "v1.3" },
  { id: "t6", title: "Near-Miss / Incident Report",     category: "Incident Reports",    visibility: "All Clients", status: "Published", clientsUsing: 9, submissionsPerWeek: 24,  required: false, version: "v2.0" },
  { id: "t7", title: "Titan Steel — Daily Site Audit",  category: "Daily Audits",        visibility: "Exclusive",   status: "Published", clientsUsing: 1, submissionsPerWeek: 38,  required: true,  version: "v1.0" },
  { id: "t8", title: "Hot Work Permit",                 category: "Permits",             visibility: "All Clients", status: "Draft",     clientsUsing: 0, submissionsPerWeek: 0,   required: true,  version: "v0.4" },
  { id: "t9", title: "Trench Inspection — Coastal Excavation", category: "Daily Audits", visibility: "Exclusive",   status: "Pending Approval", clientsUsing: 0, submissionsPerWeek: 0, required: true, version: "v1.0", submittedBy: "Coastal Excavation Co." },
  { id: "t10", title: "Corrective Action Follow-Up",    category: "Corrective Actions",  visibility: "All Clients", status: "Published", clientsUsing: 9, submissionsPerWeek: 41,  required: false, version: "v1.1" },
];

export function templateById(id: string): FormTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

function statusBadge(s: FormTemplate["status"]): "success" | "neutral" | "warning" | "danger" {
  if (s === "Published") return "success";
  if (s === "Draft") return "neutral";
  if (s === "Pending Approval") return "warning";
  return "danger";
}

export default function TemplateLibrary() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("library");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [removing, setRemoving] = useState<FormTemplate | null>(null);

  const published = TEMPLATES.filter((t) => t.status !== "Pending Approval");
  const queue = TEMPLATES.filter((t) => t.status === "Pending Approval");

  const filtered = published.filter(
    (t) => t.title.toLowerCase().includes(search.toLowerCase()) && (categoryFilter === "All" || t.category === categoryFilter)
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Template Library</h1>
        <p className="mt-1 text-sm text-gray-500">
          Templates are built and customized by each client company. Super Admin reviews, approves, and manages the library.
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="px-5 pt-2">
          <Tabs
            tabs={[
              { key: "library", label: "Library", count: published.length },
              { key: "queue",   label: "Approval Queue", count: queue.length },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        {tab === "library" && (
          <div className="p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-1 min-w-50 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                <FaSearch size={13} className="shrink-0 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
              </div>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none cursor-pointer">
                <option>All</option>
                {TEMPLATE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="min-w-full">
                <thead className="bg-gray-50/70">
                  <tr>
                    {["Template", "Category", "Visibility", "Clients", "Submissions/wk", "Required", "Version", "Status", "Actions"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                            <FaClipboardList size={14} className="text-purple-600" />
                          </div>
                          <p className="truncate text-sm font-medium text-gray-900">{t.title}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{t.category}</td>
                      <td className="px-4 py-3"><Badge variant={t.visibility === "Exclusive" ? "purple" : t.visibility === "Plan-Restricted" ? "orange" : "info"}>{t.visibility}</Badge></td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{t.clientsUsing}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{t.submissionsPerWeek}</td>
                      <td className="px-4 py-3">{t.required ? <Badge variant="warning">Required</Badge> : <span className="text-xs text-gray-300">Optional</span>}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-gray-500">{t.version}</td>
                      <td className="px-4 py-3"><Badge variant={statusBadge(t.status)}>{t.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/templates/${t.id}`)}
                            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <FaEye size={11} /> View
                          </button>
                          <button
                            onClick={() => setRemoving(t)}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <FaTrash size={10} /> Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "queue" && (
          <div className="divide-y divide-gray-50">
            {queue.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-400">Nothing waiting for approval.</p>
            ) : queue.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-50">
                    <FaClipboardList size={15} className="text-yellow-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{t.title}</p>
                    <p className="text-xs text-gray-400">{t.version} · customized for {t.submittedBy}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={() => navigate(`/templates/${t.id}`)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"><FaEye size={10} /> Review</button>
                  <button onClick={() => navigate("/templates")} className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors"><FaCheckCircle size={11} /> Approve</button>
                  <button onClick={() => navigate("/templates")} className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"><FaTimes size={11} /> Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={removing !== null}
        onClose={() => setRemoving(null)}
        title="Remove Template"
        footer={<><ModalBtn variant="secondary" onClick={() => setRemoving(null)}>Cancel</ModalBtn><ModalBtn variant="danger" onClick={() => setRemoving(null)}>Remove Template</ModalBtn></>}
      >
        {removing && (
          <p className="text-sm text-gray-600">
            Remove <span className="font-semibold text-gray-900">{removing.title}</span> from the library? It will
            no longer be available to assign to any client. Forms already submitted stay tied to the version used
            at the time.
          </p>
        )}
      </Modal>
    </div>
  );
}
