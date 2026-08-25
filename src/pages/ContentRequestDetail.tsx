import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Modal, FieldLabel, FieldTextarea, ModalBtn } from "../components/ui/Modal";
import { contentRequestById, REQUEST_STATUSES, type RequestStatus } from "../data/contentRequests";
import { FaArrowLeft, FaExternalLinkAlt, FaHistory, FaLock, FaGlobe } from "react-icons/fa";

function statusBadge(s: RequestStatus): "success" | "neutral" | "warning" | "danger" | "info" | "purple" {
  if (s === "Published") return "success";
  if (s === "Cancelled") return "danger";
  if (s === "On Hold") return "warning";
  if (s === "Ready to Publish") return "purple";
  if (s === "Requested" || s === "Scoping") return "neutral";
  return "info";
}
function priorityBadge(p: string): "info" | "warning" | "danger" | "neutral" {
  if (p === "Urgent") return "danger";
  if (p === "High") return "warning";
  if (p === "Medium") return "info";
  return "neutral";
}

export default function ContentRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const request = id ? contentRequestById(id) : undefined;
  const [status, setStatus] = useState<RequestStatus | null>(null);
  const [reasonTarget, setReasonTarget] = useState<RequestStatus | null>(null);

  if (!request) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-gray-500">Content request not found.</p>
        <button onClick={() => navigate("/content-requests")} className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800">&larr; Back to Content Requests</button>
      </div>
    );
  }

  const currentStatus = status ?? request.status;
  const currentIdx = REQUEST_STATUSES.indexOf(currentStatus);

  function requestStatusChange(next: RequestStatus) {
    if (next === "Cancelled" || next === "On Hold" || (currentStatus === "Published" && next !== "Published")) {
      setReasonTarget(next);
    } else {
      setStatus(next);
    }
  }
  function confirmReasonChange() {
    if (reasonTarget) setStatus(reasonTarget);
    setReasonTarget(null);
  }

  return (
    <div className="space-y-4">
      <button onClick={() => navigate("/content-requests")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <FaArrowLeft size={11} /> Back to Content Requests
      </button>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{request.title}</h1>
              <Badge variant={statusBadge(currentStatus)}>{currentStatus}</Badge>
              <Badge variant={priorityBadge(request.priority)}>{request.priority}</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500">{request.companyName} · {request.contentType} · Due {request.dueDate}</p>
          </div>
          {request.linkedContentId && (
            <button
              onClick={() => navigate(`/${request.linkedContentType === "form" ? "forms" : "courses"}/${request.linkedContentId}`)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <FaExternalLinkAlt size={11} /> Open Linked {request.linkedContentType === "form" ? "Form" : "Course"}
            </button>
          )}
        </div>

        <div className="mt-5 overflow-x-auto">
          <div className="flex min-w-max items-center gap-1">
            {REQUEST_STATUSES.filter((s) => s !== "On Hold" && s !== "Cancelled").map((s, i) => (
              <button
                key={s}
                onClick={() => requestStatusChange(s)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  i <= currentIdx && currentStatus !== "Cancelled" && currentStatus !== "On Hold"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
            <span className="mx-1 text-gray-300">|</span>
            <button onClick={() => requestStatusChange("On Hold")} className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${currentStatus === "On Hold" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>On Hold</button>
            <button onClick={() => requestStatusChange("Cancelled")} className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${currentStatus === "Cancelled" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>Cancelled</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Description</p>
            <p className="text-sm text-gray-700">{request.description}</p>
            <p className="mt-3 mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Requested Scope</p>
            <p className="text-sm text-gray-700">{request.requestedScope}</p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400"><FaLock size={10} /> Internal Notes</p>
            <p className="text-sm text-gray-700">{request.internalNotes || "—"}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400"><FaGlobe size={10} /> Client-Visible Notes</p>
            <p className="text-sm text-gray-700">{request.clientVisibleNotes || "—"}</p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400"><FaHistory size={11} /> Revision History</p>
            {request.revisionHistory.length === 0 ? (
              <p className="text-xs text-gray-400">No revisions logged yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {request.revisionHistory.map((r, i) => (
                  <li key={i} className="rounded-lg bg-gray-50 px-3.5 py-2.5">
                    <p className="text-sm text-gray-700">{r.summary}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{r.author} · {r.date}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm text-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Assignment</p>
            {[
              { label: "Owner", value: request.owner },
              { label: "Assigned Developer", value: request.assignedDeveloper },
              { label: "Internal Reviewer", value: request.internalReviewer },
              { label: "Contributors", value: request.contributors.length ? request.contributors.join(", ") : "—" },
            ].map((d) => (
              <div key={d.label} className="border-b border-gray-50 py-2 last:border-0">
                <p className="text-xs text-gray-400">{d.label}</p>
                <p className="mt-0.5 font-medium text-gray-800">{d.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm text-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Reference</p>
            {[
              { label: "SOW / Contract Ref", value: request.sowReference },
              { label: "Created", value: request.createdAt },
              { label: "Delivered", value: request.deliveredAt ?? "—" },
            ].map((d) => (
              <div key={d.label} className="border-b border-gray-50 py-2 last:border-0">
                <p className="text-xs text-gray-400">{d.label}</p>
                <p className="mt-0.5 font-medium text-gray-800">{d.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={reasonTarget !== null}
        onClose={() => setReasonTarget(null)}
        title={`Move to "${reasonTarget}"`}
        footer={<><ModalBtn variant="secondary" onClick={() => setReasonTarget(null)}>Cancel</ModalBtn><ModalBtn variant="primary" onClick={confirmReasonChange}>Confirm</ModalBtn></>}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Moving a published or in-progress request to <span className="font-semibold">{reasonTarget}</span> requires a reason. This is logged to the audit trail.
          </p>
          <div><FieldLabel>Reason (required)</FieldLabel><FieldTextarea rows={3} placeholder="Explain why this request is being reopened, put on hold, or cancelled..." /></div>
        </div>
      </Modal>
    </div>
  );
}
