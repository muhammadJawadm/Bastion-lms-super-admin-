import { useState } from "react";
import { api, errorMessage } from "../../lib/api";
import type { ApiResponse, Company, SessionUser } from "../../lib/types";
import { Modal, FieldLabel, FieldInput, ModalBtn } from "../ui/Modal";
import { Alert, Spinner } from "../ui/States";
import { generateTempPassword, INDUSTRIES } from "../../lib/format";

const PROFILE_KEYS = ["name", "industry", "contactName", "contactEmail", "contactPhone", "city", "state"] as const;
type ProfileKey = (typeof PROFILE_KEYS)[number];
type ProfileFields = Record<ProfileKey, string>;

const EMPTY_PROFILE: ProfileFields = { name: "", industry: "", contactName: "", contactEmail: "", contactPhone: "", city: "", state: "" };

function trimmed(p: Partial<ProfileFields>) {
  const out: Partial<ProfileFields> = {};
  (Object.keys(p) as ProfileKey[]).forEach((k) => {
    const v = p[k]?.trim();
    if (v) out[k] = v;
  });
  return out;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 border-b border-gray-100 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{children}</p>;
}

function ProfileFieldsGrid({ value, onChange, hideName }: { value: ProfileFields; onChange: (k: ProfileKey, v: string) => void; hideName?: boolean }) {
  const bind = (k: ProfileKey) => ({ value: value[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(k, e.target.value) });
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {!hideName && <div><FieldLabel>Company name</FieldLabel><FieldInput required {...bind("name")} placeholder="e.g. Titan Steel Erectors" /></div>}
      <div>
        <FieldLabel>Industry</FieldLabel>
        <FieldInput list="industry-options" {...bind("industry")} placeholder="Pick or type…" />
        <datalist id="industry-options">{INDUSTRIES.map((i) => <option key={i} value={i} />)}</datalist>
      </div>
      <div><FieldLabel>Primary contact name</FieldLabel><FieldInput {...bind("contactName")} /></div>
      <div><FieldLabel>Contact email</FieldLabel><FieldInput type="email" {...bind("contactEmail")} /></div>
      <div><FieldLabel>Contact phone</FieldLabel><FieldInput {...bind("contactPhone")} /></div>
      <div><FieldLabel>City</FieldLabel><FieldInput {...bind("city")} /></div>
      <div><FieldLabel>State</FieldLabel><FieldInput {...bind("state")} /></div>
    </div>
  );
}

/* ── Create ──────────────────────────────────────────────────────────── */

type Mode = "with-admin" | "shell";

export function CreateCompanyModal({ isOpen, onClose, onCreated }: {
  isOpen: boolean;
  onClose: () => void;
  // notice: a non-fatal problem to surface on the next screen (company exists, a follow-up step failed).
  onCreated: (companyId: string, notice?: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("with-admin");
  const [profile, setProfile] = useState<ProfileFields>(EMPTY_PROFILE);
  const [admin, setAdmin] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setProfile(EMPTY_PROFILE);
    setAdmin({ name: "", email: "", password: "" });
    setError(null);
    setMode("with-admin");
  };
  const close = () => { if (!busy) { reset(); onClose(); } };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    let notice: string | undefined;
    try {
      let companyId: string;
      if (mode === "shell") {
        // POST /company — bare company shell, no admin yet.
        const res = await api.post<ApiResponse<Company>>("/company", trimmed(profile));
        companyId = res.data._id;
      } else {
        // POST /users/company-admins — creates the company + its first Company Admin.
        // It only accepts companyName, so the remaining profile fields follow via PATCH.
        const res = await api.post<ApiResponse<SessionUser>>("/users/company-admins", {
          name: admin.name.trim(),
          email: admin.email.trim(),
          password: admin.password,
          companyName: profile.name.trim(),
        });
        companyId = String(res.data.companyId);
        const extra = trimmed(profile);
        delete extra.name;
        if (Object.keys(extra).length > 0) {
          try {
            await api.patch(`/company/${companyId}`, extra);
          } catch (err) {
            // The company exists at this point — don't lose it over the follow-up edit.
            notice = `Company created, but saving its profile details failed: ${errorMessage(err)}. Use Edit to add them.`;
          }
        }
      }
      setBusy(false);
      reset();
      onClose();
      onCreated(companyId, notice);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Add Company"
      size="lg"
      footer={
        <>
          <ModalBtn variant="secondary" type="button" onClick={close} disabled={busy}>Cancel</ModalBtn>
          <ModalBtn variant="primary" type="submit" form="create-company-form" disabled={busy} className="flex items-center gap-2 disabled:opacity-50">
            {busy && <Spinner />} Create Company
          </ModalBtn>
        </>
      }
    >
      <form id="create-company-form" onSubmit={submit} className="space-y-6">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {([
            ["with-admin", "Company + first admin", "Creates the company and emails login details to its Company Admin."],
            ["shell", "Company only", "A bare company record — add its admin later from the company page."],
          ] as const).map(([key, label, desc]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={`rounded-xl border p-3 text-left transition-colors ${mode === key ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-100" : "border-gray-200 hover:bg-gray-50"}`}
            >
              <p className="text-sm font-semibold text-gray-900">{label}</p>
              <p className="mt-0.5 text-xs text-gray-500">{desc}</p>
            </button>
          ))}
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <div>
          <SectionHeading>Company</SectionHeading>
          <ProfileFieldsGrid value={profile} onChange={(k, v) => setProfile((p) => ({ ...p, [k]: v }))} />
        </div>

        {mode === "with-admin" && (
          <div>
            <SectionHeading>First Company Admin</SectionHeading>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><FieldLabel>Full name</FieldLabel><FieldInput required value={admin.name} onChange={(e) => setAdmin((a) => ({ ...a, name: e.target.value }))} /></div>
              <div><FieldLabel>Email</FieldLabel><FieldInput required type="email" value={admin.email} onChange={(e) => setAdmin((a) => ({ ...a, email: e.target.value }))} /></div>
              <div className="sm:col-span-2">
                <FieldLabel>Temporary password</FieldLabel>
                <div className="flex gap-2">
                  <FieldInput required minLength={8} value={admin.password} onChange={(e) => setAdmin((a) => ({ ...a, password: e.target.value }))} />
                  <ModalBtn type="button" variant="secondary" onClick={() => setAdmin((a) => ({ ...a, password: generateTempPassword() }))}>Generate</ModalBtn>
                </div>
                <p className="mt-1.5 text-xs text-gray-400">Emailed to the admin, who must change it on first login.</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}

/* ── Edit ────────────────────────────────────────────────────────────── */

export function EditCompanyModal({ company, isOpen, onClose, onSaved }: { company: Company; isOpen: boolean; onClose: () => void; onSaved: () => void }) {
  const initial = (): ProfileFields => {
    const p = { ...EMPTY_PROFILE };
    PROFILE_KEYS.forEach((k) => { p[k] = company[k] ?? ""; });
    return p;
  };
  const [profile, setProfile] = useState<ProfileFields>(initial);
  const [paymentMethods, setPaymentMethods] = useState(company.paymentMethods ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openedFor, setOpenedFor] = useState<Company | null>(null);

  // Re-seed the form each time it's opened against fresh company data.
  if (isOpen && openedFor !== company) {
    setOpenedFor(company);
    setProfile(initial());
    setPaymentMethods(company.paymentMethods ?? "");
    setError(null);
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // PATCH /company/:id treats "" as a real value, so send every field — that lets an admin clear one.
      const body: Record<string, string> = { paymentMethods: paymentMethods.trim() };
      PROFILE_KEYS.forEach((k) => { body[k] = profile[k].trim(); });
      if (!body.name) throw new Error("Company name is required.");
      await api.patch(`/company/${company._id}`, body);
      setBusy(false);
      onClose();
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { if (!busy) onClose(); }}
      title="Edit Company"
      size="lg"
      footer={
        <>
          <ModalBtn variant="secondary" type="button" onClick={onClose} disabled={busy}>Cancel</ModalBtn>
          <ModalBtn variant="primary" type="submit" form="edit-company-form" disabled={busy} className="flex items-center gap-2 disabled:opacity-50">
            {busy && <Spinner />} Save Changes
          </ModalBtn>
        </>
      }
    >
      <form id="edit-company-form" onSubmit={submit} className="space-y-6">
        {error && <Alert variant="error">{error}</Alert>}
        <div>
          <SectionHeading>Company</SectionHeading>
          <ProfileFieldsGrid value={profile} onChange={(k, v) => setProfile((p) => ({ ...p, [k]: v }))} />
        </div>
        <div>
          <SectionHeading>Billing</SectionHeading>
          <FieldLabel>Payment method</FieldLabel>
          <FieldInput value={paymentMethods} onChange={(e) => setPaymentMethods(e.target.value)} placeholder="e.g. card_on_file, invoice, ACH" />
          <p className="mt-1.5 text-xs text-gray-400">
            Free-text note only. Never enter card or bank numbers here; the API stores this as plain text.
          </p>
        </div>
      </form>
    </Modal>
  );
}
