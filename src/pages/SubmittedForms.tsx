import { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Modal, FieldLabel, FieldTextarea, FieldSelect, ModalBtn } from "../components/ui/Modal";
import { COMPANIES } from "../data/companies";
import {
  FaSearch, FaDownload, FaCamera, FaSignature, FaMapMarkerAlt,
  FaExclamationCircle, FaEdit,
} from "react-icons/fa";

interface Submission {
  id: string;
  form: string;
  client: string;
  site: string;
  submitter: string;
  date: string;
  result: "Pass" | "Fail" | "N/A";
}

const SUBMISSIONS: Submission[] = [
  { id: "sub1", form: "Trench & Excavation Inspection", client: COMPANIES[0].name, site: COMPANIES[0].sites[0], submitter: "Devon Marsh",    date: "16 Aug 2026", result: "Pass" },
  { id: "sub2", form: "Daily Jobsite Audit",             client: COMPANIES[0].name, site: COMPANIES[0].sites[1], submitter: "Lucia Ferreira", date: "16 Aug 2026", result: "Fail" },
  { id: "sub3", form: "Equipment Pre-Use Inspection",    client: COMPANIES[1].name, site: COMPANIES[1].sites[0], submitter: "Marcus Ibe",     date: "15 Aug 2026", result: "Pass" },
  { id: "sub4", form: "Job Hazard Analysis (JHA)",       client: COMPANIES[6].name, site: COMPANIES[6].sites[0], submitter: "Todd Warrick",   date: "15 Aug 2026", result: "Pass" },
  { id: "sub5", form: "Confined Space Entry Permit",     client: COMPANIES[8].name, site: COMPANIES[8].sites[1], submitter: "Hal Fenwick",    date: "14 Aug 2026", result: "Fail" },
  { id: "sub6", form: "Toolbox Talk Sign-In",            client: COMPANIES[3].name, site: COMPANIES[3].sites[2], submitter: "Owen Pratt",     date: "14 Aug 2026", result: "N/A"  },
  { id: "sub7", form: "Near-Miss / Incident Report",     client: COMPANIES[5].name, site: COMPANIES[5].sites[0], submitter: "Priya Nandan",   date: "13 Aug 2026", result: "Fail" },
];

function resultBadge(r: Submission["result"]): "success" | "danger" | "neutral" {
  if (r === "Pass") return "success";
  if (r === "Fail") return "danger";
  return "neutral";
}

function SubmissionViewContent({ s }: { s: Submission }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">{s.form}</p>
          <p className="text-xs text-gray-400">{s.client} · {s.site}</p>
        </div>
        <Badge variant={resultBadge(s.result)}>{s.result}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {[
          { label: "Submitted by", value: s.submitter },
          { label: "Date", value: s.date },
        ].map((d) => (
          <div key={d.label}><p className="text-xs text-gray-400">{d.label}</p><p className="mt-0.5 font-medium text-gray-800">{d.value}</p></div>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3.5 py-2.5 text-xs text-blue-700">
        <FaMapMarkerAlt size={11} /> 33.7490° N, 84.3880° W · Captured automatically at submission · Sunny, 78°F
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Responses</p>
        <div className="space-y-2 text-sm">
          {[
            { q: "Trench depth", a: "6.5 ft" },
            { q: "Protective system in place?", a: "Yes — trench box" },
            { q: "Spoil pile setback", a: "3 ft — compliant" },
          ].map((r) => (
            <div key={r.q} className="flex items-center justify-between rounded-lg bg-gray-50 px-3.5 py-2.5">
              <span className="text-gray-500">{r.q}</span>
              <span className="font-medium text-gray-800">{r.a}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex h-20 items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 text-xs text-gray-400">
          <FaCamera size={14} /> Photo attachment
        </div>
        <div className="flex h-20 items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 text-xs text-gray-400">
          <FaSignature size={14} /> Signature
        </div>
      </div>
    </div>
  );
}

function AmendContent({ s }: { s: Submission }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-yellow-100 bg-yellow-50 p-4">
        <FaExclamationCircle size={16} className="mt-0.5 shrink-0 text-yellow-600" />
        <p className="text-xs text-yellow-800">
          The original answer is preserved and remains visible. This submission is a legal record — every amendment
          logs who changed it, when, and why, and the form is flagged "Amended".
        </p>
      </div>
      <div>
        <FieldLabel>Field to amend</FieldLabel>
        <FieldSelect><option>Trench depth</option><option>Protective system in place?</option><option>Spoil pile setback</option></FieldSelect>
      </div>
      <div className="rounded-lg bg-gray-50 px-3.5 py-2.5 text-sm">
        <p className="text-xs text-gray-400">Original value</p>
        <p className="font-medium text-gray-700">6.5 ft</p>
      </div>
      <div><FieldLabel>New value</FieldLabel><FieldTextarea rows={2} placeholder="Corrected value..." /></div>
      <div><FieldLabel>Reason for amendment (required)</FieldLabel><FieldTextarea rows={3} placeholder="Explain why this correction is being made..." /></div>
      <p className="text-xs text-gray-400">Regarding: {s.form} — {s.client}</p>
    </div>
  );
}

export default function SubmittedForms() {
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("All");
  const [clientFilter, setClientFilter] = useState("All");
  const [viewing, setViewing] = useState<Submission | null>(null);
  const [amending, setAmending] = useState<Submission | null>(null);

  const filtered = SUBMISSIONS.filter(
    (s) =>
      s.form.toLowerCase().includes(search.toLowerCase()) &&
      (resultFilter === "All" || s.result === resultFilter) &&
      (clientFilter === "All" || s.client === clientFilter)
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submitted Forms</h1>
          <p className="mt-1 text-sm text-gray-500">Every field submission across every client.</p>
        </div>
        <button className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
          <FaDownload size={12} /> Export
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-50 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <FaSearch size={13} className="shrink-0 text-gray-400" />
          <input
            type="text"
            placeholder="Search by form name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
          />
        </div>
        <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none cursor-pointer">
          <option>All</option>
          {COMPANIES.map((c) => <option key={c.id}>{c.name}</option>)}
        </select>
        <select value={resultFilter} onChange={(e) => setResultFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none cursor-pointer">
          {["All", "Pass", "Fail", "N/A"].map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/70">
              <tr>{["Form", "Client / Site", "Submitter", "Date", "Result", "Actions"].map((h) => <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No submissions match your filters.</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{s.form}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-gray-700">{s.client}</p>
                    <p className="text-xs text-gray-400">{s.site}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">{s.submitter}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">{s.date}</td>
                  <td className="px-5 py-3.5"><Badge variant={resultBadge(s.result)}>{s.result}</Badge></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <button onClick={() => setViewing(s)} className="text-blue-600 hover:text-blue-800 transition-colors">View</button>
                      <button onClick={() => setAmending(s)} className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors"><FaEdit size={10} /> Amend</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
          Showing {filtered.length} of {SUBMISSIONS.length} submissions
        </div>
      </div>

      <Modal isOpen={viewing !== null} onClose={() => setViewing(null)} title="Submission Details" size="lg">
        {viewing && <SubmissionViewContent s={viewing} />}
      </Modal>

      <Modal
        isOpen={amending !== null}
        onClose={() => setAmending(null)}
        title="Amend Submission"
        footer={<><ModalBtn variant="secondary" onClick={() => setAmending(null)}>Cancel</ModalBtn><ModalBtn variant="primary" onClick={() => setAmending(null)}>Save Amendment</ModalBtn></>}
      >
        {amending && <AmendContent s={amending} />}
      </Modal>
    </div>
  );
}
