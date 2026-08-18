import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Modal, ModalBtn } from "../components/ui/Modal";
import { templateById } from "./TemplateLibrary";
import {
  FaArrowLeft, FaMobileAlt, FaDesktop, FaCheckCircle, FaTimes, FaTrash,
  FaFont, FaAlignLeft, FaHashtag, FaCalendarAlt, FaCaretSquareDown,
  FaCheckSquare, FaThumbsUp, FaListUl, FaExclamationTriangle, FaCamera,
  FaSignature, FaPaperclip, FaHardHat, FaMapMarkerAlt, FaTools,
  FaSatelliteDish, FaBarcode, FaGripLines,
} from "react-icons/fa";

type FieldType =
  | "text" | "longtext" | "number" | "date" | "dropdown" | "multiselect"
  | "yesno" | "wordbank" | "risk" | "photo" | "signature" | "file"
  | "crew" | "site" | "equipment" | "gps" | "barcode";

interface Field {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  conditional?: boolean;
  repeatable?: boolean;
}

interface Section { id: string; title: string; fields: Field[] }

const FIELD_META: Record<FieldType, { label: string; icon: React.ElementType }> = {
  text:        { label: "Short Text",      icon: FaFont            },
  longtext:    { label: "Long Text",       icon: FaAlignLeft       },
  number:      { label: "Number + Units",  icon: FaHashtag         },
  date:        { label: "Date / Time",     icon: FaCalendarAlt     },
  dropdown:    { label: "Dropdown",        icon: FaCaretSquareDown },
  multiselect: { label: "Multi-Select",    icon: FaCheckSquare     },
  yesno:       { label: "Yes / No / N/A",  icon: FaThumbsUp        },
  wordbank:    { label: "Word Bank List",  icon: FaListUl          },
  risk:        { label: "Risk Rating",     icon: FaExclamationTriangle },
  photo:       { label: "Photo Capture",   icon: FaCamera          },
  signature:   { label: "Signature",       icon: FaSignature       },
  file:        { label: "File Attachment", icon: FaPaperclip       },
  crew:        { label: "Crew Picker",     icon: FaHardHat         },
  site:        { label: "Site Picker",     icon: FaMapMarkerAlt    },
  equipment:   { label: "Equipment Picker", icon: FaTools          },
  gps:         { label: "GPS / Weather",   icon: FaSatelliteDish   },
  barcode:     { label: "Barcode / QR",    icon: FaBarcode         },
};

const SECTIONS: Section[] = [
  { id: "sec1", title: "Site Info", fields: [
    { id: "f1", type: "site", label: "Job Site", required: true },
    { id: "f2", type: "date", label: "Date & Time", required: true },
    { id: "f3", type: "gps", label: "GPS, weather & timestamp", required: true },
  ]},
  { id: "sec2", title: "Crew", fields: [
    { id: "f4", type: "crew", label: "Crew members present", required: true, repeatable: true },
  ]},
  { id: "sec3", title: "Hazards", fields: [
    { id: "f5", type: "wordbank", label: "Identified hazards", required: true, repeatable: true },
    { id: "f6", type: "risk",     label: "Risk rating", required: true },
    { id: "f7", type: "number",   label: "Trench depth (ft)", required: false },
    { id: "f8", type: "yesno",    label: "Protective system required?", required: true, conditional: true },
  ]},
  { id: "sec4", title: "Sign-Off", fields: [
    { id: "f9", type: "signature", label: "Worker signature", required: true },
    { id: "f10", type: "signature", label: "Competent person signature", required: true },
  ]},
];

const SIGNOFF_STAGES = ["Worker", "Foreman", "Competent Person / Safety Manager"];

function statusBadge(s: string): "success" | "neutral" | "warning" | "danger" {
  if (s === "Published") return "success";
  if (s === "Draft") return "neutral";
  if (s === "Pending Approval") return "warning";
  return "danger";
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-xs font-medium text-gray-800">{value}</span>
    </div>
  );
}

export default function TemplateView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const template = id ? templateById(id) : undefined;

  const [activeSectionId, setActiveSectionId] = useState(SECTIONS[0].id);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  if (!template) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-gray-500">Template not found.</p>
        <button onClick={() => navigate("/templates")} className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800">&larr; Back to Template Library</button>
      </div>
    );
  }

  const activeSection = SECTIONS.find((s) => s.id === activeSectionId) ?? SECTIONS[0];
  const isPending = template.status === "Pending Approval";

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={() => navigate("/templates")} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <FaArrowLeft size={14} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-bold text-gray-900">{template.title}</h1>
              <Badge variant={statusBadge(template.status)}>{template.status}</Badge>
            </div>
            <p className="text-xs text-gray-400">Owned and edited by the client company · Super Admin has view, approve, and remove access</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setMobilePreview((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {mobilePreview ? <FaDesktop size={13} /> : <FaMobileAlt size={13} />}
            {mobilePreview ? "Desktop" : "Mobile Preview"}
          </button>
          {isPending && (
            <>
              <button onClick={() => navigate("/templates")} className="flex items-center gap-2 rounded-lg bg-green-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors">
                <FaCheckCircle size={12} /> Approve
              </button>
              <button onClick={() => navigate("/templates")} className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors">
                <FaTimes size={12} /> Reject
              </button>
            </>
          )}
          <button onClick={() => setRemoveOpen(true)} className="flex items-center gap-2 rounded-lg border border-red-200 px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <FaTrash size={12} /> Remove
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[200px_1fr_280px]">
        {/* Sections list (read-only) */}
        <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm h-fit">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Sections</p>
          <div className="space-y-1.5">
            {SECTIONS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveSectionId(s.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
                  s.id === activeSectionId ? "bg-purple-50 text-purple-700" : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                <span className="w-4 shrink-0 text-xs text-gray-400">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm">{s.title}</span>
                <span className="shrink-0 text-[10px] text-gray-300">{s.fields.length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas (read-only) */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className={mobilePreview ? "mx-auto w-72 rounded-4xl border-8 border-gray-800 bg-white p-3 shadow-xl" : ""}>
            <div className={mobilePreview ? "rounded-xl bg-gray-50 p-3 min-h-96" : "rounded-xl border-2 border-dashed border-gray-100 bg-gray-50/50 p-6 min-h-96"}>
              <p className="mb-3 text-sm font-semibold text-gray-800">{activeSection.title}</p>
              <div className="space-y-2">
                {activeSection.fields.map((f) => {
                  const meta = FIELD_META[f.type];
                  return (
                    <div key={f.id} className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-purple-50">
                        <meta.icon size={12} className="text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-gray-700">{f.label}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1">
                          <span className="text-[10px] text-gray-400">{meta.label}</span>
                          {f.conditional && <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[9px] font-medium text-orange-600">Conditional</span>}
                          {f.repeatable && <span className="rounded bg-cyan-50 px-1.5 py-0.5 text-[9px] font-medium text-cyan-600">Repeatable</span>}
                        </div>
                      </div>
                      {f.required
                        ? <Badge variant="warning">Required</Badge>
                        : <span className="shrink-0 text-[10px] text-gray-300">Optional</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Info panel (read-only) */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Template Info</p>
            <div className="divide-y divide-gray-50">
              <InfoRow label="Category" value={template.category} />
              <InfoRow label="Visibility" value={template.visibility} />
              <InfoRow label="Version" value={template.version} />
              <InfoRow label="Clients Using" value={String(template.clientsUsing)} />
              <InfoRow label="Submissions / wk" value={String(template.submissionsPerWeek)} />
              <InfoRow label="Required Before Work" value={template.required ? "Yes" : "No"} />
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <FaGripLines size={11} /> Sign-Off Workflow
            </p>
            <div className="space-y-1.5">
              {SIGNOFF_STAGES.map((stage, i) => (
                <div key={stage} className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-700">{i + 1}</span>
                  <span className="text-xs text-gray-700">{stage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={removeOpen}
        onClose={() => setRemoveOpen(false)}
        title="Remove Template"
        footer={<><ModalBtn variant="secondary" onClick={() => setRemoveOpen(false)}>Cancel</ModalBtn><ModalBtn variant="danger" onClick={() => navigate("/templates")}>Remove Template</ModalBtn></>}
      >
        <p className="text-sm text-gray-600">
          Remove <span className="font-semibold text-gray-900">{template.title}</span> from the library? It will no
          longer be available to assign to any client. Forms already submitted stay tied to the version used at the time.
        </p>
      </Modal>
    </div>
  );
}
