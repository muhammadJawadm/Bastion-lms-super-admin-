import { useState } from "react";
import { Link } from "react-router";
import { FaTrash } from "react-icons/fa";
import { api } from "../../lib/api";
import { useApi, useDebounced } from "../../lib/useApi";
import { formatDate, titleCase } from "../../lib/format";
import type { Enrollment, Paginated } from "../../lib/types";
import { Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../ui/States";
import { SearchInput, FilterSelect, TableCard, Th, Td, IconButton, SecondaryButton } from "../ui/PageHeader";

const PER_PAGE = 25;

function statusBadge(s: Enrollment["status"]): "success" | "info" | "danger" | "neutral" | "warning" {
  if (s === "completed") return "success";
  if (s === "in_progress") return "info";
  if (s === "overdue") return "danger";
  if (s === "waived") return "warning";
  return "neutral";
}

interface EnrollmentsTableProps {
  companyId?: string;
  companyNames?: Record<string, string>;
  courseId?: string;
}

export function EnrollmentsTable({ companyId, companyNames = {}, courseId }: EnrollmentsTableProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<Enrollment | null>(null);
  const q = useDebounced(search);

  const { data, loading, error, reload } = useApi<Paginated<Enrollment>>("/enrollments", {
    companyId, courseId, status, search: q, pageNo: page, perPage: PER_PAGE,
  });
  const rows = data?.data ?? [];
  const pg = data?.pagination;

  const onFilter = (fn: (v: string) => void) => (v: string) => { fn(v); setPage(1); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={onFilter(setSearch)} placeholder="Search learner or course…" />
        <FilterSelect
          value={status}
          onChange={onFilter(setStatus)}
          options={[
            { value: "", label: "All statuses" },
            { value: "assigned", label: "Assigned" },
            { value: "in_progress", label: "In progress" },
            { value: "completed", label: "Completed" },
            { value: "overdue", label: "Overdue" },
            { value: "waived", label: "Waived" },
          ]}
        />
      </div>

      <TableCard
        footer={pg && !loading && !error ? (
          <div className="flex items-center justify-between gap-3">
            <span>{pg.total} enrollment{pg.total === 1 ? "" : "s"} · page {pg.pageNo} of {Math.max(1, pg.totalPages)}</span>
            <div className="flex gap-2">
              <SecondaryButton className="px-3! py-1! text-xs!" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</SecondaryButton>
              <SecondaryButton className="px-3! py-1! text-xs!" disabled={page >= pg.totalPages} onClick={() => setPage((p) => p + 1)}>Next</SecondaryButton>
            </div>
          </div>
        ) : undefined}
      >
        {loading ? <LoadingBlock /> : error ? <ErrorBlock message={error} onRetry={reload} /> : rows.length === 0 ? (
          <EmptyBlock label="No enrollments found." />
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50/70">
              <tr>
                <Th>Learner</Th>
                {!courseId && <Th>Course</Th>}
                {!companyId && <Th>Company</Th>}
                <Th>Status</Th>
                <Th className="w-40">Progress</Th>
                <Th>Due</Th>
                <Th>Completed</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((e) => (
                <tr key={e._id} className="hover:bg-gray-50/60">
                  <Td>
                    <p className="font-medium text-gray-900">{e.userName ?? <span className="text-gray-400">Deleted user</span>}</p>
                    <p className="text-xs text-gray-400">{e.userEmail ?? "—"}</p>
                  </Td>
                  {!courseId && (
                    <Td>
                      {e.courseTitle ? (
                        <Link to={`/courses/${e.courseId}`} className="text-blue-600 hover:underline">{e.courseTitle}</Link>
                      ) : <span className="text-gray-400">Deleted course</span>}
                    </Td>
                  )}
                  {!companyId && (
                    <Td>
                      <Link to={`/companies/${e.companyId}`} className="text-blue-600 hover:underline">
                        {companyNames[e.companyId] ?? "Unknown company"}
                      </Link>
                    </Td>
                  )}
                  <Td><Badge variant={statusBadge(e.status)}>{titleCase(e.status)}</Badge></Td>
                  <Td><ProgressBar value={e.progressPct} trailing={`${e.progressPct}%`} /></Td>
                  <Td className="whitespace-nowrap text-gray-500">{formatDate(e.dueDate)}</Td>
                  <Td className="whitespace-nowrap text-gray-500">{formatDate(e.completionAt)}</Td>
                  <Td>
                    <IconButton danger title="Delete enrollment" onClick={() => setToDelete(e)}><FaTrash size={11} /></IconButton>
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
        title="Delete enrollment"
        message={<p>Remove <span className="font-semibold text-gray-800">{toDelete?.userName ?? "this learner"}</span> from <span className="font-semibold text-gray-800">{toDelete?.courseTitle ?? "this course"}</span>? Their progress is lost.</p>}
        onConfirm={() => api.del(`/enrollments/${toDelete!._id}`)}
        onDone={reload}
      />
    </div>
  );
}
