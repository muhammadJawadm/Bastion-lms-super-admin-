import { useState } from "react";
import { api, errorMessage } from "../../lib/api";
import { useCompanyNames } from "../../lib/useApi";
import { generateTempPassword } from "../../lib/format";
import { Modal, FieldLabel, FieldInput, FieldSelect, ModalBtn } from "../ui/Modal";
import { Alert, Spinner } from "../ui/States";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Fixed company (inside Company Detail); otherwise the admin picks one.
  companyId?: string;
  onCreated: () => void;
}

const EMPTY = { name: "", email: "", password: "", role: "user", department: "", jobTitle: "", companyId: "" };

export function AddUserModal({ isOpen, onClose, companyId, onCreated }: AddUserModalProps) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { companies } = useCompanyNames();

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const close = () => {
    if (busy) return;
    setForm(EMPTY);
    setError(null);
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post("/users", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        // A Super Admin has no company of its own, so companyId is always explicit.
        companyId: companyId ?? form.companyId,
        department: form.department.trim() || undefined,
        jobTitle: form.jobTitle.trim() || undefined,
      });
      setBusy(false);
      setForm(EMPTY);
      onClose();
      onCreated();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Add User"
      footer={
        <>
          <ModalBtn variant="secondary" type="button" onClick={close} disabled={busy}>Cancel</ModalBtn>
          <ModalBtn variant="primary" type="submit" form="add-user-form" disabled={busy} className="flex items-center gap-2 disabled:opacity-50">
            {busy && <Spinner />} Create User
          </ModalBtn>
        </>
      }
    >
      <form id="add-user-form" onSubmit={submit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><FieldLabel>Full name</FieldLabel><FieldInput required value={form.name} onChange={set("name")} /></div>
          <div><FieldLabel>Email</FieldLabel><FieldInput required type="email" value={form.email} onChange={set("email")} /></div>
          <div>
            <FieldLabel>Role</FieldLabel>
            <FieldSelect value={form.role} onChange={set("role")}>
              <option value="user">Employee</option>
              <option value="client_admin">Company Admin</option>
            </FieldSelect>
          </div>
          {!companyId && (
            <div>
              <FieldLabel>Company</FieldLabel>
              <FieldSelect required value={form.companyId} onChange={set("companyId")}>
                <option value="" disabled>Select a company…</option>
                {companies.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </FieldSelect>
            </div>
          )}
          <div><FieldLabel>Job title</FieldLabel><FieldInput value={form.jobTitle} onChange={set("jobTitle")} /></div>
          <div><FieldLabel>Department</FieldLabel><FieldInput value={form.department} onChange={set("department")} /></div>
          <div className="sm:col-span-2">
            <FieldLabel>Temporary password</FieldLabel>
            <div className="flex gap-2">
              <FieldInput required minLength={8} value={form.password} onChange={set("password")} />
              <ModalBtn type="button" variant="secondary" onClick={() => setForm((f) => ({ ...f, password: generateTempPassword() }))}>
                Generate
              </ModalBtn>
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              Emailed to the user, who must change it on first login.
            </p>
          </div>
        </div>
      </form>
    </Modal>
  );
}
