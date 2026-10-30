import { useState } from "react";
import { Link } from "react-router";
import { FaTrash, FaFilePdf } from "react-icons/fa";
import { api } from "../../lib/api";
import { useApi, useDebounced } from "../../lib/useApi";
import { formatDate } from "../../lib/format";
import type { ApiResponse, Certificate, User } from "../../lib/types";
import { Badge } from "../ui/Badge";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../ui/States";
import { SearchInput, TableCard, Th, Td, IconButton } from "../ui/PageHeader";

interface CertificatesTableProps {
  companyId?: string;
  companyNames?: Record<string, string>;
}

export function CertificatesTable({ companyId, companyNames = {} }: CertificatesTableProps) {
  const [search, setSearch] = useState("");
  const [toRevoke, setToRevoke] = useState<Certificate | null>(null);
  const q = useDebounced(search).toLowerCase();

  const { data, loading, error, reload } = useApi<ApiResponse<Certificate[]>>("/certificates", { companyId });
  // Certificates only carry userId — resolve names from the user list.
  const { data: usersRes } = useApi<ApiResponse<User[]>>("/admin/users", { companyId });
  const userById: Record<string, User> = {};
  (usersRes?.data ?? []).forEach((u) => { userById[u._id] = u; });

  const [now] = useState(() => Date.now());
  const certs = (data?.data ?? []).filter((c) => {
    if (!q) return true;
    const u = userById[c.userId];
    return [c.certificateTitle, c.certificateNumber, u?.name, u?.email].some((v) => v?.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search title, number or learner…" />
      </div>

      <TableCard footer={!loading && !error ? `${certs.length} certificate${certs.length === 1 ? "" : "s"}` : undefined}>
        {loading ? <LoadingBlock /> : error ? <ErrorBlock message={error} onRetry={reload} /> : certs.length === 0 ? (
          <EmptyBlock label="No certificates issued yet." />
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50/70">
              <tr>
                <Th>Certificate</Th>
                <Th>Learner</Th>
                {!companyId && <Th>Company</Th>}
                <Th>Score</Th>
                <Th>Issued</Th>
                <Th>Expires</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {certs.map((c) => {
                const u = userById[c.userId];
                const expired = c.expiresAt ? new Date(c.expiresAt).getTime() < now : false;
                return (
                  <tr key={c._id} className="hover:bg-gray-50/60">
                    <Td>
                      <p className="font-medium text-gray-900">{c.certificateTitle}</p>
                      <p className="font-mono text-xs text-gray-400">{c.certificateNumber}</p>
                    </Td>
                    <Td>
                      <p className="text-gray-800">{u?.name ?? <span className="text-gray-400">Unknown user</span>}</p>
                      <p className="text-xs text-gray-400">{u?.email ?? ""}</p>
                    </Td>
                    {!companyId && (
                      <Td>
                        <Link to={`/companies/${c.companyId}`} className="text-blue-600 hover:underline">
                          {companyNames[c.companyId] ?? "Unknown company"}
                        </Link>
                      </Td>
                    )}
                    <Td>{c.score}</Td>
                    <Td className="whitespace-nowrap text-gray-500">{formatDate(c.issuedAt)}</Td>
                    <Td className="whitespace-nowrap">
                      {c.expiresAt ? (
                        expired ? <Badge variant="danger">Expired {formatDate(c.expiresAt)}</Badge> : <span className="text-gray-500">{formatDate(c.expiresAt)}</span>
                      ) : <span className="text-gray-400">Never</span>}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        {c.pdfUrl && (
                          <a href={c.pdfUrl} target="_blank" rel="noreferrer" title="Open PDF" className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                            <FaFilePdf size={12} />
                          </a>
                        )}
                        <IconButton danger title="Revoke certificate" onClick={() => setToRevoke(c)}><FaTrash size={11} /></IconButton>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </TableCard>

      <ConfirmDialog
        isOpen={toRevoke !== null}
        onClose={() => setToRevoke(null)}
        title="Revoke certificate"
        confirmLabel="Revoke"
        message={<p>Revoke <span className="font-semibold text-gray-800">{toRevoke?.certificateTitle}</span> ({toRevoke?.certificateNumber})? The record is deleted permanently.</p>}
        onConfirm={() => api.del(`/certificates/${toRevoke!._id}`)}
        onDone={reload}
      />
    </div>
  );
}
