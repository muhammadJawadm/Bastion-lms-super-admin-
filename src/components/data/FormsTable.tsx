import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { FaTrash, FaClipboardList } from "react-icons/fa";
import { api } from "../../lib/api";
import { useApi, useDebounced } from "../../lib/useApi";
import type { ApiResponse, Form } from "../../lib/types";
import { Badge } from "../ui/Badge";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../ui/States";
import { SearchInput, FilterSelect, TableCard, Th, Td, IconButton } from "../ui/PageHeader";

interface FormsTableProps {
  companyId?: string;
  companyNames?: Record<string, string>;
}

export function FormsTable({ companyId, companyNames = {} }: FormsTableProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [toDelete, setToDelete] = useState<Form | null>(null);
  const q = useDebounced(search);

  // GET /forms (not /admin/forms) — same filters, but also returns the owner's name/email.
  const { data, loading, error, reload } = useApi<ApiResponse<Form[]>>("/forms", { search: q, status, companyId });
  const forms = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search form title…" />
        <FilterSelect
          value={status}
          onChange={setStatus}
          options={[
            { value: "", label: "All statuses" },
            { value: "published", label: "Published" },
            { value: "draft", label: "Draft" },
          ]}
        />
      </div>

      <TableCard footer={!loading && !error ? `${forms.length} form${forms.length === 1 ? "" : "s"}` : undefined}>
        {loading ? <LoadingBlock /> : error ? <ErrorBlock message={error} onRetry={reload} /> : forms.length === 0 ? (
          <EmptyBlock label="No forms match these filters." />
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50/70">
              <tr>
                <Th>Form</Th>
                {!companyId && <Th>Company</Th>}
                <Th>Status</Th>
                <Th>Pages</Th>
                <Th>Owner</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {forms.map((f) => (
                <tr key={f._id} onClick={() => navigate(`/forms/${f._id}`)} className="cursor-pointer hover:bg-gray-50/60">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><FaClipboardList size={13} /></div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">{f.title}</p>
                        {f.description && <p className="max-w-xs truncate text-xs text-gray-400">{f.description}</p>}
                      </div>
                    </div>
                  </Td>
                  {!companyId && (
                    <Td>
                      {f.companyId ? (
                        <Link to={`/companies/${f.companyId}`} onClick={(e) => e.stopPropagation()} className="text-blue-600 hover:underline">
                          {companyNames[f.companyId] ?? "Unknown company"}
                        </Link>
                      ) : <span className="text-gray-400">—</span>}
                    </Td>
                  )}
                  <Td><Badge variant={f.status === "published" ? "success" : "neutral"}>{f.status}</Badge></Td>
                  <Td>{f.pages?.length ?? 0}</Td>
                  <Td className="text-gray-500">{f.ownerName ?? "—"}</Td>
                  <Td>
                    <IconButton danger title="Delete form" onClick={(e) => { e.stopPropagation(); setToDelete(f); }}>
                      <FaTrash size={11} />
                    </IconButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>

      <ConfirmDialog
        isOpen={toDelete !== null}
        onClose={() => setToDelete(null)}
        title="Delete form"
        message={
          <>
            <p>Delete <span className="font-semibold text-gray-800">{toDelete?.title}</span>?</p>
            <p className="mt-2 text-xs text-gray-500">Every submitted response to this form is deleted too. This can't be undone.</p>
          </>
        }
        onConfirm={() => api.del(`/forms/${toDelete!._id}`)}
        onDone={reload}
      />
    </div>
  );
}
