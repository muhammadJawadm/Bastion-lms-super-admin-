import { useState } from "react";
import { useNavigate } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Modal, FieldLabel, FieldInput, FieldSelect, FieldTextarea, ModalBtn } from "../components/ui/Modal";
import { CONTENT_REQUESTS, REQUEST_STATUSES, type ContentRequest, type RequestStatus } from "../data/contentRequests";
import { COMPANIES } from "../data/companies";
import { FaSearch, FaPlus, FaClipboardCheck } from "react-icons/fa";

function statusBadge(s: RequestStatus): "success" | "neutral" | "warning" | "danger" | "info" | "purple" {
  if (s === "Published") return "success";
  if (s === "Cancelled") return "danger";
  if (s === "On Hold") return "warning";
  if (s === "Ready to Publish") return "purple";
  if (s === "Requested" || s === "Scoping") return "neutral";
  return "info";
}
function priorityBadge(p: ContentRequest["priority"]): "info" | "warning" | "danger" | "neutral" {
  if (p === "Urgent") return "danger";
  if (p === "High") return "warning";
  if (p === "Medium") return "info";
  return "neutral";
}

function CreateRequestContent() {
  return (
    <div className="space-y-4">
      <div><FieldLabel>Title</FieldLabel><FieldInput placeholder="e.g. Bilingual JHA Templates" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Client Company</FieldLabel>
          <FieldSelect>{COMPANIES.map((c) => <option key={c.id}>{c.name}</option>)}</FieldSelect>
        </div>
        <div>
          <FieldLabel>Content Type</FieldLabel>
          <FieldSelect><option>Course</option><option>Form</option><option>Bundle</option><option>Certificate Layout</option></FieldSelect>
        </div>
        <div>
          <FieldLabel>Priority</FieldLabel>
          <FieldSelect><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></FieldSelect>
        </div>
        <div><FieldLabel>Due Date</FieldLabel><FieldInput type="date" /></div>
        <div className="col-span-2"><FieldLabel>SOW / Contract Reference</FieldLabel><FieldInput placeholder="e.g. SOW-2026-01" /></div>
      </div>
      <div><FieldLabel>Description</FieldLabel><FieldTextarea rows={3} placeholder="What is being requested and why..." /></div>
      <div><FieldLabel>Requested Scope</FieldLabel><FieldTextarea rows={2} placeholder="Specific scope boundaries..." /></div>
    </div>
  );
}

export default function ContentRequests() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | RequestStatus>("All");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = CONTENT_REQUESTS.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === "All" || r.status === statusFilter) &&
      (companyFilter === "All" || r.companyName === companyFilter) &&
      (priorityFilter === "All" || r.priority === priorityFilter)
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Requests</h1>
          <p className="mt-1 text-sm text-gray-500">Track every custom deliverable from request through development, review and publication.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <FaPlus size={12} /> New Request
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-50 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <FaSearch size={13} className="shrink-0 text-gray-400" />
          <input
            type="text"
            placeholder="Search requests..."
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
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none cursor-pointer">
          {["All", "Low", "Medium", "High", "Urgent"].map((p) => <option key={p}>{p}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "All" | RequestStatus)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none cursor-pointer">
          <option>All</option>
          {REQUEST_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/70">
              <tr>{["Request", "Client", "Type", "Priority", "Due Date", "Owner", "Status"].map((h) => <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-400">No requests match your filters.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} onClick={() => navigate(`/content-requests/${r.id}`)} className="cursor-pointer hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50"><FaClipboardCheck size={12} className="text-blue-600" /></div>
                      <p className="text-sm font-medium text-gray-900">{r.title}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-600">{r.companyName}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">{r.contentType}</td>
                  <td className="px-5 py-3.5"><Badge variant={priorityBadge(r.priority)}>{r.priority}</Badge></td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">{r.dueDate}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">{r.owner}</td>
                  <td className="px-5 py-3.5"><Badge variant={statusBadge(r.status)}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
          Showing {filtered.length} of {CONTENT_REQUESTS.length} requests
        </div>
      </div>

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Content Request"
        size="lg"
        footer={<><ModalBtn variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</ModalBtn><ModalBtn variant="primary" onClick={() => setCreateOpen(false)}>Create Request</ModalBtn></>}
      >
        <CreateRequestContent />
      </Modal>
    </div>
  );
}
