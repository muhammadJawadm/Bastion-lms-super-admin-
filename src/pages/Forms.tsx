import { useState } from "react";
import { useNavigate } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Modal, FieldLabel, FieldInput, FieldSelect, ModalBtn } from "../components/ui/Modal";
import { TEMPLATE_CATEGORIES } from "../data/catalog";
import { FORMS, type FormProduct } from "../data/forms";
import type { Ownership } from "../data/catalog";
import { FaSearch, FaClipboardList, FaPlus, FaEye, FaCopy, FaArchive, FaUndo, FaTrash, FaInfoCircle } from "react-icons/fa";

function statusBadge(s: FormProduct["status"]): "success" | "neutral" | "danger" {
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

function CreateFormContent({ title, setTitle, category, setCategory, ownership, setOwnership }: {
  title: string; setTitle: (v: string) => void;
  category: string; setCategory: (v: string) => void;
  ownership: Ownership; setOwnership: (v: Ownership) => void;
}) {
  return (
    <div className="space-y-4">
      <div><FieldLabel>Form Title</FieldLabel><FieldInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Ladder Inspection Checklist" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Category</FieldLabel>
          <FieldSelect value={category} onChange={(e) => setCategory(e.target.value)}>
            {TEMPLATE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
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
      <div className="flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-3 text-xs text-blue-700">
        <FaInfoCircle size={13} className="mt-0.5 shrink-0" />
        Saving opens the Form Builder. Field-level editing here is a working draft — final behavior should be reconciled
        against the separate Course and Form Builder Requirements Report once available.
      </div>
    </div>
  );
}

export default function Forms() {
  const navigate = useNavigate();
  const [forms, setForms] = useState(FORMS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState(TEMPLATE_CATEGORIES[0]);
  const [newOwnership, setNewOwnership] = useState<Ownership>("Bastion Master");
  const [retiring, setRetiring] = useState<FormProduct | null>(null);

  const filtered = forms.filter(
    (f) => f.title.toLowerCase().includes(search.toLowerCase()) && (categoryFilter === "All" || f.category === categoryFilter)
  );

  function handleCreate() {
    setCreateOpen(false);
    const draftId = `new-${Date.now()}`;
    navigate(`/forms/${draftId}`, { state: { draft: { title: newTitle || "Untitled Form", category: newCategory, ownership: newOwnership } } });
  }
  function duplicate(f: FormProduct) {
    const copy: FormProduct = { ...f, id: `${f.id}-copy-${Date.now()}`, title: `Copy of ${f.title}`, status: "Draft", clientsUsing: 0, submissionsPerWeek: 0, ownership: "Bastion Master" };
    setForms((prev) => [copy, ...prev]);
  }
  function archive(f: FormProduct) { setForms((prev) => prev.map((x) => (x.id === f.id ? { ...x, status: "Archived" } : x))); }
  function restore(f: FormProduct) { setForms((prev) => prev.map((x) => (x.id === f.id ? { ...x, status: "Draft" } : x))); }
  function retire(f: FormProduct) { setForms((prev) => prev.filter((x) => x.id !== f.id)); setRetiring(null); }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bastion creates, versions and distributes every form. Company Admins manage the submissions their employees complete.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <FaPlus size={12} /> Create Form
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-1 min-w-50 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <FaSearch size={13} className="shrink-0 text-gray-400" />
              <input
                type="text"
                placeholder="Search forms..."
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
                  {["Form", "Category", "Ownership", "Clients", "Submissions/wk", "Version", "Status", "Actions"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                          <FaClipboardList size={14} className="text-purple-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">{f.title}</p>
                          {f.required && <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">Required</span>}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{f.category}</td>
                    <td className="px-4 py-3"><Badge variant={ownershipBadge(f.ownership)}>{f.ownership}</Badge></td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{f.clientsUsing}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{f.submissionsPerWeek}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-gray-500">{f.version}</td>
                    <td className="px-4 py-3"><Badge variant={statusBadge(f.status)}>{f.status}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => navigate(`/forms/${f.id}`)} title="View / Edit"
                          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                          <FaEye size={11} /> Open
                        </button>
                        <button onClick={() => duplicate(f)} title="Duplicate"
                          className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                          <FaCopy size={11} />
                        </button>
                        {f.status !== "Archived" ? (
                          <button onClick={() => archive(f)} title="Archive"
                            className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                            <FaArchive size={11} />
                          </button>
                        ) : (
                          <button onClick={() => restore(f)} title="Restore"
                            className="flex items-center justify-center rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs text-green-600 hover:bg-green-100 transition-colors">
                            <FaUndo size={11} />
                          </button>
                        )}
                        <button onClick={() => setRetiring(f)} title="Retire"
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
        title="Create Form"
        footer={<><ModalBtn variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</ModalBtn><ModalBtn variant="primary" onClick={handleCreate}>Save &amp; Open Builder</ModalBtn></>}
      >
        <CreateFormContent title={newTitle} setTitle={setNewTitle} category={newCategory} setCategory={setNewCategory} ownership={newOwnership} setOwnership={setNewOwnership} />
      </Modal>

      <Modal
        isOpen={retiring !== null}
        onClose={() => setRetiring(null)}
        title="Retire Form"
        footer={<><ModalBtn variant="secondary" onClick={() => setRetiring(null)}>Cancel</ModalBtn><ModalBtn variant="danger" onClick={() => retiring && retire(retiring)}>Retire Form</ModalBtn></>}
      >
        {retiring && (
          <p className="text-sm text-gray-600">
            Retire <span className="font-semibold text-gray-900">{retiring.title}</span> permanently? It will no
            longer be available to distribute to any client. Forms already submitted stay tied to the version used
            at the time.
          </p>
        )}
      </Modal>
    </div>
  );
}
