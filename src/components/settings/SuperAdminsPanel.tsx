import { useState } from "react";
import { FaPlus, FaTrash, FaShieldAlt } from "react-icons/fa";
import { api, ApiError, errorMessage } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import { avatarColor, formatDate, formatDateTime, generateTempPassword, initials } from "../../lib/format";
import { getSessionUser } from "../../lib/session";
import type { ApiResponse, User } from "../../lib/types";
import { Badge } from "../ui/Badge";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { Modal, FieldLabel, FieldInput, ModalBtn } from "../ui/Modal";
import { Alert, LoadingBlock, ErrorBlock, EmptyBlock, Spinner } from "../ui/States";
import { TableCard, Th, Td, IconButton, PrimaryButton } from "../ui/PageHeader";

// Not in the backend yet — POST /users only accepts user/client_admin.
// Expected body: { name, email, password } → creates role "platform_admin", is_verified: true.
const CREATE_ENDPOINT = "/users/super-admins";

const EMPTY = { name: "", email: "", password: "" };

function AddSuperAdminModal({ isOpen, onClose, onCreated }: { isOpen: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await api.post(CREATE_ENDPOINT, { name: form.name.trim(), email: form.email.trim(), password: form.password });
      setBusy(false);
      setForm(EMPTY);
      onClose();
      onCreated();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 404
          ? `The backend doesn't have POST ${CREATE_ENDPOINT} yet, so Super Admins can't be created from here until it's added.`
          : errorMessage(err),
      );
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Add Super Admin"
      footer={
        <>
          <ModalBtn variant="secondary" type="button" onClick={close} disabled={busy}>Cancel</ModalBtn>
          <ModalBtn variant="primary" type="submit" form="add-super-admin-form" disabled={busy} className="flex items-center gap-2 disabled:opacity-50">
            {busy && <Spinner />} Create Super Admin
          </ModalBtn>
        </>
      }
    >
      <form id="add-super-admin-form" onSubmit={submit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        <Alert variant="warning">
          Super Admins have full access to every company on the platform, including deleting companies and users.
        </Alert>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><FieldLabel>Full name</FieldLabel><FieldInput required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div><FieldLabel>Email</FieldLabel><FieldInput required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
          <div className="sm:col-span-2">
            <FieldLabel>Temporary password</FieldLabel>
            <div className="flex gap-2">
              <FieldInput required minLength={8} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
              <ModalBtn type="button" variant="secondary" onClick={() => setForm((f) => ({ ...f, password: generateTempPassword() }))}>Generate</ModalBtn>
            </div>
            <p className="mt-1.5 text-xs text-gray-400">They should change it from My Profile after first sign-in.</p>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export function SuperAdminsPanel() {
  const me = getSessionUser();
  const [addOpen, setAddOpen] = useState(false);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const { data, loading, error, reload } = useApi<ApiResponse<User[]>>("/admin/users", { role: "platform_admin" });
  const admins = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Super Admins</h2>
          <p className="mt-0.5 text-xs text-gray-400">Bastion staff with platform-wide access. Any Super Admin can add another.</p>
        </div>
        <PrimaryButton onClick={() => setAddOpen(true)}><FaPlus size={11} /> Add Super Admin</PrimaryButton>
      </div>

      <TableCard footer={!loading && !error ? `${admins.length} Super Admin${admins.length === 1 ? "" : "s"}` : undefined}>
        {loading ? <LoadingBlock /> : error ? <ErrorBlock message={error} onRetry={reload} /> : admins.length === 0 ? (
          <EmptyBlock label="No Super Admins found." />
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50/70">
              <tr><Th>Admin</Th><Th>Status</Th><Th>Last login</Th><Th>Added</Th><Th /></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((u) => {
                const isMe = me?._id === u._id;
                return (
                  <tr key={u._id} className="hover:bg-gray-50/60">
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(u.name)}`}>{initials(u.name)}</div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{u.name}{isMe && <span className="ml-1.5 text-xs text-gray-400">(you)</span>}</p>
                          <p className="truncate text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={u.isActive ? "success" : "danger"}>{u.isActive ? "Active" : "Inactive"}</Badge>
                        {u.mustChangePassword && <Badge variant="warning">Temp password</Badge>}
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap text-gray-500">{formatDateTime(u.lastLoginAt)}</Td>
                    <Td className="whitespace-nowrap text-gray-500">{formatDate(u.createdAt)}</Td>
                    <Td>
                      {isMe ? (
                        <span title="You can't remove your own account"><FaShieldAlt size={12} className="text-gray-300" /></span>
                      ) : (
                        <IconButton danger title="Remove Super Admin" onClick={() => setToDelete(u)}><FaTrash size={11} /></IconButton>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </TableCard>

      <AddSuperAdminModal isOpen={addOpen} onClose={() => setAddOpen(false)} onCreated={reload} />

      <ConfirmDialog
        isOpen={toDelete !== null}
        onClose={() => setToDelete(null)}
        title="Remove Super Admin"
        confirmLabel="Remove"
        requireText={toDelete?.email}
        message={<p>Permanently delete the Super Admin account <span className="font-semibold text-gray-800">{toDelete?.name}</span>? They lose all platform access.</p>}
        onConfirm={() => api.del(`/users/${toDelete!._id}`)}
        onDone={reload}
      />
    </div>
  );
}
