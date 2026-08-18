import { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Modal, FieldLabel, FieldInput, FieldSelect, FieldTextarea, ModalBtn } from "../components/ui/Modal";
import { COMPANIES } from "../data/companies";
import {
  FaSearch, FaPlus, FaCheckCircle, FaExclamationCircle,
  FaUpload, FaRandom, FaShieldAlt,
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
  competentPerson: boolean;
  status: Status;
  joined: string;
}

const USERS: AppUser[] = [
  { id: 1,  name: "Super Admin",      email: "admin@bastionlms.com",              role: "Super Admin",   company: null,                          jobTitle: "Platform Owner",        competentPerson: false, status: "Active",   joined: "01 Jan 2023" },
  { id: 2,  name: "Rachel Voss",      email: "rachel.voss@titansteel.com",        role: "Company Admin", company: COMPANIES[0].name,             jobTitle: "Safety Director",        competentPerson: true,  status: "Active",   joined: "18 Jan 2024" },
  { id: 3,  name: "Devon Marsh",      email: "devon.marsh@titansteel.com",        role: "Employee",      company: COMPANIES[0].name,             jobTitle: "Excavation Foreman",     competentPerson: true,  status: "Active",   joined: "22 Jan 2024" },
  { id: 4,  name: "Lucia Ferreira",   email: "lucia.f@titansteel.com",            role: "Employee",      company: COMPANIES[0].name,             jobTitle: "Site Crew",              competentPerson: false, status: "Active",   joined: "02 Feb 2024" },
  { id: 5,  name: "Marcus Ibe",       email: "marcus@coastalexcavation.com",      role: "Company Admin", company: COMPANIES[1].name,             jobTitle: "Operations Manager",     competentPerson: true,  status: "Active",   joined: "02 Apr 2024" },
  { id: 6,  name: "Sam Whitfield",    email: "sam.w@coastalexcavation.com",       role: "Employee",      company: COMPANIES[1].name,             jobTitle: "Equipment Operator",     competentPerson: false, status: "Suspended", joined: "10 Apr 2024" },
  { id: 7,  name: "Denise Falk",      email: "denise.falk@apexelectrical.com",    role: "Company Admin", company: COMPANIES[2].name,             jobTitle: "HSE Manager",            competentPerson: true,  status: "Active",   joined: "30 Jun 2024" },
  { id: 8,  name: "Owen Pratt",       email: "owen.pratt@northbridge.com",        role: "Company Admin", company: COMPANIES[3].name,             jobTitle: "Regional Safety Lead",   competentPerson: true,  status: "Active",   joined: "11 Sep 2023" },
  { id: 9,  name: "Casey Mullen",     email: "casey@summitroofing.com",           role: "Company Admin", company: COMPANIES[4].name,             jobTitle: "Owner",                  competentPerson: false, status: "Invited",  joined: "05 Feb 2025" },
  { id: 10, name: "Priya Nandan",     email: "priya.nandan@ironcladis.com",       role: "Company Admin", company: COMPANIES[5].name,             jobTitle: "Plant Safety Manager",   competentPerson: true,  status: "Active",   joined: "19 Nov 2023" },
  { id: 11, name: "Todd Warrick",     email: "todd.warrick@beaconenergy.com",     role: "Company Admin", company: COMPANIES[6].name,             jobTitle: "Field Ops Director",     competentPerson: true,  status: "Active",   joined: "27 Jul 2023" },
  { id: 12, name: "Hal Fenwick",      email: "hal.fenwick@vanguardpipeline.com",  role: "Company Admin", company: COMPANIES[8].name,             jobTitle: "QA/QC Manager",          competentPerson: true,  status: "Active",   joined: "08 Mar 2024" },
  { id: 13, name: "Jordan Blake",     email: "jordan.blake@gmail.com",            role: "Employee",      company: null,                          jobTitle: "Independent Contractor", competentPerson: false, status: "Active",   joined: "14 Jul 2025" },
];

type ModalState =
  | { type: "view";    user: AppUser }
  | { type: "add" }
  | { type: "bulk" }
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
            {user.competentPerson && <Badge variant="orange">Competent Person</Badge>}
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
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Courses Assigned", value: "6" },
          { label: "Forms Submitted", value: "42" },
          { label: "Certificates", value: "4" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-lg font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>
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
          <FieldSelect><option>Employee</option><option>Company Admin</option><option>Super Admin</option></FieldSelect>
        </div>
        <div>
          <FieldLabel>Company</FieldLabel>
          <FieldSelect>
            <option>— Individual account —</option>
            {COMPANIES.map((c) => <option key={c.id}>{c.name}</option>)}
          </FieldSelect>
        </div>
        <div><FieldLabel>Job Title</FieldLabel><FieldInput placeholder="e.g. Excavation Foreman" /></div>
        <div><FieldLabel>Site / Location</FieldLabel><FieldInput placeholder="e.g. Charlotte Yard" /></div>
      </div>
      <label className="flex items-center gap-2.5 rounded-lg border border-gray-200 px-3.5 py-2.5">
        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600" />
        <span className="text-sm text-gray-700">Flag as competent person / supervisor</span>
      </label>
    </div>
  );
}

function BulkImportContent() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-10 text-center hover:border-blue-300 transition-colors cursor-pointer">
        <FaUpload size={20} className="text-gray-300" />
        <p className="text-sm font-medium text-gray-600">Drop a CSV or Excel file, or click to browse</p>
        <p className="text-xs text-gray-400">Name, Email, Role, Company, Job Title, Site columns expected</p>
      </div>
      <div>
        <FieldLabel>Target Company</FieldLabel>
        <FieldSelect>{COMPANIES.map((c) => <option key={c.id}>{c.name}</option>)}</FieldSelect>
      </div>
      <div className="flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-3 text-xs text-blue-700">
        <FaCheckCircle size={13} className="mt-0.5 shrink-0" />
        Every row is validated for duplicate emails and missing required fields before anything is saved.
      </div>
    </div>
  );
}

function MergeContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Select two accounts that represent the same person. Training history, submissions and certificates are combined onto the primary account.</p>
      <div>
        <FieldLabel>Primary account (kept)</FieldLabel>
        <FieldSelect>{USERS.map((u) => <option key={u.id}>{u.name} — {u.email}</option>)}</FieldSelect>
      </div>
      <div>
        <FieldLabel>Duplicate account (merged in, then removed)</FieldLabel>
        <FieldSelect>{USERS.map((u) => <option key={u.id}>{u.name} — {u.email}</option>)}</FieldSelect>
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
      <p className="text-sm text-gray-500">Move {user.name} to a different company. Their training history and certificates travel with them.</p>
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
            {suspending
              ? "This frees their seat and blocks access immediately. Their training records are kept."
              : "The user will regain full platform access and their seat is re-allocated."}
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

export default function Users() {
  const [search, setSearch]             = useState("");
  const [roleFilter, setRoleFilter]     = useState("All");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modal, setModal]               = useState<ModalState>(null);

  const filtered = USERS.filter(
    (u) =>
      (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
      (roleFilter === "All" || u.role === roleFilter) &&
      (companyFilter === "All" || u.company === companyFilter) &&
      (statusFilter === "All" || u.status === statusFilter)
  );

  const modalTitle =
    modal?.type === "view"    ? "User Details"        :
    modal?.type === "add"     ? "Add User"             :
    modal?.type === "bulk"    ? "Bulk Import Users"     :
    modal?.type === "merge"   ? "Merge Duplicate Accounts" :
    modal?.type === "reset"   ? "Reset Password"        :
    modal?.type === "move"    ? "Move to Another Company" :
    modal?.type === "suspend" ? (modal.user.status === "Active" ? "Deactivate User" : "Activate User") : "";

  const modalFooter = modal ? (
    <>
      <ModalBtn variant="secondary" onClick={() => setModal(null)}>Cancel</ModalBtn>
      {modal.type === "add"     && <ModalBtn variant="primary">Add User</ModalBtn>}
      {modal.type === "bulk"    && <ModalBtn variant="primary">Import Users</ModalBtn>}
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">Every account on the platform — Super Admins, Company Admins and Employees.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setModal({ type: "merge" })}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <FaRandom size={12} /> Merge Duplicates
          </button>
          <button
            onClick={() => setModal({ type: "bulk" })}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <FaUpload size={12} /> Bulk Import
          </button>
          <button
            onClick={() => setModal({ type: "add" })}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <FaPlus size={12} /> Add User
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
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none cursor-pointer">
          {["All", "Super Admin", "Company Admin", "Employee"].map((r) => <option key={r}>{r}</option>)}
        </select>
        <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none cursor-pointer">
          <option>All</option>
          {COMPANIES.map((c) => <option key={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none cursor-pointer">
          {["All", "Active", "Suspended", "Invited"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/70">
              <tr>
                {["User", "Role", "Company", "Competent Person", "Status", "Actions"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No users match your filters.</td></tr>
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
                  <td className="px-5 py-3.5">{u.competentPerson ? <Badge variant="orange">Yes</Badge> : <span className="text-xs text-gray-300">—</span>}</td>
                  <td className="px-5 py-3.5"><Badge variant={statusBadge(u.status)}>{u.status}</Badge></td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium">
                      <button onClick={() => setModal({ type: "view", user: u })} className="text-blue-600 hover:text-blue-800 transition-colors">View</button>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
          Showing {filtered.length} of {USERS.length} users
        </div>
      </div>

      <Modal isOpen={modal !== null} onClose={() => setModal(null)} title={modalTitle} footer={modalFooter}>
        {modal?.type === "view"    && <UserViewContent user={modal.user} />}
        {modal?.type === "add"     && <AddUserContent />}
        {modal?.type === "bulk"    && <BulkImportContent />}
        {modal?.type === "merge"   && <MergeContent />}
        {modal?.type === "reset"   && <ResetPasswordContent user={modal.user} />}
        {modal?.type === "move"    && <MoveCompanyContent user={modal.user} />}
        {modal?.type === "suspend" && <SuspendContent user={modal.user} />}
      </Modal>
    </div>
  );
}

