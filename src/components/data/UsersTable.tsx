import { useState } from "react";
import { Link } from "react-router";
import { FaTrash, FaPlus } from "react-icons/fa";
import { api } from "../../lib/api";
import { useApi, useDebounced } from "../../lib/useApi";
import { formatDate, formatDateTime, initials, avatarColor, ROLE_LABEL } from "../../lib/format";
import { getSessionUser } from "../../lib/session";
import type { ApiResponse, User } from "../../lib/types";
import { Badge } from "../ui/Badge";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../ui/States";
import { SearchInput, FilterSelect, TableCard, Th, Td, IconButton, PrimaryButton } from "../ui/PageHeader";
import { AddUserModal } from "./AddUserModal";

function roleBadge(role: User["role"]): "purple" | "info" | "neutral" {
  if (role === "platform_admin") return "purple";
  if (role === "client_admin") return "info";
  return "neutral";
}

interface UsersTableProps {
  companyId?: string;
  companyNames?: Record<string, string>;
  defaultRole?: string;
}

export function UsersTable({ companyId, companyNames = {}, defaultRole = "" }: UsersTableProps) {
  const me = getSessionUser();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(defaultRole);
  const [addOpen, setAddOpen] = useState(false);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const q = useDebounced(search);

  const { data, loading, error, reload } = useApi<ApiResponse<User[]>>("/admin/users", { search: q, role, companyId });
  const users = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email…" />
        <FilterSelect
          value={role}
          onChange={setRole}
          options={[
            { value: "", label: "All roles" },
            { value: "client_admin", label: "Company Admins" },
            { value: "user", label: "Employees" },
            ...(companyId ? [] : [{ value: "platform_admin", label: "Super Admins" }]),
          ]}
        />
        <PrimaryButton onClick={() => setAddOpen(true)}><FaPlus size={11} /> Add User</PrimaryButton>
      </div>

      <TableCard footer={!loading && !error ? `${users.length} user${users.length === 1 ? "" : "s"}` : undefined}>
        {loading ? <LoadingBlock /> : error ? <ErrorBlock message={error} onRetry={reload} /> : users.length === 0 ? (
          <EmptyBlock label="No users match these filters." />
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50/70">
              <tr>
                <Th>User</Th>
                <Th>Role</Th>
                {!companyId && <Th>Company</Th>}
                <Th>Department</Th>
                <Th>Status</Th>
                <Th>Last login</Th>
                <Th>Created</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => {
                const isMe = me?._id === u._id;
                return (
                  <tr key={u._id} className="hover:bg-gray-50/60">
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(u.name)}`}>
                          {initials(u.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{u.name}{isMe && <span className="ml-1.5 text-xs text-gray-400">(you)</span>}</p>
                          <p className="truncate text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td><Badge variant={roleBadge(u.role)}>{ROLE_LABEL[u.role]}</Badge></Td>
                    {!companyId && (
                      <Td>
                        {u.companyId ? (
                          <Link to={`/companies/${u.companyId}`} className="text-blue-600 hover:underline">
                            {companyNames[u.companyId] ?? "Unknown company"}
                          </Link>
                        ) : <span className="text-gray-400">—</span>}
                      </Td>
                    )}
                    <Td className="text-gray-500">{[u.jobTitle, u.department].filter(Boolean).join(" · ") || "—"}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={u.isActive ? "success" : "danger"}>{u.isActive ? "Active" : "Inactive"}</Badge>
                        {u.mustChangePassword && <Badge variant="warning">Temp password</Badge>}
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap text-gray-500">{formatDateTime(u.lastLoginAt)}</Td>
                    <Td className="whitespace-nowrap text-gray-500">{formatDate(u.createdAt)}</Td>
                    <Td>
                      {!isMe && (
                        <IconButton danger title="Delete user" onClick={() => setToDelete(u)}><FaTrash size={11} /></IconButton>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </TableCard>

      <AddUserModal isOpen={addOpen} onClose={() => setAddOpen(false)} companyId={companyId} onCreated={reload} />

      <ConfirmDialog
        isOpen={toDelete !== null}
        onClose={() => setToDelete(null)}
        title="Delete user"
        requireText={toDelete?.role === "platform_admin" ? toDelete.email : undefined}
        message={
          <>
            <p>Permanently delete <span className="font-semibold text-gray-800">{toDelete?.name}</span> ({toDelete?.email})?</p>
            <p className="mt-2 text-xs text-gray-500">
              Their enrollments and certificates are <span className="font-semibold">not</span> removed by the API and will remain as orphaned records.
              {toDelete?.role === "platform_admin" && " This is another Super Admin account."}
            </p>
          </>
        }
        onConfirm={() => api.del(`/users/${toDelete!._id}`)}
        onDone={reload}
      />
    </div>
  );
}
