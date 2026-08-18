import { useState } from "react";
import { FaSave, FaLock, FaCheckCircle, FaShieldAlt,  FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router";

const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-orange-500",
  "bg-pink-500", "bg-cyan-500", "bg-rose-500", "bg-indigo-500",
];
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const initials = (name: string) => {
  const p = name.trim().split(" ");
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase();
};

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed";

export default function Profile() {
  const navigate  = useNavigate();
  const [name, setName]           = useState("Super Admin");
  const [email, setEmail]         = useState("admin@bastionlms.com");
  const [phone, setPhone]         = useState("+61 412 345 678");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd]         = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [pwdSaved, setPwdSaved]     = useState(false);

  const saveProfile = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const changePwd = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSaved(true);
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    setTimeout(() => setPwdSaved(false), 3000);
  };

  const logout = () => navigate("/login");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your account info and security settings.</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
        >
          <FaSignOutAlt size={13} /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left — profile card */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white ${avatarColor(name)}`}
            >
              {initials(name)}
            </div>
            <p className="mt-4 text-lg font-bold text-gray-900">{name}</p>
            <p className="text-sm text-gray-400">{email}</p>
            <div className="mt-2 flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <FaShieldAlt size={10} /> Super Admin
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-gray-100 pt-5 text-center">
            {[
              { label: "Companies",   value: "10"    },
              { label: "Users",       value: "1,030" },
              { label: "Compliance",  value: "87%"   },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2.5 border-t border-gray-100 pt-5 text-sm">
            {[
              { label: "Member since", value: "1 Jan 2024"     },
              { label: "Last login",   value: "Just now"        },
              { label: "2FA",          value: "Enabled ✓"       },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{r.label}</span>
                <span className="text-xs font-medium text-gray-700">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — forms */}
        <div className="space-y-6 lg:col-span-2">
          {/* Personal info */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Personal Information</h2>
            {profileSaved && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                <FaCheckCircle size={13} /> Profile updated successfully.
              </div>
            )}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Role</label>
                <input value="Super Admin" disabled className={inputClass} />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={saveProfile}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <FaSave size={13} /> Save Changes
              </button>
            </div>
          </div>

          {/* Change password */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
            {pwdSaved && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                <FaCheckCircle size={13} /> Password changed successfully.
              </div>
            )}
            <form onSubmit={changePwd} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Current Password</label>
                <input
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">New Password</label>
                  <input
                    type="password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    required
                    placeholder="Min. 8 characters"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
                >
                  <FaLock size={12} /> Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Recent sessions */}
          {/* <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Active Sessions</h2>
            <div className="mt-4 space-y-3">
              {sessions.map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FaClock size={13} className="shrink-0 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{s.device}</p>
                      <p className="text-xs text-gray-400">IP: {s.ip} · {s.time}</p>
                    </div>
                  </div>
                  {s.current ? (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Current</span>
                  ) : (
                    <button className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors">Revoke</button>
                  )}
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
