import { useState } from "react";
import { useNavigate } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Tabs } from "../components/ui/Tabs";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Modal, ModalBtn } from "../components/ui/Modal";
import { COURSE_CATEGORIES } from "../data/catalog";
import { FaSearch, FaGraduationCap, FaCheckCircle, FaTimes, FaLayerGroup, FaEye, FaTrash } from "react-icons/fa";

export interface Course {
  id: string;
  title: string;
  category: string;
  tags: string[];
  visibility: "All Clients" | "Plan-Restricted" | "Exclusive";
  status: "Published" | "Draft" | "Pending Approval" | "Archived";
  clientsUsing: number;
  enrolled: number;
  completionRate: number;
  version: string;
  submittedBy?: string;
}

export const COURSES: Course[] = [
  { id: "co1", title: "Excavation Safety Fundamentals", category: "Excavation & Trenching", tags: ["Construction", "Excavation"], visibility: "All Clients",      status: "Published", clientsUsing: 8, enrolled: 612, completionRate: 88, version: "v3.1" },
  { id: "co2", title: "Fall Protection Basics",          category: "Fall Protection",        tags: ["Construction", "Roofing"],   visibility: "All Clients",      status: "Published", clientsUsing: 9, enrolled: 744, completionRate: 91, version: "v2.4" },
  { id: "co3", title: "Confined Space Awareness",        category: "Confined Space",         tags: ["Oil & Gas", "Utilities"],    visibility: "All Clients",      status: "Published", clientsUsing: 6, enrolled: 388, completionRate: 76, version: "v1.8" },
  { id: "co4", title: "Electrical Safety — Arc Flash",   category: "Electrical Safety",      tags: ["Electrical", "Utilities"],   visibility: "Plan-Restricted",  status: "Published", clientsUsing: 4, enrolled: 210, completionRate: 82, version: "v1.2" },
  { id: "co5", title: "Titan Steel — Site Orientation",  category: "General Orientation",    tags: ["Construction"],              visibility: "Exclusive",        status: "Published", clientsUsing: 1, enrolled: 204, completionRate: 95, version: "v1.0" },
  { id: "co6", title: "Heat Stress Prevention",          category: "Emergency Response",     tags: ["Construction", "Oil & Gas"], visibility: "All Clients",      status: "Draft",     clientsUsing: 0, enrolled: 0,   completionRate: 0,  version: "v0.3" },
  { id: "co7", title: "Confined Space Entry — v2",       category: "Confined Space",         tags: ["Oil & Gas"],                 visibility: "All Clients",      status: "Pending Approval", clientsUsing: 0, enrolled: 0, completionRate: 0, version: "v2.0", submittedBy: "Coastal Excavation Co." },
  { id: "co8", title: "Hazard Communication (HazCom)",   category: "Hazard Communication",   tags: ["Manufacturing"],             visibility: "All Clients",      status: "Published", clientsUsing: 5, enrolled: 296, completionRate: 79, version: "v1.5" },
  { id: "co9", title: "PPE Selection & Use",             category: "PPE",                    tags: ["Construction", "Manufacturing"], visibility: "All Clients",  status: "Published", clientsUsing: 9, enrolled: 810, completionRate: 93, version: "v2.0" },
  { id: "co10", title: "Environmental Spill Response",   category: "Environmental Compliance", tags: ["Oil & Gas"],               visibility: "Exclusive",        status: "Archived",  clientsUsing: 0, enrolled: 64,  completionRate: 71, version: "v1.0" },
];

export function courseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

function statusBadge(s: Course["status"]): "success" | "neutral" | "warning" | "danger" {
  if (s === "Published") return "success";
  if (s === "Draft") return "neutral";
  if (s === "Pending Approval") return "warning";
  return "danger";
}

export default function CourseLibrary() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("library");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [bundleOpen, setBundleOpen] = useState(false);
  const [removing, setRemoving] = useState<Course | null>(null);

  const published = COURSES.filter((c) => c.status !== "Pending Approval");
  const queue = COURSES.filter((c) => c.status === "Pending Approval");

  const filtered = published.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter === "All" || c.category === categoryFilter)
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Library</h1>
          <p className="mt-1 text-sm text-gray-500">
            Courses are built and edited by each client company. Super Admin reviews, approves, and manages the library.
          </p>
        </div>
        <button
          onClick={() => setBundleOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <FaLayerGroup size={12} /> New Bundle
        </button>
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
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
              </div>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none cursor-pointer">
                <option>All</option>
                {COURSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="min-w-full">
                <thead className="bg-gray-50/70">
                  <tr>
                    {["Course", "Category", "Visibility", "Clients", "Completion", "Version", "Status", "Actions"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                            <FaGraduationCap size={14} className="text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">{c.title}</p>
                            <div className="mt-0.5 flex gap-1">
                              {c.tags.map((t) => <span key={t} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">{t}</span>)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{c.category}</td>
                      <td className="px-4 py-3"><Badge variant={c.visibility === "Exclusive" ? "purple" : c.visibility === "Plan-Restricted" ? "orange" : "info"}>{c.visibility}</Badge></td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{c.clientsUsing} clients · {c.enrolled} enrolled</td>
                      <td className="px-4 py-3 w-32"><ProgressBar value={c.completionRate} trailing={`${c.completionRate}%`} /></td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-gray-500">{c.version}</td>
                      <td className="px-4 py-3"><Badge variant={statusBadge(c.status)}>{c.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/courses/${c.id}`)}
                            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <FaEye size={11} /> View
                          </button>
                          <button
                            onClick={() => setRemoving(c)}
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
            ) : queue.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-50">
                    <FaGraduationCap size={15} className="text-yellow-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{c.title}</p>
                    <p className="text-xs text-gray-400">{c.version} · submitted by {c.submittedBy}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={() => navigate(`/courses/${c.id}`)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"><FaEye size={10} /> Review</button>
                  <button onClick={() => navigate("/courses")} className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors"><FaCheckCircle size={11} /> Approve</button>
                  <button onClick={() => navigate("/courses")} className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"><FaTimes size={11} /> Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={bundleOpen}
        onClose={() => setBundleOpen(false)}
        title="New Learning Path / Bundle"
        footer={<><ModalBtn variant="secondary" onClick={() => setBundleOpen(false)}>Cancel</ModalBtn><ModalBtn variant="primary" onClick={() => setBundleOpen(false)}>Create Bundle</ModalBtn></>}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Group existing published courses into a package that assigns as a single unit.</p>
          <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-lg border border-gray-200 p-2">
            {COURSES.filter((c) => c.status === "Published").map((c) => (
              <label key={c.id} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-700">{c.title}</span>
              </label>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={removing !== null}
        onClose={() => setRemoving(null)}
        title="Remove Course"
        footer={<><ModalBtn variant="secondary" onClick={() => setRemoving(null)}>Cancel</ModalBtn><ModalBtn variant="danger" onClick={() => setRemoving(null)}>Remove Course</ModalBtn></>}
      >
        {removing && (
          <p className="text-sm text-gray-600">
            Remove <span className="font-semibold text-gray-900">{removing.title}</span> from the library? It will
            no longer be available to assign to any client. Clients already assigned keep access to their current
            enrollment records.
          </p>
        )}
      </Modal>
    </div>
  );
}
