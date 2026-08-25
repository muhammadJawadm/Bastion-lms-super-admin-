import { useState } from "react";
import { useNavigate } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Modal, FieldLabel, FieldInput, FieldSelect, ModalBtn } from "../components/ui/Modal";
import { COURSE_CATEGORIES, type Ownership, type VersionEntry } from "../data/catalog";
import { FaSearch, FaGraduationCap, FaPlus, FaEye, FaCopy, FaArchive, FaUndo, FaTrash } from "react-icons/fa";

export interface Course {
  id: string;
  title: string;
  category: string;
  tags: string[];
  visibility: "All Clients" | "Plan-Restricted" | "Exclusive";
  ownership: Ownership;
  status: "Published" | "Draft" | "Archived";
  clientsUsing: number;
  enrolled: number;
  completionRate: number;
  version: string;
  versionHistory: VersionEntry[];
}

const v = (version: string, date: string, summary: string, publicationState: VersionEntry["publicationState"] = "Published"): VersionEntry =>
  ({ version, date, author: "Marisol Cruz", reviewer: "Danny Osei", summary, publicationState });

export const COURSES: Course[] = [
  { id: "co1", title: "Excavation Safety Fundamentals", category: "Excavation & Trenching", tags: ["Construction", "Excavation"], visibility: "All Clients", ownership: "Shared Content", status: "Published", clientsUsing: 8, enrolled: 612, completionRate: 88, version: "v3.1", versionHistory: [v("v3.1", "16 Aug 2026", "Regulatory citation correction, pushed to all clients"), v("v3.0", "02 Jun 2026", "Refreshed field photography")] },
  { id: "co2", title: "Fall Protection Basics",          category: "Fall Protection",        tags: ["Construction", "Roofing"],   visibility: "All Clients", ownership: "Shared Content", status: "Published", clientsUsing: 9, enrolled: 744, completionRate: 91, version: "v2.4", versionHistory: [v("v2.4", "10 May 2026", "Added ladder safety segment"), v("v2.3", "14 Jan 2026", "Quiz bank refresh")] },
  { id: "co3", title: "Confined Space Awareness",        category: "Confined Space",         tags: ["Oil & Gas", "Utilities"],    visibility: "All Clients", ownership: "Shared Content", status: "Published", clientsUsing: 6, enrolled: 388, completionRate: 76, version: "v1.8", versionHistory: [v("v1.8", "20 Aug 2026", "Atmospheric monitoring equipment update, pending client review"), v("v1.7", "11 Mar 2026", "Added updated hazard signage")] },
  { id: "co4", title: "Electrical Safety — Arc Flash",   category: "Electrical Safety",      tags: ["Electrical", "Utilities"],   visibility: "Plan-Restricted", ownership: "Shared Content", status: "Published", clientsUsing: 4, enrolled: 210, completionRate: 82, version: "v1.2", versionHistory: [v("v1.2", "01 Jul 2024", "Added PPE category chart"), v("v1.1", "12 Sep 2023", "Initial arc-flash boundary content")] },
  { id: "co5", title: "Titan Steel — Site Orientation",  category: "General Orientation",    tags: ["Construction"],              visibility: "Exclusive", ownership: "Client Exclusive", status: "Published", clientsUsing: 1, enrolled: 204, completionRate: 95, version: "v1.0", versionHistory: [v("v1.0", "18 Jan 2024", "Initial client-exclusive build for Titan Steel")] },
  { id: "co6", title: "Heat Stress Prevention",          category: "Emergency Response",     tags: ["Construction", "Oil & Gas"], visibility: "All Clients", ownership: "Bastion Master", status: "Draft", clientsUsing: 0, enrolled: 0, completionRate: 0, version: "v0.3", versionHistory: [v("v0.3", "15 Aug 2026", "In internal review, requested by Titan Steel", "Draft")] },
  { id: "co7", title: "Confined Space Entry — v2",       category: "Confined Space",         tags: ["Oil & Gas"],                 visibility: "All Clients", ownership: "Bastion Master", status: "Draft", clientsUsing: 0, enrolled: 0, completionRate: 0, version: "v2.0", versionHistory: [v("v2.0", "05 Aug 2026", "Full rebuild in progress", "Draft")] },
  { id: "co8", title: "Hazard Communication (HazCom)",   category: "Hazard Communication",   tags: ["Manufacturing"],             visibility: "All Clients", ownership: "Shared Content", status: "Published", clientsUsing: 5, enrolled: 296, completionRate: 79, version: "v1.5", versionHistory: [v("v1.5", "09 Apr 2026", "GHS label update")] },
  { id: "co9", title: "PPE Selection & Use",             category: "PPE",                    tags: ["Construction", "Manufacturing"], visibility: "All Clients", ownership: "Shared Content", status: "Published", clientsUsing: 9, enrolled: 810, completionRate: 93, version: "v2.0", versionHistory: [v("v2.0", "14 Dec 2024", "Photography refresh"), v("v1.4", "19 Nov 2023", "Initial release")] },
  { id: "co10", title: "Environmental Spill Response",   category: "Environmental Compliance", tags: ["Oil & Gas"],               visibility: "Exclusive", ownership: "Client Exclusive", status: "Archived", clientsUsing: 0, enrolled: 64, completionRate: 71, version: "v1.0", versionHistory: [v("v1.0", "22 Aug 2022", "Initial release, archived after contract lapse", "Archived")] },
];

export function courseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

function statusBadge(s: Course["status"]): "success" | "neutral" | "danger" {
  if (s === "Published") return "success";
  if (s === "Draft") return "neutral";
  return "danger";
}
function ownershipBadge(o: Ownership): "danger" | "purple" | "info" | "orange" {
  if (o === "Bastion Master") return "danger";
  if (o === "Client Exclusive") return "purple";
  if (o === "Locked Client Copy") return "orange";
  return "info";
}

function CreateCourseContent({ title, setTitle, category, setCategory, ownership, setOwnership }: {
  title: string; setTitle: (v: string) => void;
  category: string; setCategory: (v: string) => void;
  ownership: Ownership; setOwnership: (v: Ownership) => void;
}) {
  return (
    <div className="space-y-4">
      <div><FieldLabel>Course Title</FieldLabel><FieldInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Ladder Safety Fundamentals" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Category</FieldLabel>
          <FieldSelect value={category} onChange={(e) => setCategory(e.target.value)}>
            {COURSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </FieldSelect>
        </div>
        <div>
          <FieldLabel>Ownership</FieldLabel>
          <FieldSelect value={ownership} onChange={(e) => setOwnership(e.target.value as Ownership)}>
            <option>Bastion Master</option>
            <option>Client Exclusive</option>
            <option>Shared Content</option>
          </FieldSelect>
        </div>
      </div>
      <p className="text-xs text-gray-400">Saving opens the full Course Builder, where slides, blocks and distribution are configured.</p>
    </div>
  );
}

export default function CourseLibrary() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState(COURSES);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState(COURSE_CATEGORIES[0]);
  const [newOwnership, setNewOwnership] = useState<Ownership>("Bastion Master");
  const [retiring, setRetiring] = useState<Course | null>(null);

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter === "All" || c.category === categoryFilter)
  );

  function handleCreate() {
    setCreateOpen(false);
    const draftId = `new-${Date.now()}`;
    navigate(`/courses/${draftId}`, { state: { draft: { title: newTitle || "Untitled Course", category: newCategory, ownership: newOwnership } } });
  }

  function duplicate(c: Course) {
    const copy: Course = { ...c, id: `${c.id}-copy-${Date.now()}`, title: `Copy of ${c.title}`, status: "Draft", clientsUsing: 0, enrolled: 0, completionRate: 0, ownership: "Bastion Master" };
    setCourses((prev) => [copy, ...prev]);
  }
  function archive(c: Course) { setCourses((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: "Archived" } : x))); }
  function restore(c: Course) { setCourses((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: "Draft" } : x))); }
  function retire(c: Course) { setCourses((prev) => prev.filter((x) => x.id !== c.id)); setRetiring(null); }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bastion creates, versions and distributes every course. Company Admins assign published courses to their own employees.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <FaPlus size={12} /> Create Course
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
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
                  {["Course", "Category", "Ownership", "Visibility", "Clients", "Version", "Status", "Actions"].map((h) => (
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
                    <td className="px-4 py-3"><Badge variant={ownershipBadge(c.ownership)}>{c.ownership}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={c.visibility === "Exclusive" ? "purple" : c.visibility === "Plan-Restricted" ? "orange" : "info"}>{c.visibility}</Badge></td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{c.clientsUsing} clients · {c.enrolled} enrolled</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-gray-500">{c.version}</td>
                    <td className="px-4 py-3"><Badge variant={statusBadge(c.status)}>{c.status}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => navigate(`/courses/${c.id}`)} title="View / Edit"
                          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                          <FaEye size={11} /> Open
                        </button>
                        <button onClick={() => duplicate(c)} title="Duplicate"
                          className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                          <FaCopy size={11} />
                        </button>
                        {c.status !== "Archived" ? (
                          <button onClick={() => archive(c)} title="Archive"
                            className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                            <FaArchive size={11} />
                          </button>
                        ) : (
                          <button onClick={() => restore(c)} title="Restore"
                            className="flex items-center justify-center rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs text-green-600 hover:bg-green-100 transition-colors">
                            <FaUndo size={11} />
                          </button>
                        )}
                        <button onClick={() => setRetiring(c)} title="Retire"
                          className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-100 transition-colors">
                          <FaTrash size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Course"
        footer={<><ModalBtn variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</ModalBtn><ModalBtn variant="primary" onClick={handleCreate}>Save &amp; Open Builder</ModalBtn></>}
      >
        <CreateCourseContent title={newTitle} setTitle={setNewTitle} category={newCategory} setCategory={setNewCategory} ownership={newOwnership} setOwnership={setNewOwnership} />
      </Modal>

      <Modal
        isOpen={retiring !== null}
        onClose={() => setRetiring(null)}
        title="Retire Course"
        footer={<><ModalBtn variant="secondary" onClick={() => setRetiring(null)}>Cancel</ModalBtn><ModalBtn variant="danger" onClick={() => retiring && retire(retiring)}>Retire Course</ModalBtn></>}
      >
        {retiring && (
          <p className="text-sm text-gray-600">
            Retire <span className="font-semibold text-gray-900">{retiring.title}</span> permanently? It will no
            longer be available to distribute to any client. Clients already assigned keep access to their current
            enrollment records and the version they completed.
          </p>
        )}
      </Modal>
    </div>
  );
}
