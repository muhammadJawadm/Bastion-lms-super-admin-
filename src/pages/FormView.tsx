import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Tabs } from "../components/ui/Tabs";
import { Modal, FieldLabel, FieldInput, FieldSelect, ModalBtn } from "../components/ui/Modal";
import { formById, type FormProduct, type FormField } from "../data/forms";
import { COMPANIES } from "../data/companies";
import { DISTRIBUTIONS, type DistributionRecord } from "../data/distributions";
import type { Ownership } from "../data/catalog";
import {
  FaArrowLeft, FaTrash, FaPlus, FaArrowUp, FaArrowDown,
  FaShareSquare, FaExclamationTriangle, FaInfoCircle,
} from "react-icons/fa";

let fieldCounter = 100;

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

function FieldEditor({ field, onChange, onDelete }: { field: FormField; onChange: (f: FormField) => void; onDelete: () => void }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3.5">
      <div className="flex items-center gap-3">
        <FieldInput className="flex-1" value={field.label} onChange={(e) => onChange({ ...field, label: e.target.value })} placeholder="Field label" />
        <FieldSelect className="w-36" value={field.type} onChange={(e) => onChange({ ...field, type: e.target.value as FormField["type"] })}>
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="checkbox">Checkbox list</option>
          <option value="select">Dropdown</option>
          <option value="photo">Photo</option>
          <option value="signature">Signature</option>
        </FieldSelect>
        <label className="flex shrink-0 items-center gap-1.5 text-xs text-gray-500">
          <input type="checkbox" checked={field.required} onChange={(e) => onChange({ ...field, required: e.target.checked })} className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600" />
          Required
        </label>
        <button onClick={onDelete} className="shrink-0 text-gray-300 hover:text-red-500 transition-colors"><FaTrash size={11} /></button>
      </div>
      {(field.type === "checkbox" || field.type === "select") && (
        <div className="mt-2 pl-1">
          <p className="mb-1 text-xs text-gray-400">Options (comma separated)</p>
          <FieldInput
            value={(field.options ?? []).join(", ")}
            onChange={(e) => onChange({ ...field, options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            placeholder="Option A, Option B, Option C"
          />
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

export default function FormView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const draft = (location.state as { draft?: { title: string; category: string; ownership: Ownership } } | null)?.draft;
  const existing = id ? formById(id) : undefined;

  const [tab, setTab] = useState("builder");
  const [retireOpen, setRetireOpen] = useState(false);
  const [fields, setFields] = useState<FormField[]>(existing?.fields ?? [{ id: "f1", label: "Site / Location", type: "text", required: true }]);
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
        <p className="text-sm text-gray-500">Form not found.</p>
        <button onClick={() => navigate("/forms")} className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800">&larr; Back to Forms</button>
      </div>
    );
  }

  const form: FormProduct = existing ?? {
    id: id!, title: draft!.title, category: draft!.category, ownership: draft!.ownership, status: "Draft",
    clientsUsing: 0, submissionsPerWeek: 0, required: false, version: "v0.1",
    versionHistory: [{ version: "v0.1", date: new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }), author: "Super Admin", reviewer: "—", summary: "Initial draft created", publicationState: "Draft" }],
    fields: [],
  };

  const outdated = distributions.filter((d) => d.clientVersion !== form.version);

  function addField() {
    setFields((prev) => [...prev, { id: `nf${fieldCounter++}`, label: "New field", type: "text", required: false }]);
  }
  function updateField(fid: string, next: FormField) {
    setFields((prev) => prev.map((f) => (f.id === fid ? next : f)));
  }
  function deleteField(fid: string) {
    setFields((prev) => prev.filter((f) => f.id !== fid));
  }
  function moveField(fid: string, dir: -1 | 1) {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === fid);
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
        id: `d-new-${Date.now()}-${cid}`, contentId: form.id, contentType: "form", contentTitle: form.title,
        companyId: c.id, companyName: c.name, ownership: form.ownership, clientVersion: form.version,
        currentMasterVersion: form.version, availabilityDate: issueAvailability || "Immediately",
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
    setDistributions((prev) => prev.map((d) => (targets.includes(d.id) ? { ...d, clientVersion: form.version } : d)));
    setUpdateTarget(null);
    setSelectedOutdated([]);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={() => navigate("/forms")} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <FaArrowLeft size={14} />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-bold text-gray-900">{form.title}</h1>
              <Badge variant={statusBadge(form.status)}>{form.status}</Badge>
              <Badge variant={ownershipBadge(form.ownership)}>{form.ownership}</Badge>
            </div>
            <p className="text-xs text-gray-400">{form.category} · {form.version}</p>
          </div>
        </div>
        <button onClick={() => setRetireOpen(true)} className="flex shrink-0 items-center gap-2 rounded-lg border border-red-200 px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
          <FaTrash size={12} /> Retire
        </button>
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
          <div className="p-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-3 text-xs text-blue-700">
                <FaInfoCircle size={13} className="mt-0.5 shrink-0" />
                Working field editor. Final field types/behavior should be reconciled against the separate Course and Form Builder Requirements Report.
              </div>
              {fields.map((f, i) => (
                <div key={f.id} className="flex items-start gap-2">
                  <div className="flex flex-col gap-1 pt-3">
                    <button onClick={() => moveField(f.id, -1)} className="text-gray-300 hover:text-gray-600"><FaArrowUp size={9} /></button>
                    <button onClick={() => moveField(f.id, 1)} className="text-gray-300 hover:text-gray-600"><FaArrowDown size={9} /></button>
                  </div>
                  <div className="flex-1">
                    <FieldEditor field={f} onChange={(nf) => updateField(f.id, nf)} onDelete={() => deleteField(f.id)} />
                  </div>
                  <span className="w-4 pt-3 text-xs text-gray-300">{i + 1}</span>
                </div>
              ))}
              <button onClick={addField} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-200 py-2.5 text-xs text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
                <FaPlus size={10} /> Add Field
              </button>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4 h-fit">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Form Info</p>
              <div className="divide-y divide-gray-50">
                <InfoRow label="Category" value={form.category} />
                <InfoRow label="Ownership" value={form.ownership} />
                <InfoRow label="Version" value={form.version} />
                <InfoRow label="Clients Using" value={String(form.clientsUsing)} />
                <InfoRow label="Required" value={form.required ? "Yes" : "No"} />
              </div>
            </div>
          </div>
        )}

        {tab === "distribution" && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Companies currently issued this form.</p>
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
                        <td className="px-4 py-3 text-sm font-mono text-gray-500">{d.clientVersion}{d.clientVersion !== form.version && <span className="ml-1.5 text-[10px] font-sans font-semibold text-amber-600">outdated</span>}</td>
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
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Version History</p>
              <div className="space-y-2 text-sm">
                {form.versionHistory.map((v, i) => (
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
                      <span className="ml-auto font-mono text-xs text-gray-400">{d.clientVersion} → {form.version}</span>
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
          This pushes {form.version} to {updateTarget === "all" ? "all eligible outdated clients" : `${selectedOutdated.length} selected client(s)`} immediately.
          Historical submissions already recorded keep the version that was in effect when they were submitted. This action is written to the audit log.
        </p>
      </Modal>

      <Modal
        isOpen={retireOpen}
        onClose={() => setRetireOpen(false)}
        title="Retire Form"
        footer={<><ModalBtn variant="secondary" onClick={() => setRetireOpen(false)}>Cancel</ModalBtn><ModalBtn variant="danger" onClick={() => navigate("/forms")}>Retire Form</ModalBtn></>}
      >
        <p className="text-sm text-gray-600">
          Retire <span className="font-semibold text-gray-900">{form.title}</span> permanently? It will no
          longer be available to distribute to any client. Forms already submitted stay tied to the version used at the time.
        </p>
      </Modal>
    </div>
  );
}
