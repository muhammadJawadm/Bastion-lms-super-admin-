import { useState, useEffect, useMemo } from "react";
import {
  FaMobileAlt, FaCheckCircle, FaSpinner, FaPaperPlane,
  FaTrash, FaSearch, FaUsers, FaEye, FaEyeSlash,
  FaTimesCircle, FaShieldAlt, FaCalendarCheck, FaExclamationCircle,
  FaLock, FaFlag, FaCog, FaTimes, FaEnvelope, FaEdit, FaPlus,
} from "react-icons/fa";
import { Tabs } from "../components/ui/Tabs";
import { Modal, FieldLabel, FieldInput, ModalBtn } from "../components/ui/Modal";

/* ── Constants ───────────────────────────────────────────────────────── */

const FCM_URL         = "https://fcm.googleapis.com/fcm/send";
const FCM_KEY_KEY     = "bastionlms_fcm_server_key";
const FCM_HISTORY_KEY = "bastionlms_fcm_history";

const TARGET_TOPICS: Record<string, string> = {
  all:           "/topics/all",
  companyAdmins: "/topics/company_admins",
  employees:     "/topics/employees",
};

type NType = "assignment" | "deadline" | "completion" | "compliance" | "billing" | "system";

const TYPE_META: Record<NType, { label: string; icon: React.ElementType; iconBg: string; iconColor: string }> = {
  assignment: { label: "Course/Form Assignment", icon: FaShieldAlt,         iconBg: "bg-blue-100",   iconColor: "text-blue-600"   },
  deadline:   { label: "Deadline Reminder",       icon: FaCalendarCheck,     iconBg: "bg-orange-100", iconColor: "text-orange-500" },
  completion: { label: "Completion",              icon: FaFlag,              iconBg: "bg-green-100",  iconColor: "text-green-600"  },
  compliance: { label: "Overdue / Compliance",    icon: FaExclamationCircle, iconBg: "bg-red-100",    iconColor: "text-red-500"    },
  billing:    { label: "Billing",                 icon: FaLock,              iconBg: "bg-yellow-100", iconColor: "text-yellow-600" },
  system:     { label: "System",                  icon: FaCog,               iconBg: "bg-gray-100",   iconColor: "text-gray-500"   },
};

/* ── User list with FCM tokens ───────────────────────────────────────── */

interface AppUser {
  id:     number;
  name:   string;
  email:  string;
  role:   "Company Admin" | "Employee";
  avatar: string;
  token:  string;
}

const USERS: AppUser[] = [
  { id: 1,  name: "Rachel Voss",      email: "rachel.voss@titansteel.com",       role: "Company Admin", avatar: "RV", token: "dGpX8w:APA91bHnKm2Y9ZvRt3QxWcBjLr5Mn8Pu7KsYe1FwNv4Tz6QmAb0DcEf3Gh" },
  { id: 2,  name: "Devon Marsh",      email: "devon.marsh@titansteel.com",       role: "Employee",      avatar: "DM", token: "eKmY3z:APA91bRt7Lp9Qm4XsWdBgMr2Nk5Ou8JtZe6FvPw1Ay3DcEb4Hi7Kf0Lj" },
  { id: 3,  name: "Marcus Ibe",       email: "marcus@coastalexcavation.com",     role: "Company Admin", avatar: "MI", token: "fNrZ5w:APA91bUw8Mn2Vk7YtXcBhLs3Ok6Pu9ItZd7GwQx2By4EfDa5Jj8Mh1Ni" },
  { id: 4,  name: "Sam Whitfield",    email: "sam.w@coastalexcavation.com",      role: "Employee",      avatar: "SW", token: "gPsA6x:APA91bVx9No3Wl8ZuYdCiMt4Pl7Qv0JuAe8HxRy3Cz5FgEb6Kk9Nl2Oj" },
  { id: 5,  name: "Denise Falk",      email: "denise.falk@apexelectrical.com",   role: "Company Admin", avatar: "DF", token: "hQtB7y:APA91bWy0Op4Xm9AvZeCjNu5Qm8Rw1KvBf9IyS4Dz6GhFc7Ll0Mo3Pk" },
  { id: 6,  name: "Owen Pratt",       email: "owen.pratt@northbridge.com",       role: "Company Admin", avatar: "OP", token: "iRuC8z:APA91bXz1Pq5Yn0BwAfDkOv6Rn9Sx2LwCg0JzT5Ea7HiFd8Mm1Np4Ql" },
  { id: 7,  name: "Todd Warrick",     email: "todd.warrick@beaconenergy.com",    role: "Company Admin", avatar: "TW", token: "jSvD9a:APA91bYa2Qr6Zo1CxBgElPw7So0Ty3MxDh1KaU6Fb8IjGe9Nn2Oq5Rm" },
  { id: 8,  name: "Priya Nandan",     email: "priya.nandan@ironcladis.com",      role: "Company Admin", avatar: "PN", token: "kTwE0b:APA91bZb3Rs7Ap2DyChFmQx8Tp1Uz4NyEi2LbV7Gc9JkHf0Oo3Pr6Sn" },
  { id: 9,  name: "Hal Fenwick",      email: "hal.fenwick@vanguardpipeline.com", role: "Company Admin", avatar: "HF", token: "lUxF1c:APA91bAc4St8Bq3EzDiFnRy9Uq2Va5OzFj3McW8Hd0KlIg1Pp4Qs7To" },
  { id: 10, name: "Lucia Ferreira",   email: "lucia.f@titansteel.com",           role: "Employee",      avatar: "LF", token: "mVyG2d:APA91bBd5Tu9Cr4FaEjGoSz0Vr3Wb6PaGk4NdX9Ie1LmJh2Qq5Rt8Up" },
];

const AVATAR_COLORS = [
  "bg-indigo-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
  "bg-pink-500",   "bg-teal-500", "bg-red-500",   "bg-cyan-500",   "bg-amber-500",
];

const ROLE_COLORS: Record<AppUser["role"], string> = {
  "Company Admin": "bg-purple-100 text-purple-700",
  "Employee":      "bg-blue-100 text-blue-700",
};

/* ── Shared types ────────────────────────────────────────────────────── */

interface FCMRecord {
  id:        string;
  title:     string;
  body:      string;
  type:      NType;
  target:    string;
  userName?: string;
  timestamp: number;
  status:    "success" | "error";
  messageId?: string;
  error?:    string;
}

type SendStatus = "idle" | "sending" | "success" | "error";
type TargetMode = "all" | "companyAdmins" | "employees" | "user";

/* ── Storage helpers ─────────────────────────────────────────────────── */

function loadHistory(): FCMRecord[] {
  const raw = localStorage.getItem(FCM_HISTORY_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as FCMRecord[]; } catch (_e) { void _e; }
  return [];
}
function saveHistory(h: FCMRecord[]) {
  try { localStorage.setItem(FCM_HISTORY_KEY, JSON.stringify(h.slice(0, 100))); } catch (_e) { void _e; }
}
function loadKey(): string {
  return localStorage.getItem(FCM_KEY_KEY) ?? "";
}
function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min  = Math.floor(diff / 60_000);
  if (min < 1)  return "Just now";
  if (min < 60) return min + " min ago";
  const hr = Math.floor(min / 60);
  if (hr < 24)  return hr + " hr ago";
  const d = Math.floor(hr / 24);
  return d < 7 ? d + " day" + (d > 1 ? "s" : "") + " ago"
    : new Date(ts).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

/* ── User Picker ─────────────────────────────────────────────────────── */

function UserPicker({ selected, onSelect }: {
  selected: AppUser | null;
  onSelect: (u: AppUser | null) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => USERS.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-600">Select User</label>

      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
        <FaSearch size={11} className="shrink-0 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
        {search && (
          <button onClick={() => setSearch("")} className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes size={10} />
          </button>
        )}
      </div>

      <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-gray-400">No users found</div>
        ) : filtered.map((u) => {
          const isSelected = selected?.id === u.id;
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => onSelect(isSelected ? null : u)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                isSelected ? "bg-blue-50" : "hover:bg-gray-50/80"
              }`}
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${AVATAR_COLORS[(u.id - 1) % AVATAR_COLORS.length]}`}>
                {u.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${isSelected ? "text-blue-700" : "text-gray-900"}`}>{u.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                </div>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden sm:block font-mono text-[10px] text-gray-300">●●●●{u.token.slice(-6)}</span>
                {isSelected && <FaCheckCircle size={14} className="text-blue-500" />}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <FaMobileAlt size={12} className="mt-0.5 shrink-0 text-blue-500" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-blue-800">Sending to: {selected.name}</p>
            <p className="mt-0.5 break-all font-mono text-[10px] text-blue-500">{selected.token}</p>
          </div>
          <button onClick={() => onSelect(null)} className="shrink-0 text-blue-400 hover:text-blue-600 transition-colors">
            <FaTimes size={10} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Compose Card ────────────────────────────────────────────────────── */

const TARGET_OPTIONS: { key: TargetMode; label: string; sub: string; icon: React.ElementType }[] = [
  { key: "all",           label: "All Companies",   sub: "/topics/all",              icon: FaUsers      },
  { key: "companyAdmins", label: "Company Admins",  sub: "/topics/company_admins",   icon: FaMobileAlt  },
  { key: "employees",     label: "Employees",       sub: "/topics/employees",        icon: FaMobileAlt  },
  { key: "user",          label: "Specific User",   sub: "choose from list",         icon: FaSearch     },
];

const BLANK_FORM = { title: "", body: "", type: "system" as NType };

function ComposeCard({ serverKey, onSent }: {
  serverKey: string;
  onSent: (r: FCMRecord) => void;
}) {
  const [form,         setForm]         = useState(BLANK_FORM);
  const [targetMode,   setTargetMode]   = useState<TargetMode>("all");
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [status,       setStatus]       = useState<SendStatus>("idle");
  const [result,       setResult]       = useState<{ messageId?: string; error?: string } | null>(null);

  const canSend =
    !!serverKey &&
    !!form.title.trim() &&
    !!form.body.trim() &&
    (targetMode !== "user" || !!selectedUser);

  const send = async () => {
    if (!canSend) return;
    setStatus("sending");
    setResult(null);

    const to = targetMode === "user" ? selectedUser!.token : TARGET_TOPICS[targetMode];

    try {
      const res = await fetch(FCM_URL, {
        method: "POST",
        headers: {
          Authorization: "key=" + serverKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          notification: { title: form.title, body: form.body, sound: "default" },
          data: { type: form.type, click_action: "FLUTTER_NOTIFICATION_CLICK" },
        }),
      });

      const data: Record<string, unknown> = await res.json();

      if (!res.ok || (data.failure as number) > 0) {
        throw new Error(
          ((data.results as { error?: string }[])?.[0]?.error) || "Delivery failed"
        );
      }

      const record: FCMRecord = {
        id: String(Date.now()), title: form.title, body: form.body,
        type: form.type, target: to,
        userName: selectedUser?.name,
        timestamp: Date.now(), status: "success",
        messageId: data.message_id as string | undefined,
      };
      setStatus("success");
      setResult({ messageId: record.messageId });
      onSent(record);
      setForm(BLANK_FORM);
      setSelectedUser(null);
      setTimeout(() => { setStatus("idle"); setResult(null); }, 5000);

    } catch (err) {
      const msg     = err instanceof Error ? err.message : "Unknown error";
      const isCors  = msg.includes("Failed to fetch");
      const display = isCors
        ? "CORS blocked: browsers cannot call FCM directly. Use a backend proxy that holds your Server Key."
        : msg;

      setStatus("error");
      setResult({ error: display });
      onSent({
        id: String(Date.now()), title: form.title, body: form.body,
        type: form.type, target: to, userName: selectedUser?.name,
        timestamp: Date.now(), status: "error", error: display,
      });
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
            <FaPaperPlane size={13} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Compose Notification</p>
            <p className="text-xs text-gray-400">Delivered instantly to mobile app users via Firebase Cloud Messaging.</p>
          </div>
        </div>

        {!serverKey && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-yellow-100 bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
            <FaCog size={10} className="shrink-0" />
            Firebase Server Key not set — configure it in the section below.
          </div>
        )}
      </div>

      <div className="space-y-5 p-5">

        {/* Title */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Title</label>
          <input
            type="text"
            placeholder="e.g. Trench Inspection is overdue"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-colors"
          />
        </div>

        {/* Message */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Message</label>
          <textarea
            rows={3}
            placeholder="Write your notification message…"
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-colors"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Category</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as NType }))}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 cursor-pointer"
          >
            {(Object.entries(TYPE_META) as [NType, typeof TYPE_META[NType]][]).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Target audience */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-600">Target Audience</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TARGET_OPTIONS.map((t) => {
              const Icon = t.icon;
              const active = targetMode === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => { setTargetMode(t.key); setSelectedUser(null); }}
                  className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                    active ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={13} className={active ? "text-blue-500" : "text-gray-400"} />
                  <p className={`mt-1.5 text-xs font-semibold ${active ? "text-blue-700" : "text-gray-700"}`}>{t.label}</p>
                  <p className="mt-0.5 text-[10px] text-gray-400">{t.sub}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* User picker */}
        {targetMode === "user" && (
          <UserPicker selected={selectedUser} onSelect={setSelectedUser} />
        )}

        {/* Topic preview for broadcast modes */}
        {targetMode !== "user" && (
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-xs">
            <FaMobileAlt size={10} className="shrink-0 text-gray-400" />
            <span className="text-gray-500">FCM topic:</span>
            <span className="font-mono font-medium text-gray-700">{TARGET_TOPICS[targetMode]}</span>
          </div>
        )}

        {/* Send */}
        <button
          onClick={send}
          disabled={!canSend || status === "sending"}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all ${
            canSend && status !== "sending"
              ? "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-sm"
              : "cursor-not-allowed bg-gray-100 text-gray-400"
          }`}
        >
          {status === "sending"
            ? <><FaSpinner size={13} className="animate-spin" /> Sending…</>
            : <><FaMobileAlt size={13} /> Send Push to Mobile App</>}
        </button>

        {/* Result */}
        {status === "success" && result && (
          <div className="flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
            <FaCheckCircle size={16} className="mt-0.5 shrink-0 text-green-500" />
            <div>
              <p className="text-sm font-semibold text-green-800">Push notification sent!</p>
              {result.messageId && (
                <p className="mt-0.5 font-mono text-[10px] text-green-600">Message ID: {result.messageId}</p>
              )}
            </div>
          </div>
        )}
        {status === "error" && result?.error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
            <FaTimesCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-800">Failed to send</p>
              <p className="mt-0.5 text-xs text-red-600 leading-relaxed">{result.error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sent History ────────────────────────────────────────────────────── */

function HistoryCard({ history, onDelete, onClear }: {
  history:  FCMRecord[];
  onDelete: (id: string) => void;
  onClear:  () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Sent History</p>
          <p className="text-xs text-gray-400">
            {history.length} sent · {history.filter((r) => r.status === "success").length} delivered
          </p>
        </div>
        {history.length > 0 && (
          <button onClick={onClear}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors">
            <FaTrash size={10} /> Clear all
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {history.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <FaMobileAlt size={18} className="text-gray-200" />
            </div>
            <p className="text-sm text-gray-400">No notifications sent yet</p>
          </div>
        ) : history.map((r) => {
          const meta = TYPE_META[r.type];
          const Icon = meta.icon;
          return (
            <div key={r.id} className="flex items-start gap-3.5 px-5 py-4 hover:bg-gray-50/60 transition-colors">
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.iconBg}`}>
                <Icon size={14} className={meta.iconColor} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{r.title}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-400">{r.body}</p>
                  </div>
                  <span className={"shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold " + (r.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>
                    {r.status === "success" ? "Delivered" : "Failed"}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[10px]">
                  <span className="text-gray-400">{timeAgo(r.timestamp)}</span>
                  {r.userName
                    ? <span className="rounded bg-blue-50 px-1.5 py-0.5 font-medium text-blue-600">{r.userName}</span>
                    : <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-500">{r.target}</span>
                  }
                  <span className={"rounded px-1.5 py-0.5 font-medium " + meta.iconBg + " " + meta.iconColor}>{meta.label}</span>
                  {r.messageId && <span className="font-mono text-green-500">ID …{r.messageId.slice(-10)}</span>}
                  {r.error && <span className="max-w-xs truncate text-red-400">{r.error}</span>}
                  <button onClick={() => onDelete(r.id)} className="ml-auto text-gray-300 hover:text-red-400 transition-colors">
                    <FaTrash size={9} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Firebase Key Setup ──────────────────────────────────────────────── */

function KeyConfig({ serverKey, onSave }: { serverKey: string; onSave: (k: string) => void }) {
  const [open,    setOpen]    = useState(false);
  const [draft,   setDraft]   = useState(serverKey);
  const [showKey, setShowKey] = useState(false);

  const save = () => {
    const trimmed = draft.trim();
    localStorage.setItem(FCM_KEY_KEY, trimmed);
    onSave(trimmed);
    setOpen(false);
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => { setDraft(serverKey); setOpen((v) => !v); }}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <FaCog size={12} className="text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Firebase Server Key</p>
            <p className="text-xs text-gray-400">
              {serverKey ? "Key set · ●●●●" + serverKey.slice(-4) : "Not configured"}
            </p>
          </div>
        </div>
        <span className={"rounded-full px-3 py-1 text-xs font-semibold " + (serverKey ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700")}>
          {serverKey ? "✓ Set" : "Not set"}
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-gray-100 p-5">
          <p className="text-xs text-gray-500">
            Find your key at:{" "}
            <span className="font-medium text-gray-700">
              Firebase Console → Project Settings → Cloud Messaging → Server Key
            </span>
          </p>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              placeholder="AAAA…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full rounded-lg border border-gray-200 pr-10 px-3 py-2.5 font-mono text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
            />
            <button onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showKey ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={save}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              Save
            </button>
            <button onClick={() => setOpen(false)}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Notification Templates ─────────────────────────────────────────── */

interface NotificationTemplate {
  id: number;
  name: string;
  trigger: string;
  lastEdited: string;
}

const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  { id: 1, name: "Account Invitation",        trigger: "New user created",                 lastEdited: "12 Jun 2026" },
  { id: 2, name: "Course Due Reminder",       trigger: "3 days before due date",           lastEdited: "02 Mar 2026" },
  { id: 3, name: "Overdue Inspection Alert",  trigger: "Required form past due",           lastEdited: "18 Jan 2026" },
  { id: 4, name: "Certificate Expiring Soon", trigger: "30 / 60 / 90 days before expiry",  lastEdited: "27 Apr 2026" },
];

function NotificationTemplatesTab({ onEdit }: { onEdit: (t: NotificationTemplate) => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <ul className="divide-y divide-gray-50">
        {NOTIFICATION_TEMPLATES.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50"><FaEnvelope size={13} className="text-blue-600" /></div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400">Trigger: {t.trigger}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-xs">
              <span className="text-gray-400">Edited {t.lastEdited}</span>
              <button onClick={() => onEdit(t)} className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800 transition-colors"><FaEdit size={10} /> Edit</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function Notifications() {
  const [serverKey, setServerKey] = useState(loadKey);
  const [history,   setHistory]   = useState<FCMRecord[]>(loadHistory);
  const [tab,       setTab]       = useState("send");
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  useEffect(() => { saveHistory(history); }, [history]);

  const delivered  = history.filter((r) => r.status === "success").length;
  const failed     = history.filter((r) => r.status === "error").length;
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayCount = history.filter((r) => r.timestamp >= todayStart).length;

  return (
    <div className="space-y-5">

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Send push notifications and manage the email/notification templates behind them.
          </p>
        </div>
        {tab === "templates" && (
          <button
            onClick={() => setCreatingTemplate(true)}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <FaPlus size={12} /> New Template
          </button>
        )}
      </div>

      <Tabs
        tabs={[
          { key: "send",      label: "Send Push" },
          { key: "templates", label: "Notification Templates", count: NOTIFICATION_TEMPLATES.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "send" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Total Sent", value: history.length, bg: "bg-blue-50",   color: "text-blue-600"   },
              { label: "Delivered",  value: delivered,       bg: "bg-green-50",  color: "text-green-600"  },
              { label: "Failed",     value: failed,          bg: "bg-red-50",    color: "text-red-500"    },
              { label: "Today",      value: todayCount,      bg: "bg-indigo-50", color: "text-indigo-600" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className={"mb-2 flex h-9 w-9 items-center justify-center rounded-xl " + s.bg}>
                  <FaMobileAlt size={14} className={s.color} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="mt-0.5 text-xs font-medium text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          <ComposeCard serverKey={serverKey} onSent={(r) => setHistory((h) => [r, ...h])} />

          <HistoryCard
            history={history}
            onDelete={(id) => setHistory((h) => h.filter((r) => r.id !== id))}
            onClear={() => setHistory([])}
          />

          <KeyConfig serverKey={serverKey} onSave={setServerKey} />
        </>
      )}

      {tab === "templates" && (
        <NotificationTemplatesTab onEdit={setEditingTemplate} />
      )}

      <Modal
        isOpen={editingTemplate !== null || creatingTemplate}
        onClose={() => { setEditingTemplate(null); setCreatingTemplate(false); }}
        title={creatingTemplate ? "New Notification Template" : "Edit Notification Template"}
        footer={
          <>
            <ModalBtn variant="secondary" onClick={() => { setEditingTemplate(null); setCreatingTemplate(false); }}>Cancel</ModalBtn>
            <ModalBtn variant="primary" onClick={() => { setEditingTemplate(null); setCreatingTemplate(false); }}>Save Template</ModalBtn>
          </>
        }
      >
        <div className="space-y-4">
          {creatingTemplate && <div><FieldLabel>Template Name</FieldLabel><FieldInput placeholder="e.g. Renewal Reminder" /></div>}
          <div><FieldLabel>Subject</FieldLabel><FieldInput defaultValue={editingTemplate ? "Your certification is expiring soon" : ""} /></div>
          <div>
            <FieldLabel>Body</FieldLabel>
            <textarea rows={5} defaultValue={editingTemplate ? "Hi {{first_name}},\n\nYour certificate for {{course_name}} expires on {{expiry_date}}. Please schedule recertification.\n\n— Bastion LMS" : ""}
              placeholder="Write the message body — use {{first_name}}, {{course_name}}, {{expiry_date}} as merge fields."
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </div>
        </div>
      </Modal>

    </div>
  );
}
