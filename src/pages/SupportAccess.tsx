import { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Modal, FieldLabel, FieldInput, FieldSelect, FieldTextarea, ModalBtn } from "../components/ui/Modal";
import { SUPPORT_SESSIONS, type SupportSession } from "../data/supportSessions";
import { COMPANIES } from "../data/companies";
import { FaHeadset, FaEye, FaEyeSlash, FaExclamationTriangle, FaLock, FaUnlockAlt } from "react-icons/fa";

function StartSessionContent({ companyId, setCompanyId, reason, setReason, ticket, setTicket, accessLevel, setAccessLevel }: {
  companyId: string; setCompanyId: (v: string) => void;
  reason: string; setReason: (v: string) => void;
  ticket: string; setTicket: (v: string) => void;
  accessLevel: "Read-only" | "Elevated"; setAccessLevel: (v: "Read-only" | "Elevated") => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Client Company</FieldLabel>
        <FieldSelect value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
          {COMPANIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </FieldSelect>
      </div>
      <div><FieldLabel>Ticket / Request Reference</FieldLabel><FieldInput value={ticket} onChange={(e) => setTicket(e.target.value)} placeholder="e.g. #4821" /></div>
      <div><FieldLabel>Reason (required)</FieldLabel><FieldTextarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why are you accessing this client's workspace?" /></div>
      <div>
        <FieldLabel>Requested Access Level</FieldLabel>
        <div className="flex gap-2">
          <button type="button" onClick={() => setAccessLevel("Read-only")} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${accessLevel === "Read-only" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            <FaLock size={11} className="inline mr-1.5 -mt-0.5" /> Read-only
          </button>
          <button type="button" onClick={() => setAccessLevel("Elevated")} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${accessLevel === "Elevated" ? "border-amber-300 bg-amber-50 text-amber-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            <FaUnlockAlt size={11} className="inline mr-1.5 -mt-0.5" /> Elevated
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SupportAccess() {
  const [startOpen, setStartOpen] = useState(false);
  const [companyId, setCompanyId] = useState(COMPANIES[0].id);
  const [reason, setReason] = useState("");
  const [ticket, setTicket] = useState("");
  const [accessLevel, setAccessLevel] = useState<"Read-only" | "Elevated">("Read-only");
  const [activeSession, setActiveSession] = useState<SupportSession | null>(null);
  const [localHistory, setLocalHistory] = useState<SupportSession[]>([]);

  const company = COMPANIES.find((c) => c.id === companyId)!;

  function startSession() {
    const session: SupportSession = {
      id: `local-${Date.now()}`, supportUser: "Super Admin", companyId, companyName: company.name,
      reason, ticketRef: ticket || "—", accessLevel, startTime: new Date().toLocaleString(), endTime: null,
      actions: ["Session started"],
    };
    setActiveSession(session);
    setStartOpen(false);
    setReason(""); setTicket("");
  }
  function endSession() {
    if (!activeSession) return;
    const closed = { ...activeSession, endTime: new Date().toLocaleString() };
    setLocalHistory((prev) => [closed, ...prev]);
    setActiveSession(null);
  }

  const history = [...localHistory, ...SUPPORT_SESSIONS];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Access</h1>
          <p className="mt-1 text-sm text-gray-500">Controlled, logged access into a client workspace — read-only by default, every elevated action recorded.</p>
        </div>
        <button
          disabled={activeSession !== null}
          onClick={() => setStartOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FaHeadset size={12} /> Start Support Session
        </button>
      </div>

      {activeSession && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2.5 text-amber-800">
            <FaEye size={14} />
            <div>
              <p className="text-sm font-medium">
                Support Mode active — viewing {activeSession.companyName} — {activeSession.accessLevel}
              </p>
              <p className="text-xs text-amber-700">Ticket {activeSession.ticketRef} · {activeSession.reason || "No reason recorded"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeSession.accessLevel === "Read-only" && (
              <button
                onClick={() => setActiveSession({ ...activeSession, accessLevel: "Elevated", actions: [...activeSession.actions, "Elevated access granted"] })}
                className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <FaUnlockAlt size={10} /> Elevate Access
              </button>
            )}
            <button onClick={endSession} className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900">
              <FaEyeSlash size={11} /> End Session
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-2.5 text-xs text-gray-500">
          <FaExclamationTriangle size={13} className="mt-0.5 shrink-0 text-gray-400" />
          Support sessions never expose complete payment credentials or other restricted data, and end automatically after inactivity. Every session and elevated action is written to the Audit Log.
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Session History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/70">
              <tr>{["Support User", "Company", "Reason", "Ticket", "Access Level", "Start", "End"].map((h) => <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm font-medium text-gray-800">{s.supportUser}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-600">{s.companyName}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 max-w-64 truncate" title={s.reason}>{s.reason}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">{s.ticketRef}</td>
                  <td className="px-5 py-3.5"><Badge variant={s.accessLevel === "Elevated" ? "warning" : "info"}>{s.accessLevel}</Badge></td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">{s.startTime}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">{s.endTime ?? "In progress"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={startOpen}
        onClose={() => setStartOpen(false)}
        title="Start Support Session"
        footer={<><ModalBtn variant="secondary" onClick={() => setStartOpen(false)}>Cancel</ModalBtn><ModalBtn variant="primary" onClick={startSession} disabled={!reason.trim()}>Start Session</ModalBtn></>}
      >
        <StartSessionContent companyId={companyId} setCompanyId={setCompanyId} reason={reason} setReason={setReason} ticket={ticket} setTicket={setTicket} accessLevel={accessLevel} setAccessLevel={setAccessLevel} />
      </Modal>
    </div>
  );
}
