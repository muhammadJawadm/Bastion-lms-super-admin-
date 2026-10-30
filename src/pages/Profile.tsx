import { useState } from "react";
import { useNavigate } from "react-router";
import { FaSave, FaLock, FaShieldAlt, FaSignOutAlt } from "react-icons/fa";
import { api, errorMessage } from "../lib/api";
import { useApi } from "../lib/useApi";
import { clearSession, getToken, setSession } from "../lib/session";
import { avatarColor, formatDate, formatDateTime, initials, titleCase } from "../lib/format";
import type { ApiResponse, MyCourse, Paginated, User } from "../lib/types";
import { Alert, LoadingBlock, ErrorBlock, EmptyBlock, Spinner } from "../components/ui/States";
import { Badge } from "../components/ui/Badge";
import { ProgressBar } from "../components/ui/ProgressBar";
import { PageHeader, DangerButton } from "../components/ui/PageHeader";

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed";

function ProfileForm({ me, onSaved }: { me: User; onSaved: () => void }) {
  const [name, setName] = useState(me.name);
  const [jobTitle, setJobTitle] = useState(me.jobTitle ?? "");
  const [department, setDepartment] = useState(me.department ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      // PATCH /users/:id — own profile only accepts name, department, jobTitle, avatarUrl.
      const res = await api.patch<ApiResponse<User>>(`/users/${me._id}`, { name: name.trim(), jobTitle: jobTitle.trim(), department: department.trim() });
      const token = getToken();
      if (token) setSession(token, { _id: res.data._id, name: res.data.name, email: res.data.email, role: res.data.role, companyId: res.data.companyId });
      setMsg({ ok: true, text: "Profile updated." });
      onSaved();
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) });
    }
    setBusy(false);
  };

  return (
    <form onSubmit={save} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900">Personal Information</h2>
      {msg && <div className="mt-3"><Alert variant={msg.ok ? "success" : "error"}>{msg.text}</Alert></div>}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div><label className="mb-1.5 block text-xs font-semibold text-gray-600">Full name</label><input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} /></div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Email</label>
          <input value={me.email} disabled className={inputClass} />
          <p className="mt-1 text-[11px] text-gray-400">The API doesn't allow changing a login email.</p>
        </div>
        <div><label className="mb-1.5 block text-xs font-semibold text-gray-600">Job title</label><input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={inputClass} /></div>
        <div><label className="mb-1.5 block text-xs font-semibold text-gray-600">Department</label><input value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass} /></div>
      </div>
      <div className="mt-4 flex justify-end">
        <button type="submit" disabled={busy} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
          {busy ? <Spinner /> : <FaSave size={13} />} Save Changes
        </button>
      </div>
    </form>
  );
}

function PasswordForm({ userId }: { userId: string }) {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (newPassword !== confirmPassword) { setMsg({ ok: false, text: "New passwords don't match." }); return; }
    if (newPassword.length < 8) { setMsg({ ok: false, text: "Use at least 8 characters." }); return; }
    setBusy(true);
    try {
      await api.patch(`/users/${userId}/change-password`, { currentPassword, newPassword, confirmPassword });
      setCurrent(""); setNew(""); setConfirm("");
      setMsg({ ok: true, text: "Password changed." });
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) });
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
      {msg && <div className="mt-3"><Alert variant={msg.ok ? "success" : "error"}>{msg.text}</Alert></div>}
      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Current password</label>
          <input type="password" autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">New password</label>
            <input type="password" autoComplete="new-password" required value={newPassword} onChange={(e) => setNew(e.target.value)} placeholder="Min. 8 characters" className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Confirm new password</label>
            <input type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={busy} className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50">
            {busy ? <Spinner /> : <FaLock size={12} />} Update Password
          </button>
        </div>
      </div>
    </form>
  );
}

function MyTraining() {
  const { data, loading, error, reload } = useApi<Paginated<MyCourse>>("/enrollments/my-courses", { perPage: 50 });
  const rows = data?.data ?? [];
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-900">My Training</h2>
        <p className="text-xs text-gray-400">Your own course enrollments, if any. View-only for Super Admins.</p>
      </div>
      {loading ? <LoadingBlock /> : error ? <ErrorBlock message={error} onRetry={reload} /> : rows.length === 0 ? (
        <EmptyBlock label="You aren't enrolled in any courses." />
      ) : (
        <ul className="divide-y divide-gray-50">
          {rows.map((c) => (
            <li key={c.enrollmentId} className="flex items-center gap-4 px-6 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">{c.title}</p>
                <p className="text-xs text-gray-400">{c.category || "—"}</p>
              </div>
              <Badge variant={c.status === "completed" ? "success" : c.status === "inProgress" ? "info" : "neutral"}>{titleCase(c.status.replace(/([A-Z])/g, " $1"))}</Badge>
              <div className="w-32"><ProgressBar value={c.progress} trailing={`${c.progress}%`} /></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useApi<ApiResponse<User>>("/users/profile");
  const me = data?.data;

  const logout = () => { clearSession(); navigate("/login", { replace: true }); };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        subtitle="Your account details and security."
        actions={<DangerButton onClick={logout}><FaSignOutAlt size={13} /> Sign Out</DangerButton>}
      />

      {loading ? <LoadingBlock /> : error || !me ? (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm"><ErrorBlock message={error ?? "Couldn't load your profile."} onRetry={reload} /></div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-fit rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {me.avatarUrl ? (
                <img src={me.avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className={`flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white ${avatarColor(me.name)}`}>{initials(me.name)}</div>
              )}
              <p className="mt-4 text-lg font-bold text-gray-900">{me.name}</p>
              <p className="text-sm text-gray-400">{me.email}</p>
              <div className="mt-2 flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                <FaShieldAlt size={10} /> Super Admin
              </div>
            </div>
            <div className="mt-6 space-y-2.5 border-t border-gray-100 pt-5">
              {[
                { label: "Member since", value: formatDate(me.createdAt) },
                { label: "Last login", value: formatDateTime(me.lastLoginAt) },
                { label: "Account", value: me.isActive ? "Active" : "Inactive" },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{r.label}</span>
                  <span className="text-xs font-medium text-gray-700">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <ProfileForm key={me.updatedAt} me={me} onSaved={reload} />
            <PasswordForm userId={me._id} />
            <MyTraining />
          </div>
        </div>
      )}
    </div>
  );
}
