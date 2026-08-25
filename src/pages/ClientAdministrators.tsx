import { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Toggle } from "../components/ui/Toggle";
import { Modal, FieldLabel, FieldInput, FieldSelect, FieldTextarea, ModalBtn } from "../components/ui/Modal";
import { COMPANIES } from "../data/companies";
import {
  FaSearch, FaPlus, FaExclamationCircle,
  FaRandom, FaShieldAlt, FaInfoCircle,
} from "react-icons/fa";

const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-orange-500",
  "bg-pink-500", "bg-cyan-500", "bg-rose-500", "bg-indigo-500",
];
const avatarColor = (n: string) => AVATAR_COLORS[n.charCodeAt(0) % AVATAR_COLORS.length];
const initials = (n: string) => {
  const p = n.trim().split(" ");
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase();
};

type Role = "Super Admin" | "Company Admin" | "Employee";
type Status = "Active" | "Suspended" | "Invited";

interface AppUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  company: string | null;
  jobTitle: string;
  status: Status;
  joined: string;
}

const USERS: AppUser[] = [
  { id: 1,  name: "Super Admin",      email: "admin@bastionlms.com",              role: "Super Admin",   company: null,                          jobTitle: "Platform Owner",        status: "Active",   joined: "01 Jan 2023" },
  { id: 2,  name: "Rachel Voss",      email: "rachel.voss@titansteel.com",        role: "Company Admin", company: COMPANIES[0].name,             jobTitle: "Safety Director",        status: "Active",   joined: "18 Jan 2024" },
  { id: 3,  name: "Devon Marsh",      email: "devon.marsh@titansteel.com",        role: "Employee",      company: COMPANIES[0].name,             jobTitle: "Excavation Foreman",     status: "Active",   joined: "22 Jan 2024" },
  { id: 4,  name: "Lucia Ferreira",   email: "lucia.f@titansteel.com",            role: "Employee",      company: COMPANIES[0].name,             jobTitle: "Site Crew",              status: "Active",   joined: "02 Feb 2024" },
  { id: 5,  name: "Marcus Ibe",       email: "marcus@coastalexcavation.com",      role: "Company Admin", company: COMPANIES[1].name,             jobTitle: "Operations Manager",     status: "Active",   joined: "02 Apr 2024" },
  { id: 6,  name: "Sam Whitfield",    email: "sam.w@coastalexcavation.com",       role: "Employee",      company: COMPANIES[1].name,             jobTitle: "Equipment Operator",     status: "Suspended", joined: "10 Apr 2024" },
  { id: 7,  name: "Denise Falk",      email: "denise.falk@apexelectrical.com",    role: "Company Admin", company: COMPANIES[2].name,             jobTitle: "HSE Manager",            status: "Active",   joined: "30 Jun 2024" },
  { id: 8,  name: "Owen Pratt",       email: "owen.pratt@northbridge.com",        role: "Company Admin", company: COMPANIES[3].name,             jobTitle: "Regional Safety Lead",   status: "Active",   joined: "11 Sep 2023" },
  { id: 9,  name: "Casey Mullen",     email: "casey@summitroofing.com",           role: "Company Admin", company: COMPANIES[4].name,             jobTitle: "Owner",                  status: "Invited",  joined: "05 Feb 2025" },
  { id: 10, name: "Priya Nandan",     email: "priya.nandan@ironcladis.com",       role: "Company Admin", company: COMPANIES[5].name,             jobTitle: "Plant Safety Manager",   status: "Active",   joined: "19 Nov 2023" },
  { id: 11, name: "Todd Warrick",     email: "todd.warrick@beaconenergy.com",     role: "Company Admin", company: COMPANIES[6].name,             jobTitle: "Field Ops Director",     status: "Active",   joined: "27 Jul 2023" },
  { id: 12, name: "Hal Fenwick",      email: "hal.fenwick@vanguardpipeline.com",  role: "Company Admin", company: COMPANIES[8].name,             jobTitle: "QA/QC Manager",          status: "Active",   joined: "08 Mar 2024" },
  { id: 13, name: "Jordan Blake",     email: "jordan.blake@gmail.com",            role: "Employee",      company: null,                          jobTitle: "Independent Contractor", status: "Active",   joined: "14 Jul 2025" },
];

type ModalState =
  | { type: "view";    user: AppUser }
  | { type: "add" }
  | { type: "merge" }
  | { type: "reset";   user: AppUser }
  | { type: "move";    user: AppUser }
  | { type: "suspend"; user: AppUser }
  | null;

function roleBadge(r: Role): "danger" | "purple" | "info" {
  if (r === "Super Admin") return "danger";
  if (r === "Company Admin") return "purple";
  return "info";
}
function statusBadge(s: Status): "success" | "danger" | "warning" {
  if (s === "Active") return "success";
  if (s === "Suspended") return "danger";
  return "warning";
}

/* ── Modal content components ───────────────────────────────────────── */

function UserViewContent({ user }: { user: AppUser }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white ${avatarColor(user.name)}`}>
          {initials(user.name)}
        </div>
        <div className="min-w-0">
          <h4 className="text-base font-semibold text-gray-900">{user.name}</h4>
          <p className="text-sm text-gray-400">{user.email}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge variant={roleBadge(user.role)}>{user.role}</Badge>
            <Badge variant={statusBadge(user.status)}>{user.status}</Badge>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {[
          { label: "User ID",   value: `USR-${String(user.id).padStart(4, "0")}` },
          { label: "Company",   value: user.company ?? "— (Individual account)" },
          { label: "Job Title", value: user.jobTitle },
          { label: "Joined",    value: user.joined },
        ].map((d) => (
          <div key={d.label}>
            <p className="text-xs text-gray-400">{d.label}</p>
            <p className="mt-0.5 font-medium text-gray-800">{d.value}</p>
          </div>
        ))}
      </div>
      {user.role === "Employee" && (
        <div className="flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-3 text-xs text-blue-700">
          <FaInfoCircle size={13} className="mt-0.5 shrink-0" />
          This is an employee account, managed day-to-day by {user.company ?? "their"} Company Admin. Shown here read-only for
          troubleshooting, account recovery, or security response — deeper account actions run through Support Access.
        </div>
      )}
    </div>
  );
}

function AddUserContent() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><FieldLabel>Full Name</FieldLabel><FieldInput placeholder="e.g. John Smith" /></div>
        <div><FieldLabel>Email</FieldLabel><FieldInput type="email" placeholder="john@client.com" /></div>
        <div>
          <FieldLabel>Role</FieldLabel>
          <FieldSelect><option>Company Admin</option><option>Super Admin</option></FieldSelect>
        </div>
        <div>
          <FieldLabel>Company</FieldLabel>
          <FieldSelect>
            <option>— Bastion internal (Super Admin only) —</option>
            {COMPANIES.map((c) => <option key={c.id}>{c.name}</option>)}
          </FieldSelect>
        </div>
        <div className="col-span-2"><FieldLabel>Job Title</FieldLabel><FieldInput placeholder="e.g. Safety Director" /></div>
      </div>
      <div className="flex items-start gap-2.5 rounded-lg border border-gray-200 px-3.5 py-3 text-xs text-gray-500">
        <FaInfoCircle size={13} className="mt-0.5 shrink-0" />
        Employee accounts are created by each company's own Company Admin, not from here.
      </div>
    </div>
  );
}

function MergeContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Select two accounts that represent the same person. Admin history is combined onto the primary account.</p>
      <div>
        <FieldLabel>Primary account (kept)</FieldLabel>
        <FieldSelect>{USERS.filter((u) => u.role !== "Employee").map((u) => <option key={u.id}>{u.name} — {u.email}</option>)}</FieldSelect>
      </div>
      <div>
        <FieldLabel>Duplicate account (merged in, then removed)</FieldLabel>
        <FieldSelect>{USERS.filter((u) => u.role !== "Employee").map((u) => <option key={u.id}>{u.name} — {u.email}</option>)}</FieldSelect>
      </div>
      <div className="flex items-start gap-2.5 rounded-lg border border-yellow-100 bg-yellow-50 px-3.5 py-3 text-xs text-yellow-700">
        <FaExclamationCircle size={13} className="mt-0.5 shrink-0" />
        This cannot be undone. The duplicate account will be permanently removed.
      </div>
    </div>
  );
}

function ResetPasswordContent({ user }: { user: AppUser }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <FaShieldAlt size={18} className="mt-0.5 shrink-0 text-blue-500" />
        <div>
          <p className="text-sm font-semibold text-gray-800">Reset password for {user.name}?</p>
          <p className="mt-0.5 text-xs text-gray-500">Sends a reset link to {user.email} and forces re-login on their next session.</p>
        </div>
      </div>
    </div>
  );
}

function MoveCompanyContent({ user }: { user: AppUser }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Move {user.name} to a different company.</p>
      <div>
        <FieldLabel>Current Company</FieldLabel>
        <FieldInput value={user.company ?? "— Individual account —"} disabled />
      </div>
      <div>
        <FieldLabel>New Company</FieldLabel>
        <FieldSelect>{COMPANIES.filter((c) => c.name !== user.company).map((c) => <option key={c.id}>{c.name}</option>)}</FieldSelect>
      </div>
    </div>
  );
}

function SuspendContent({ user }: { user: AppUser }) {
  const suspending = user.status === "Active";
  return (
    <div className="space-y-4">
      <div className={`flex items-start gap-3 rounded-xl border p-4 ${suspending ? "border-red-100 bg-red-50" : "border-green-100 bg-green-50"}`}>
        <FaExclamationCircle size={18} className={`mt-0.5 shrink-0 ${suspending ? "text-red-500" : "text-green-500"}`} />
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {suspending ? `Deactivate ${user.name}?` : `Reactivate ${user.name}?`}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {suspending ? "This blocks admin access immediately." : "The user will regain full admin access."}
          </p>
        </div>
      </div>
      {suspending && (
        <div>
          <FieldLabel>Reason (optional)</FieldLabel>
          <FieldTextarea rows={3} placeholder="e.g. No longer with the company..." />
        </div>
      )}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function ClientAdministrators() {
  const [search, setSearch]               = useState("");
  const [companyFilter, setCompanyFilter]  = useState("All");
  const [statusFilter, setStatusFilter]    = useState("All");
  const [includeEmployees, setIncludeEmployees] = useState(false);
  const [modal, setModal]                  = useState<ModalState>(null);

  const base = includeEmployees ? USERS : USERS.filter((u) => u.role !== "Employee");
  const filtered = base.filter(
    (u) =>
      (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
      (companyFilter === "All" || u.company === companyFilter) &&
      (statusFilter === "All" || u.status === statusFilter)
  );

  const modalTitle =
    modal?.type === "view"    ? "Account Details"        :
    modal?.type === "add"     ? "Add Administrator"       :
    modal?.type === "merge"   ? "Merge Duplicate Accounts" :
    modal?.type === "reset"   ? "Reset Password"           :
    modal?.type === "move"    ? "Move to Another Company"  :
    modal?.type === "suspend" ? (modal.user.status === "Active" ? "Deactivate User" : "Activate User") : "";

  const modalFooter = modal ? (
    <>
      <ModalBtn variant="secondary" onClick={() => setModal(null)}>Cancel</ModalBtn>
      {modal.type === "add"     && <ModalBtn variant="primary">Add Administrator</ModalBtn>}
      {modal.type === "merge"   && <ModalBtn variant="primary">Merge Accounts</ModalBtn>}
      {modal.type === "reset"   && <ModalBtn variant="primary">Send Reset Link</ModalBtn>}
      {modal.type === "move"    && <ModalBtn variant="primary">Move User</ModalBtn>}
      {modal.type === "suspend" && (
        <ModalBtn variant={modal.user.status === "Active" ? "danger" : "primary"}>
          {modal.user.status === "Active" ? "Deactivate" : "Activate"}
        </ModalBtn>
      )}
    </>
  ) : undefined;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Administrators</h1>
          <p className="mt-1 text-sm text-gray-500">Super Admin and Company Admin accounts. Employee accounts are managed inside each company's own workspace.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setModal({ type: "merge" })}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <FaRandom size={12} /> Merge Duplicates
          </button>
          <button
            onClick={() => setModal({ type: "add" })}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <FaPlus size={12} /> Add Administrator
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-50 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <FaSearch size={13} className="shrink-0 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
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
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none cursor-pointer">
          {["All", "Active", "Suspended", "Invited"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <Toggle checked={includeEmployees} onChange={setIncludeEmployees} label="Include employees (search only)" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/70">
              <tr>
                {["User", "Role", "Company", "Status", "Actions"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">No accounts match your filters.</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 shrink-0 rounded-full ${avatarColor(u.name)} flex items-center justify-center text-xs font-semibold text-white`}>
                        {initials(u.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><Badge variant={roleBadge(u.role)}>{u.role}</Badge></td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-600">{u.company ?? "—"}</td>
                  <td className="px-5 py-3.5"><Badge variant={statusBadge(u.status)}>{u.status}</Badge></td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium">
                      <button onClick={() => setModal({ type: "view", user: u })} className="text-blue-600 hover:text-blue-800 transition-colors">View</button>
                      {u.role !== "Employee" && (
                        <>
                          {u.status === "Invited" && (
                            <button className="text-green-600 hover:text-green-800 transition-colors">Resend Invite</button>
                          )}
                          <button onClick={() => setModal({ type: "reset", user: u })} className="text-gray-500 hover:text-gray-800 transition-colors">Reset PW</button>
                          {u.company && (
                            <button onClick={() => setModal({ type: "move", user: u })} className="text-gray-500 hover:text-gray-800 transition-colors">Move</button>
                          )}
                          <button onClick={() => setModal({ type: "suspend", user: u })}
                            className={u.status === "Active" ? "text-red-500 hover:text-red-700 transition-colors" : "text-green-500 hover:text-green-700 transition-colors"}>
                            {u.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                        </>
                      )}
                      {u.role === "Employee" && <span className="text-gray-300">Managed by Company Admin</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
          Showing {filtered.length} of {base.length} accounts
        </div>
      </div>

      <Modal isOpen={modal !== null} onClose={() => setModal(null)} title={modalTitle} footer={modalFooter}>
        {modal?.type === "view"    && <UserViewContent user={modal.user} />}
        {modal?.type === "add"     && <AddUserContent />}
        {modal?.type === "merge"   && <MergeContent />}
        {modal?.type === "reset"   && <ResetPasswordContent user={modal.user} />}
        {modal?.type === "move"    && <MoveCompanyContent user={modal.user} />}
        {modal?.type === "suspend" && <SuspendContent user={modal.user} />}
      </Modal>
    </div>
  );
}
