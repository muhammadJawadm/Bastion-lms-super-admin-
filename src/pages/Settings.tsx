import { useState } from "react";
import { FaSave, FaCheckCircle, FaPlus, FaTrash } from "react-icons/fa";
import { Tabs } from "../components/ui/Tabs";
import { Toggle } from "../components/ui/Toggle";
import { FieldLabel, FieldInput, FieldSelect, FieldTextarea } from "../components/ui/Modal";

const PERMISSION_SETS = [
  { name: "Content Team",   perms: "Create/edit courses & templates — no billing, no delete" },
  { name: "Support Staff",  perms: "View records, reset passwords — no billing, no publishing" },
  { name: "Finance",        perms: "Billing & invoices only" },
];

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function Settings() {
  const [tab, setTab] = useState("general");

  const [defaultLanguage, setDefaultLanguage] = useState("English");
  const [defaultExpiry, setDefaultExpiry]     = useState("12 months");
  const [notifyEmail, setNotifyEmail]         = useState("admin@bastionlms.com");
  const [brandColor, setBrandColor]           = useState("#0047AB");

  const [require2fa, setRequire2fa]           = useState(true);
  const [passwordMinLength, setPasswordMinLength] = useState("10");
  const [sessionTimeout, setSessionTimeout]   = useState("30");

  const [retentionYears, setRetentionYears]   = useState("7");
  const [autoDeleteMedia, setAutoDeleteMedia] = useState(false);

  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Platform-wide configuration, security rules, and internal staff permissions.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <FaCheckCircle size={14} /> Settings saved successfully.
        </div>
      )}

      <Tabs
        tabs={[
          { key: "general",   label: "General & Branding" },
          { key: "security",  label: "Security" },
          { key: "permissions", label: "Permission Sets" },
          { key: "retention", label: "Data Retention" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "general" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
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

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">Default Branding</h2>
              <p className="mt-0.5 text-xs text-gray-400">Used for any client without their own white-label branding.</p>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <FieldLabel>Primary Color</FieldLabel>
                  <div className="flex items-center gap-2.5">
                    <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-gray-200" />
                    <FieldInput value={brandColor} onChange={(e) => setBrandColor(e.target.value)} />
                  </div>
                </div>
                <div><FieldLabel>Default Sender Email</FieldLabel><FieldInput defaultValue="no-reply@bastionlms.com" /></div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">Active Configuration</h2>
              <div className="mt-4 space-y-3 divide-y divide-gray-100">
                {[
                  { label: "Default expiry", value: defaultExpiry },
                  { label: "Default language", value: defaultLanguage },
                  { label: "Notification email", value: notifyEmail },
                  { label: "Brand color", value: brandColor },
                ].map((c) => (
                  <div key={c.label} className="flex items-start justify-between gap-2 pt-3 first:pt-0">
                    <span className="text-xs text-gray-500">{c.label}</span>
                    <span className="text-right text-xs font-semibold text-gray-900 break-all">{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "security" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-gray-900">Password &amp; Session Policy</h2>
            <div>
              <FieldLabel>Minimum Password Length</FieldLabel>
              <FieldInput type="number" value={passwordMinLength} onChange={(e) => setPasswordMinLength(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Session Timeout (minutes)</FieldLabel>
              <FieldInput type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} />
            </div>
            <Toggle checked={require2fa} onChange={setRequire2fa} label="Require 2FA for all Super Admin accounts" sublabel="Non-negotiable per platform policy" />
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50 p-6">
            <h2 className="text-base font-semibold text-red-800">Non-Negotiables</h2>
            <ul className="mt-3 space-y-2 text-sm text-red-700">
              <li>• Two-factor authentication is required on all Super Admin accounts.</li>
              <li>• Audit logs cannot be edited or deleted by anyone, including Super Admins.</li>
              <li>• No client can ever see another client's data.</li>
              <li>• Submitted forms cannot be silently edited — every amendment is logged.</li>
            </ul>
          </div>
        </div>
      )}

      {tab === "permissions" && (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Internal Permission Sets</h2>
          <p className="mt-0.5 text-xs text-gray-400">Custom roles for Bastion staff — scope what each internal user can touch.</p>
          <div className="mt-4 space-y-2">
            {PERMISSION_SETS.map((p) => (
              <div key={p.name} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.perms}</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium">
                  <button className="text-gray-400 hover:text-gray-700 transition-colors">Edit</button>
                  <button className="text-gray-300 hover:text-red-500 transition-colors"><FaTrash size={11} /></button>
                </div>
              </div>
            ))}
            <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-200 py-2 text-xs text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
              <FaPlus size={10} /> Add Permission Set
            </button>
          </div>
        </div>
      )}

      {tab === "retention" && (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-base font-semibold text-gray-900">Data Retention Rules</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel>Submitted Form &amp; Training Record Retention</FieldLabel>
              <FieldSelect value={retentionYears} onChange={(e) => setRetentionYears(e.target.value)}>
                {["3", "5", "7", "10", "Indefinite"].map((y) => <option key={y} value={y}>{y === "Indefinite" ? "Indefinite" : `${y} years`}</option>)}
              </FieldSelect>
            </div>
            <div className="flex items-end">
              <Toggle checked={autoDeleteMedia} onChange={setAutoDeleteMedia} label="Auto-purge photo/video media after retention period" />
            </div>
          </div>
          <div>
            <FieldLabel>Retention Policy Notes (internal)</FieldLabel>
            <FieldTextarea rows={3} placeholder="Notes on retention exceptions, legal holds, etc." />
          </div>
        </div>
      )}

      <div className="flex justify-end border-t border-gray-100 pt-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <FaSave size={13} /> Save Changes
        </button>
      </div>
    </div>
  );
}
