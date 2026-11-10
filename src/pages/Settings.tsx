import { useState } from "react";
import { FaSave, FaCheckCircle } from "react-icons/fa";
import { Tabs } from "../components/ui/Tabs";
import { Alert } from "../components/ui/States";
import { SuperAdminsPanel } from "../components/settings/SuperAdminsPanel";

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function Settings() {
  const [tab, setTab] = useState("super-admins");

  // General is still mock — the backend has no platform-settings API yet.
  const [defaultLanguage, setDefaultLanguage] = useState("English");
  const [defaultExpiry, setDefaultExpiry]     = useState("12 months");
  const [notifyEmail, setNotifyEmail]         = useState("admin@bastionlms.com");

  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Super Admin accounts and platform-wide defaults.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <FaCheckCircle size={14} /> Settings saved successfully.
        </div>
      )}

      <Tabs
        tabs={[
          { key: "super-admins", label: "Super Admins" },
          { key: "general",      label: "General" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "super-admins" && <SuperAdminsPanel />}

      {tab === "general" && (
        <>
          <Alert variant="warning">
            <span className="font-semibold">Preview, mock data.</span> The backend has no API for this tab yet, so changes here aren't saved.
          </Alert>

          <div className="max-w-3xl rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Default Course &amp; Template Settings</h2>
            <p className="mt-0.5 text-xs text-gray-400">Applied to every new course and template unless overridden.</p>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Default Certificate Expiry</label>
                <select value={defaultExpiry} onChange={(e) => setDefaultExpiry(e.target.value)} className={inputClass}>
                  {["12 months", "24 months", "36 months", "Never"].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Default Language</label>
                <select value={defaultLanguage} onChange={(e) => setDefaultLanguage(e.target.value)} className={inputClass}>
                  {["English", "Spanish", "Bilingual (English + Spanish)"].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Admin Notification Email</label>
                <input type="email" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="flex max-w-3xl justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <FaSave size={13} /> Save Changes
            </button>
          </div>
        </>
      )}
    </div>
  );
}
