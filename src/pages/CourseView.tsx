import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Badge } from "../components/ui/Badge";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Modal, ModalBtn } from "../components/ui/Modal";
import { courseById } from "./CourseLibrary";
import {
  FaArrowLeft, FaMobileAlt, FaDesktop, FaCheckCircle, FaTimes, FaTrash,
  FaImage, FaPlay, FaFilePdf, FaHistory,
} from "react-icons/fa";

type Block =
  | { id: string; type: "text"; heading: string; body: string }
  | { id: string; type: "image"; caption: string }
  | { id: string; type: "video"; caption: string; duration: string }
  | { id: string; type: "pdf"; fileName: string; pages: number }
  | { id: string; type: "quiz"; question: string; options: string[]; correctIndex: number };

interface Slide { id: string; title: string; blocks: Block[] }

const SLIDES: Slide[] = [
  {
    id: "s1", title: "Welcome & Objectives",
    blocks: [
      { id: "b1", type: "text", heading: "Why this training matters", body: "Trench and excavation work is one of the most hazardous activities in construction. This course covers how to recognize soil hazards, when a protective system is required, and how to inspect a trench before crews enter." },
      { id: "b2", type: "image", caption: "Example: unsupported trench wall on a residential jobsite" },
    ],
  },
  {
    id: "s2", title: "Recognizing the Hazard",
    blocks: [
      { id: "b3", type: "video", caption: "Field footage: unsupported trench wall failure", duration: "2:14" },
      { id: "b4", type: "text", heading: "Key hazard points", body: "Watch for water seepage, vibration from nearby equipment, previously disturbed soil, and spoil piles within 2 feet of the trench edge — each significantly increases collapse risk." },
      { id: "b5", type: "pdf", fileName: "OSHA-Excavation-Standard-1926-Subpart-P.pdf", pages: 14 },
    ],
  },
  {
    id: "s3", title: "Knowledge Check",
    blocks: [
      { id: "b6", type: "quiz", question: "At what depth does OSHA require a protective system for a trench?", options: ["3 feet", "4 feet", "5 feet", "6 feet"], correctIndex: 2 },
    ],
  },
  {
    id: "s4", title: "Sign-Off",
    blocks: [
      { id: "b7", type: "text", heading: "Acknowledgment", body: "\"I have read and understood the hazards and controls described in this training and agree to follow all site safety procedures.\"" },
    ],
  },
];

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

export default function CourseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = id ? courseById(id) : undefined;

  const [activeSlideId, setActiveSlideId] = useState(SLIDES[0].id);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  if (!course) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-gray-500">Course not found.</p>
        <button onClick={() => navigate("/courses")} className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800">&larr; Back to Course Library</button>
      </div>
    );
  }

  const activeSlide = SLIDES.find((s) => s.id === activeSlideId) ?? SLIDES[0];
  const isPending = course.status === "Pending Approval";

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={() => navigate("/courses")} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <FaArrowLeft size={14} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-bold text-gray-900">{course.title}</h1>
              <Badge variant={statusBadge(course.status)}>{course.status}</Badge>
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
              <button onClick={() => navigate("/courses")} className="flex items-center gap-2 rounded-lg bg-green-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors">
                <FaCheckCircle size={12} /> Approve
              </button>
              <button onClick={() => navigate("/courses")} className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors">
                <FaTimes size={12} /> Reject
              </button>
            </>
          )}
          <button onClick={() => setRemoveOpen(true)} className="flex items-center gap-2 rounded-lg border border-red-200 px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <FaTrash size={12} /> Remove
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr_280px]">
        {/* Slides list (read-only) */}
        <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm h-fit">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Slides</p>
          <div className="space-y-1.5">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveSlideId(s.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
                  s.id === activeSlideId ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                <span className="w-4 shrink-0 text-xs text-gray-400">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm">{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas (read-only) */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className={mobilePreview ? "mx-auto w-72 rounded-4xl border-8 border-gray-800 bg-white p-3 shadow-xl" : ""}>
            <div className={mobilePreview ? "rounded-xl bg-gray-50 p-3 min-h-96" : "rounded-xl border-2 border-dashed border-gray-100 bg-gray-50/50 p-6 min-h-96"}>
              <p className="mb-3 text-sm font-semibold text-gray-800">{activeSlide.title}</p>
              <div className="space-y-3">
                {activeSlide.blocks.map((b) => {
                  if (b.type === "text") {
                    return (
                      <div key={b.id} className="rounded-lg border border-gray-200 bg-white p-4">
                        <p className="mb-1.5 text-sm font-semibold text-gray-800">{b.heading}</p>
                        <p className="text-sm leading-relaxed text-gray-600">{b.body}</p>
                      </div>
                    );
                  }
                  if (b.type === "image") {
                    return (
                      <div key={b.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <div className="flex h-40 items-center justify-center bg-linear-to-br from-gray-100 to-gray-50">
                          <FaImage size={26} className="text-gray-300" />
                        </div>
                        <p className="border-t border-gray-100 px-3 py-2 text-xs text-gray-500">{b.caption}</p>
                      </div>
                    );
                  }
                  if (b.type === "video") {
                    return (
                      <div key={b.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <div className="relative flex h-40 items-center justify-center bg-gray-900">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90">
                            <FaPlay size={14} className="ml-0.5 text-gray-800" />
                          </div>
                          <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">{b.duration}</span>
                        </div>
                        <p className="border-t border-gray-100 px-3 py-2 text-xs text-gray-500">{b.caption}</p>
                      </div>
                    );
                  }
                  if (b.type === "pdf") {
                    return (
                      <div key={b.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50">
                          <FaFilePdf size={18} className="text-red-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-800">{b.fileName}</p>
                          <p className="text-xs text-gray-400">{b.pages} pages · reference document</p>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={b.id} className="rounded-lg border border-gray-200 bg-white p-4">
                      <p className="mb-3 text-sm font-semibold text-gray-800">{b.question}</p>
                      <div className="space-y-1.5">
                        {b.options.map((opt, i) => (
                          <div
                            key={opt}
                            className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm ${
                              i === b.correctIndex ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 text-gray-600"
                            }`}
                          >
                            {i === b.correctIndex ? <FaCheckCircle size={12} className="shrink-0 text-green-500" /> : <span className="h-3 w-3 shrink-0 rounded-full border border-gray-300" />}
                            {opt}
                          </div>
                        ))}
                      </div>
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
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Course Info</p>
            <div className="divide-y divide-gray-50">
              <InfoRow label="Category" value={course.category} />
              <InfoRow label="Visibility" value={course.visibility} />
              <InfoRow label="Version" value={course.version} />
              <InfoRow label="Clients Using" value={String(course.clientsUsing)} />
              <InfoRow label="Enrolled" value={String(course.enrolled)} />
            </div>
            <div className="mt-2">
              <ProgressBar label="Completion Rate" trailing={`${course.completionRate}%`} value={course.completionRate} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {course.tags.map((t) => <span key={t} className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600">{t}</span>)}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <FaHistory size={11} /> Version History
            </p>
            <div className="space-y-2 text-xs">
              {[
                { v: course.version, note: "Current version", date: "12 Aug 2026", active: true },
                { v: "v" + (parseFloat(course.version.replace("v", "")) - 0.1).toFixed(1), note: "Previous version", date: "02 Jun 2026", active: false },
              ].map((v) => (
                <div key={v.v} className={`rounded-lg px-2.5 py-2 ${v.active ? "bg-blue-50" : "bg-gray-50"}`}>
                  <p className={`font-medium ${v.active ? "text-blue-700" : "text-gray-700"}`}>{v.v}{v.active && " (current)"}</p>
                  <p className="text-gray-400">{v.note} · {v.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={removeOpen}
        onClose={() => setRemoveOpen(false)}
        title="Remove Course"
        footer={<><ModalBtn variant="secondary" onClick={() => setRemoveOpen(false)}>Cancel</ModalBtn><ModalBtn variant="danger" onClick={() => navigate("/courses")}>Remove Course</ModalBtn></>}
      >
        <p className="text-sm text-gray-600">
          Remove <span className="font-semibold text-gray-900">{course.title}</span> from the library? It will no
          longer be available to assign to any client. Clients already assigned keep access to their current
          enrollment records.
        </p>
      </Modal>
    </div>
  );
}
