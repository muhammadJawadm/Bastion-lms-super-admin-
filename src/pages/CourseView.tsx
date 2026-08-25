import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Tabs } from "../components/ui/Tabs";
import { Modal, FieldLabel, FieldInput, FieldSelect, FieldTextarea, ModalBtn } from "../components/ui/Modal";
import { courseById, type Course } from "./CourseLibrary";
import { COMPANIES } from "../data/companies";
import { DISTRIBUTIONS, type DistributionRecord } from "../data/distributions";
import type { Ownership } from "../data/catalog";
import {
  FaArrowLeft, FaMobileAlt, FaDesktop, FaTrash,
  FaImage, FaPlay, FaHistory, FaPlus, FaArrowUp, FaArrowDown,
  FaShareSquare, FaExclamationTriangle,
} from "react-icons/fa";

type Block =
  | { id: string; type: "text"; heading: string; body: string }
  | { id: string; type: "image"; caption: string }
  | { id: string; type: "video"; caption: string; duration: string }
  | { id: string; type: "pdf"; fileName: string; pages: number }
  | { id: string; type: "quiz"; question: string; options: string[]; correctIndex: number };

interface Slide { id: string; title: string; blocks: Block[] }

const DEFAULT_SLIDES: Slide[] = [
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
];

const NEW_SLIDE_SEED: Slide[] = [
  { id: "s1", title: "Welcome & Objectives", blocks: [{ id: "b1", type: "text", heading: "Course introduction", body: "Add your introduction text here." }] },
];

let blockCounter = 100;
let slideCounter = 100;

function statusBadge(s: string): "success" | "neutral" | "danger" {
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-xs font-medium text-gray-800">{value}</span>
    </div>
  );
}

function BlockEditor({ block, onChange, onDelete }: { block: Block; onChange: (b: Block) => void; onDelete: () => void }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{block.type}</span>
        <button onClick={onDelete} className="text-gray-300 hover:text-red-500 transition-colors"><FaTrash size={11} /></button>
      </div>

      {block.type === "text" && (
        <div className="space-y-2">
          <FieldInput value={block.heading} onChange={(e) => onChange({ ...block, heading: e.target.value })} placeholder="Heading" className="font-semibold" />
          <FieldTextarea rows={3} value={block.body} onChange={(e) => onChange({ ...block, body: e.target.value })} placeholder="Body text" />
        </div>
      )}

      {block.type === "image" && (
        <div className="space-y-2">
          <div className="flex h-24 items-center justify-center rounded-lg bg-linear-to-br from-gray-100 to-gray-50"><FaImage size={20} className="text-gray-300" /></div>
          <FieldInput value={block.caption} onChange={(e) => onChange({ ...block, caption: e.target.value })} placeholder="Caption" />
        </div>
      )}

      {block.type === "video" && (
        <div className="space-y-2">
          <div className="flex h-24 items-center justify-center rounded-lg bg-gray-900"><FaPlay size={16} className="text-white/80" /></div>
          <div className="grid grid-cols-3 gap-2">
            <FieldInput className="col-span-2" value={block.caption} onChange={(e) => onChange({ ...block, caption: e.target.value })} placeholder="Caption" />
            <FieldInput value={block.duration} onChange={(e) => onChange({ ...block, duration: e.target.value })} placeholder="0:00" />
          </div>
        </div>
      )}

      {block.type === "pdf" && (
        <div className="grid grid-cols-3 gap-2">
          <FieldInput className="col-span-2" value={block.fileName} onChange={(e) => onChange({ ...block, fileName: e.target.value })} placeholder="File name" />
          <FieldInput type="number" value={block.pages} onChange={(e) => onChange({ ...block, pages: Number(e.target.value) })} placeholder="Pages" />
        </div>
      )}

      {block.type === "quiz" && (
        <div className="space-y-2">
          <FieldInput value={block.question} onChange={(e) => onChange({ ...block, question: e.target.value })} placeholder="Question" />
          {block.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" checked={block.correctIndex === i} onChange={() => onChange({ ...block, correctIndex: i })} className="h-3.5 w-3.5 text-blue-600" title="Correct answer" />
              <FieldInput
                value={opt}
                onChange={(e) => {
                  const options = [...block.options];
                  options[i] = e.target.value;
                  onChange({ ...block, options });
                }}
              />
              <button
                onClick={() => {
                  const options = block.options.filter((_, oi) => oi !== i);
                  onChange({ ...block, options, correctIndex: Math.min(block.correctIndex, options.length - 1) });
                }}
                className="shrink-0 text-gray-300 hover:text-red-500 transition-colors"
              >
                <FaTrash size={10} />
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange({ ...block, options: [...block.options, "New option"] })}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            + Add option
          </button>
        </div>
      )}
    </div>
  );
}

function IssueContent({ companyIds, setCompanyIds, tier, setTier, availability, setAvailability, expiration, setExpiration }: {
  companyIds: string[]; setCompanyIds: (v: string[]) => void;
  tier: string; setTier: (v: string) => void;
  availability: string; setAvailability: (v: string) => void;
  expiration: string; setExpiration: (v: string) => void;
}) {
  const toggle = (id: string) => setCompanyIds(companyIds.includes(id) ? companyIds.filter((c) => c !== id) : [...companyIds, id]);
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <FieldLabel>Companies</FieldLabel>
          <button onClick={() => setCompanyIds(companyIds.length === COMPANIES.length ? [] : COMPANIES.map((c) => c.id))} className="text-xs font-medium text-blue-600 hover:text-blue-800">
            {companyIds.length === COMPANIES.length ? "Clear all" : "Select all eligible"}
          </button>
        </div>
        <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2">
          {COMPANIES.map((c) => (
            <label key={c.id} className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={companyIds.includes(c.id)} onChange={() => toggle(c.id)} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-gray-700">{c.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <FieldLabel>Required Tier</FieldLabel>
          <FieldSelect value={tier} onChange={(e) => setTier(e.target.value)}>
            <option>Starter</option><option>Professional</option><option>Enterprise</option>
          </FieldSelect>
        </div>
        <div><FieldLabel>Availability Date</FieldLabel><FieldInput type="date" value={availability} onChange={(e) => setAvailability(e.target.value)} /></div>
        <div><FieldLabel>Expiration (optional)</FieldLabel><FieldInput type="date" value={expiration} onChange={(e) => setExpiration(e.target.value)} /></div>
      </div>
    </div>
  );
}

export default function CourseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const draft = (location.state as { draft?: { title: string; category: string; ownership: Ownership } } | null)?.draft;
  const existing = id ? courseById(id) : undefined;

  const [tab, setTab] = useState("builder");
  const [mobilePreview, setMobilePreview] = useState(false);
  const [retireOpen, setRetireOpen] = useState(false);
  const [slides, setSlides] = useState<Slide[]>(existing ? DEFAULT_SLIDES : NEW_SLIDE_SEED);
  const [activeSlideId, setActiveSlideId] = useState(slides[0].id);
  const [distributions, setDistributions] = useState<DistributionRecord[]>(
    existing ? DISTRIBUTIONS.filter((d) => d.contentId === existing.id) : []
  );
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueCompanyIds, setIssueCompanyIds] = useState<string[]>([]);
  const [issueTier, setIssueTier] = useState("Starter");
  const [issueAvailability, setIssueAvailability] = useState("");
  const [issueExpiration, setIssueExpiration] = useState("");
  const [updateTarget, setUpdateTarget] = useState<"selected" | "all" | null>(null);
  const [selectedOutdated, setSelectedOutdated] = useState<string[]>([]);

  if (!existing && !draft) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-gray-500">Course not found.</p>
        <button onClick={() => navigate("/courses")} className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800">&larr; Back to Courses</button>
      </div>
    );
  }

  const course: Course = existing ?? {
    id: id!, title: draft!.title, category: draft!.category, tags: [], visibility: "All Clients",
    ownership: draft!.ownership, status: "Draft", clientsUsing: 0, enrolled: 0, completionRate: 0,
    version: "v0.1", versionHistory: [{ version: "v0.1", date: new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }), author: "Super Admin", reviewer: "—", summary: "Initial draft created", publicationState: "Draft" }],
  };

  const activeSlide = slides.find((s) => s.id === activeSlideId) ?? slides[0];
  const outdated = distributions.filter((d) => d.clientVersion !== course.version);

  function updateBlock(blockId: string, next: Block) {
    setSlides((prev) => prev.map((s) => (s.id !== activeSlide.id ? s : { ...s, blocks: s.blocks.map((b) => (b.id === blockId ? next : b)) })));
  }
  function deleteBlock(blockId: string) {
    setSlides((prev) => prev.map((s) => (s.id !== activeSlide.id ? s : { ...s, blocks: s.blocks.filter((b) => b.id !== blockId) })));
  }
  function addBlock(type: Block["type"]) {
    const nid = `b${blockCounter++}`;
    const nb: Block =
      type === "text" ? { id: nid, type, heading: "New heading", body: "New body text." } :
      type === "image" ? { id: nid, type, caption: "New image caption" } :
      type === "video" ? { id: nid, type, caption: "New video caption", duration: "0:00" } :
      type === "pdf" ? { id: nid, type, fileName: "document.pdf", pages: 1 } :
      { id: nid, type, question: "New question", options: ["Option A", "Option B"], correctIndex: 0 };
    setSlides((prev) => prev.map((s) => (s.id !== activeSlide.id ? s : { ...s, blocks: [...s.blocks, nb] })));
  }
  function addSlide() {
    const nid = `sl${slideCounter++}`;
    setSlides((prev) => [...prev, { id: nid, title: `New Slide ${prev.length + 1}`, blocks: [] }]);
    setActiveSlideId(nid);
  }
  function deleteSlide(sid: string) {
    setSlides((prev) => {
      const next = prev.filter((s) => s.id !== sid);
      if (activeSlideId === sid && next.length) setActiveSlideId(next[0].id);
      return next;
    });
  }
  function moveSlide(sid: string, dir: -1 | 1) {
    setSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === sid);
      const swap = idx + dir;
      if (swap < 0 || swap >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  }

  function issue() {
    const newRecords: DistributionRecord[] = issueCompanyIds.map((cid) => {
      const c = COMPANIES.find((x) => x.id === cid)!;
      return {
        id: `d-new-${Date.now()}-${cid}`, contentId: course.id, contentType: "course", contentTitle: course.title,
        companyId: c.id, companyName: c.name, ownership: course.ownership, clientVersion: course.version,
        currentMasterVersion: course.version, availabilityDate: issueAvailability || "Immediately",
        expirationDate: issueExpiration || null, requiredTier: issueTier as DistributionRecord["requiredTier"],
        revocationDate: null, status: "Active",
      };
    });
    setDistributions((prev) => [...prev.filter((d) => !issueCompanyIds.includes(d.companyId)), ...newRecords]);
    setIssueOpen(false);
    setIssueCompanyIds([]);
  }

  function confirmUpdate() {
    const targets = updateTarget === "all" ? outdated.map((d) => d.id) : selectedOutdated;
    setDistributions((prev) => prev.map((d) => (targets.includes(d.id) ? { ...d, clientVersion: course.version } : d)));
    setUpdateTarget(null);
    setSelectedOutdated([]);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={() => navigate("/courses")} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <FaArrowLeft size={14} />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-bold text-gray-900">{course.title}</h1>
              <Badge variant={statusBadge(course.status)}>{course.status}</Badge>
              <Badge variant={ownershipBadge(course.ownership)}>{course.ownership}</Badge>
            </div>
            <p className="text-xs text-gray-400">{course.category} · {course.version}</p>
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
          <button onClick={() => setRetireOpen(true)} className="flex items-center gap-2 rounded-lg border border-red-200 px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <FaTrash size={12} /> Retire
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="px-5 pt-2">
          <Tabs
            tabs={[
              { key: "builder", label: "Builder" },
              { key: "distribution", label: "Distribution", count: distributions.length },
              { key: "versions", label: "Version Control", count: outdated.length || undefined },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        {tab === "builder" && (
          <div className="p-5 grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr_260px]">
            <div className="rounded-xl border border-gray-100 bg-white p-3 h-fit">
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Slides</p>
              <div className="space-y-1.5">
                {slides.map((s, i) => (
                  <div key={s.id} className={`flex items-center gap-1 rounded-lg px-1.5 py-1 ${s.id === activeSlideId ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                    <button onClick={() => setActiveSlideId(s.id)} className={`min-w-0 flex-1 truncate text-left text-sm ${s.id === activeSlideId ? "text-blue-700 font-medium" : "text-gray-600"}`}>
                      {i + 1}. {s.title}
                    </button>
                    <button onClick={() => moveSlide(s.id, -1)} className="text-gray-300 hover:text-gray-600"><FaArrowUp size={9} /></button>
                    <button onClick={() => moveSlide(s.id, 1)} className="text-gray-300 hover:text-gray-600"><FaArrowDown size={9} /></button>
                    <button onClick={() => deleteSlide(s.id)} className="text-gray-300 hover:text-red-500"><FaTrash size={9} /></button>
                  </div>
                ))}
              </div>
              <button onClick={addSlide} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-200 py-2 text-xs text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
                <FaPlus size={10} /> Add Slide
              </button>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <div className={mobilePreview ? "mx-auto w-72 rounded-4xl border-8 border-gray-800 bg-white p-3 shadow-xl" : ""}>
                <div className={mobilePreview ? "rounded-xl bg-gray-50 p-3 min-h-96" : "rounded-xl border-2 border-dashed border-gray-100 bg-gray-50/50 p-6 min-h-96"}>
                  <FieldInput
                    value={activeSlide.title}
                    onChange={(e) => setSlides((prev) => prev.map((s) => (s.id === activeSlide.id ? { ...s, title: e.target.value } : s)))}
                    className="mb-3 font-semibold"
                  />
                  <div className="space-y-3">
                    {activeSlide.blocks.map((b) => (
                      <BlockEditor key={b.id} block={b} onChange={(nb) => updateBlock(b.id, nb)} onDelete={() => deleteBlock(b.id)} />
                    ))}
                    {activeSlide.blocks.length === 0 && <p className="py-6 text-center text-xs text-gray-400">No blocks yet — add one below.</p>}
                  </div>
                  {!mobilePreview && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {(["text", "image", "video", "pdf", "quiz"] as const).map((t) => (
                        <button key={t} onClick={() => addBlock(t)} className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors capitalize">
                          + {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-gray-100 bg-white p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Course Info</p>
                <div className="divide-y divide-gray-50">
                  <InfoRow label="Category" value={course.category} />
                  <InfoRow label="Visibility" value={course.visibility} />
                  <InfoRow label="Ownership" value={course.ownership} />
                  <InfoRow label="Version" value={course.version} />
                  <InfoRow label="Clients Using" value={String(course.clientsUsing)} />
                </div>
                {course.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {course.tags.map((t) => <span key={t} className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600">{t}</span>)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "distribution" && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Companies currently issued this course.</p>
              <button onClick={() => setIssueOpen(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                <FaShareSquare size={12} /> Issue to Companies
              </button>
            </div>
            {distributions.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">Not yet issued to any company.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-100">
                <table className="min-w-full">
                  <thead className="bg-gray-50/70">
                    <tr>{["Company", "Client Version", "Tier", "Availability", "Expiration", "Status"].map((h) => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {distributions.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{d.companyName}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-500">{d.clientVersion}{d.clientVersion !== course.version && <span className="ml-1.5 text-[10px] font-sans font-semibold text-amber-600">outdated</span>}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{d.requiredTier}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{d.availabilityDate}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{d.expirationDate ?? "—"}</td>
                        <td className="px-4 py-3"><Badge variant={d.status === "Active" ? "success" : d.status === "Scheduled" ? "info" : d.status === "Expired" ? "warning" : "danger"}>{d.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "versions" && (
          <div className="p-5 space-y-5">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400"><FaHistory size={11} /> Version History</p>
              <div className="space-y-2 text-sm">
                {course.versionHistory.map((v, i) => (
                  <div key={v.version} className={`rounded-lg px-3.5 py-2.5 ${i === 0 ? "bg-blue-50" : "bg-gray-50"}`}>
                    <div className="flex items-center justify-between">
                      <p className={`font-medium ${i === 0 ? "text-blue-700" : "text-gray-700"}`}>{v.version}{i === 0 && " (current)"}</p>
                      <span className="text-xs text-gray-400">{v.date} · {v.author}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{v.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {outdated.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="mb-3 flex items-start gap-2.5">
                  <FaExclamationTriangle size={14} className="mt-0.5 shrink-0 text-amber-600" />
                  <p className="text-sm text-amber-800">{outdated.length} client{outdated.length > 1 ? "s are" : " is"} on an outdated version. Choose how to proceed.</p>
                </div>
                <div className="space-y-1.5">
                  {outdated.map((d) => (
                    <label key={d.id} className="flex items-center gap-2.5 rounded-lg bg-white px-3 py-2 text-sm">
                      <input type="checkbox" checked={selectedOutdated.includes(d.id)} onChange={() => setSelectedOutdated((prev) => prev.includes(d.id) ? prev.filter((x) => x !== d.id) : [...prev, d.id])} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                      <span className="text-gray-700">{d.companyName}</span>
                      <span className="ml-auto font-mono text-xs text-gray-400">{d.clientVersion} → {course.version}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button disabled={selectedOutdated.length === 0} onClick={() => setUpdateTarget("selected")} className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    Update Selected Clients
                  </button>
                  <button onClick={() => setUpdateTarget("all")} className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                    Update All Eligible Clients
                  </button>
                  <button className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                    Leave Existing Version
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={issueOpen}
        onClose={() => setIssueOpen(false)}
        title="Issue to Companies"
        footer={<><ModalBtn variant="secondary" onClick={() => setIssueOpen(false)}>Cancel</ModalBtn><ModalBtn variant="primary" onClick={issue}>Issue</ModalBtn></>}
      >
        <IssueContent companyIds={issueCompanyIds} setCompanyIds={setIssueCompanyIds} tier={issueTier} setTier={setIssueTier} availability={issueAvailability} setAvailability={setIssueAvailability} expiration={issueExpiration} setExpiration={setIssueExpiration} />
      </Modal>

      <Modal
        isOpen={updateTarget !== null}
        onClose={() => setUpdateTarget(null)}
        title="Confirm Forced Version Update"
        footer={<><ModalBtn variant="secondary" onClick={() => setUpdateTarget(null)}>Cancel</ModalBtn><ModalBtn variant="primary" onClick={confirmUpdate}>Confirm &amp; Update</ModalBtn></>}
      >
        <p className="text-sm text-gray-600">
          This pushes {course.version} to {updateTarget === "all" ? "all eligible outdated clients" : `${selectedOutdated.length} selected client(s)`} immediately.
          Historical completions already recorded keep the version that was in effect when they were completed. This action is written to the audit log.
        </p>
      </Modal>

      <Modal
        isOpen={retireOpen}
        onClose={() => setRetireOpen(false)}
        title="Retire Course"
        footer={<><ModalBtn variant="secondary" onClick={() => setRetireOpen(false)}>Cancel</ModalBtn><ModalBtn variant="danger" onClick={() => navigate("/courses")}>Retire Course</ModalBtn></>}
      >
        <p className="text-sm text-gray-600">
          Retire <span className="font-semibold text-gray-900">{course.title}</span> permanently? It will no
          longer be available to distribute to any client. Clients already assigned keep access to their current
          enrollment records.
        </p>
      </Modal>
    </div>
  );
}
