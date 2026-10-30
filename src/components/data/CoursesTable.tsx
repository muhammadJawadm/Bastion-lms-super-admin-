import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { FaTrash, FaGraduationCap } from "react-icons/fa";
import { api } from "../../lib/api";
import { useApi, useDebounced } from "../../lib/useApi";
import { formatDate, courseStatusVariant } from "../../lib/format";
import type { ApiResponse, Course } from "../../lib/types";
import { Badge } from "../ui/Badge";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../ui/States";
import { SearchInput, FilterSelect, TableCard, Th, Td, IconButton } from "../ui/PageHeader";

interface CoursesTableProps {
  companyId?: string;
  companyNames?: Record<string, string>;
  // "library" lists Bastion's shared catalog (courses with no company) via /courses/library.
  source?: "company" | "library";
}

export function CoursesTable({ companyId, companyNames = {}, source = "company" }: CoursesTableProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [toDelete, setToDelete] = useState<Course | null>(null);
  const q = useDebounced(search);

  // GET /courses (not /admin/courses) — same filters, but also returns lessonCount/enrollmentCount.
  const isLibrary = source === "library";
  const { data, loading, error, reload } = useApi<ApiResponse<Course[]>>(
    isLibrary ? "/courses/library" : "/courses",
    isLibrary ? {} : { search: q, status, companyId },
  );
  let courses = data?.data ?? [];
  if (isLibrary) {
    // /courses/library takes no filters, so filter client-side.
    courses = courses.filter((c) => (!q || c.title.toLowerCase().includes(q.toLowerCase())) && (!status || c.status === status));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search course title…" />
        <FilterSelect
          value={status}
          onChange={setStatus}
          options={[
            { value: "", label: "All statuses" },
            { value: "published", label: "Published" },
            { value: "draft", label: "Draft" },
            { value: "archived", label: "Archived" },
          ]}
        />
      </div>

      <TableCard footer={!loading && !error ? `${courses.length} course${courses.length === 1 ? "" : "s"}` : undefined}>
        {loading ? <LoadingBlock /> : error ? <ErrorBlock message={error} onRetry={reload} /> : courses.length === 0 ? (
          <EmptyBlock label={isLibrary ? "The Bastion library is empty." : "No courses match these filters."} />
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50/70">
              <tr>
                <Th>Course</Th>
                {!companyId && !isLibrary && <Th>Company</Th>}
                <Th>Status</Th>
                <Th>Modules</Th>
                {!isLibrary && <Th>Lessons</Th>}
                {!isLibrary && <Th>Enrollments</Th>}
                <Th>Updated</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((c) => (
                <tr key={c._id} onClick={() => navigate(`/courses/${c._id}`)} className="cursor-pointer hover:bg-gray-50/60">
                  <Td>
                    <div className="flex items-center gap-3">
                      {c.coverImageUrl ? (
                        <img src={c.coverImageUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500"><FaGraduationCap size={14} /></div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">{c.title}</p>
                        <p className="truncate text-xs text-gray-400">{c.category || "Uncategorised"}{c.sourceLibraryCourseId ? " · from library" : ""}</p>
                      </div>
                    </div>
                  </Td>
                  {!companyId && !isLibrary && (
                    <Td>
                      {c.companyId ? (
                        <Link to={`/companies/${c.companyId}`} onClick={(e) => e.stopPropagation()} className="text-blue-600 hover:underline">
                          {companyNames[c.companyId] ?? "Unknown company"}
                        </Link>
                      ) : <Badge variant="purple">Bastion library</Badge>}
                    </Td>
                  )}
                  <Td><Badge variant={courseStatusVariant(c.status)}>{c.status}</Badge></Td>
                  <Td>{c.modules?.length ?? 0}</Td>
                  {!isLibrary && <Td>{c.lessonCount ?? 0}</Td>}
                  {!isLibrary && <Td>{c.enrollmentCount ?? 0}</Td>}
                  <Td className="whitespace-nowrap text-gray-500">{formatDate(c.updatedAt)}</Td>
                  <Td>
                    <IconButton danger title="Delete course" onClick={(e) => { e.stopPropagation(); setToDelete(c); }}>
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
        title="Delete course"
        message={
          <>
            <p>Delete <span className="font-semibold text-gray-800">{toDelete?.title}</span>?</p>
            <p className="mt-2 text-xs text-gray-500">
              This also deletes all of its lessons and{" "}
              <span className="font-semibold">{toDelete?.enrollmentCount ?? "all"} enrollment(s)</span>. Issued certificates are kept. This can't be undone.
            </p>
          </>
        }
        onConfirm={() => api.del(`/courses/${toDelete!._id}`)}
        onDone={reload}
      />
    </div>
  );
}
