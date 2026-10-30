import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { FaArrowLeft, FaGraduationCap, FaTrash, FaBuilding, FaClock, FaCertificate, FaCheckCircle } from "react-icons/fa";
import { Badge } from "../components/ui/Badge";
import { Tabs } from "../components/ui/Tabs";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../components/ui/States";
import { DangerButton } from "../components/ui/PageHeader";
import { EnrollmentsTable } from "../components/data/EnrollmentsTable";
import { api } from "../lib/api";
import { useApi, useCompanyNames } from "../lib/useApi";
import { formatDate, titleCase, courseStatusVariant } from "../lib/format";
import type { ApiResponse, CourseDetail, Lesson } from "../lib/types";

function LessonRow({ lesson, index }: { lesson: Lesson; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="px-5 py-3">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 text-left">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-500">{index + 1}</span>
          <p className="truncate text-sm font-medium text-gray-800">{lesson.title}</p>
          {lesson.isRequired && <Badge variant="info">Required</Badge>}
        </div>
        <span className="shrink-0 text-xs text-gray-400">
          {lesson.blocks.length} block{lesson.blocks.length === 1 ? "" : "s"}{lesson.durationMinutes ? ` · ${lesson.durationMinutes} min` : ""}
        </span>
      </button>
      {open && lesson.blocks.length > 0 && (
        <ul className="mt-3 space-y-1.5 pl-9">
          {[...lesson.blocks].sort((a, b) => a.sortOrder - b.sortOrder).map((b) => (
            <li key={b._id} className="flex items-center gap-2 text-xs text-gray-600">
              <Badge variant="neutral">{titleCase(b.type)}</Badge> {b.title || <span className="text-gray-400">Untitled</span>}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function CourseView() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("content");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { data, loading, error, reload } = useApi<ApiResponse<CourseDetail>>(`/courses/${id}`);
  const { names } = useCompanyNames();
  const course = data?.data;

  if (loading) return <LoadingBlock label="Loading course…" />;
  if (error || !course) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <ErrorBlock message={error ?? "Course not found."} onRetry={reload} />
      </div>
    );
  }

  const modules = [...(course.modules ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const lessons = [...course.lessons].sort((a, b) => a.sortOrder - b.sortOrder);
  const lessonsByModule = (moduleId: string | null) => lessons.filter((l) => (l.moduleId ?? null) === moduleId);
  const unassigned = lessons.filter((l) => !l.moduleId || !modules.some((m) => m._id === l.moduleId));

  return (
    <div className="space-y-6">
      <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"><FaArrowLeft size={11} /> Courses</Link>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {course.coverImageUrl && <img src={course.coverImageUrl} alt="" className="h-40 w-full object-cover" />}
        <div className="flex flex-wrap items-start justify-between gap-4 p-5">
          <div className="flex items-start gap-4">
            {!course.coverImageUrl && <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500"><FaGraduationCap size={22} /></div>}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
                <Badge variant={courseStatusVariant(course.status)}>{course.status}</Badge>
                {course.isDemo && <Badge variant="orange">Demo</Badge>}
              </div>
              {course.description && <p className="mt-1 max-w-2xl text-sm text-gray-500">{course.description}</p>}
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <FaBuilding size={11} />
                  {course.companyId ? <Link to={`/companies/${course.companyId}`} className="text-blue-600 hover:underline">{names[course.companyId] ?? "Company"}</Link> : "Bastion library"}
                </span>
                {course.category && <span>{course.category}</span>}
                {course.durationMinutes && <span className="flex items-center gap-1.5"><FaClock size={11} /> {course.durationMinutes} min</span>}
                {course.passScore && <span className="flex items-center gap-1.5"><FaCheckCircle size={11} /> Pass score {course.passScore}</span>}
                {course.issuesCertificate && <span className="flex items-center gap-1.5"><FaCertificate size={11} /> {course.certificateTitle || "Issues certificate"}</span>}
                <span>Updated {formatDate(course.updatedAt)}</span>
              </div>
            </div>
          </div>
          <DangerButton onClick={() => setDeleteOpen(true)}><FaTrash size={11} /> Delete course</DangerButton>
        </div>
      </div>

      <Tabs tabs={[{ key: "content", label: "Content", count: lessons.length }, { key: "enrollments", label: "Enrollments" }]} active={tab} onChange={setTab} />

      {tab === "content" && (
        <div className="space-y-4">
          {lessons.length === 0 && modules.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm"><EmptyBlock label="This course has no modules or lessons yet." /></div>
          ) : (
            <>
              {modules.map((m) => (
                <div key={m._id} className="rounded-xl border border-gray-100 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-5 py-3.5">
                    <p className="text-sm font-semibold text-gray-800">{m.title}</p>
                    {m.description && <p className="text-xs text-gray-400">{m.description}</p>}
                  </div>
                  {lessonsByModule(m._id).length === 0 ? <p className="px-5 py-4 text-xs text-gray-400">No lessons in this module.</p> : (
                    <ul className="divide-y divide-gray-50">{lessonsByModule(m._id).map((l, i) => <LessonRow key={l._id} lesson={l} index={i} />)}</ul>
                  )}
                </div>
              ))}
              {unassigned.length > 0 && (
                <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-5 py-3.5"><p className="text-sm font-semibold text-gray-800">{modules.length ? "Lessons outside a module" : "Lessons"}</p></div>
                  <ul className="divide-y divide-gray-50">{unassigned.map((l, i) => <LessonRow key={l._id} lesson={l} index={i} />)}</ul>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "enrollments" && <EnrollmentsTable courseId={id} companyNames={names} />}

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete course"
        message={
          <>
            <p>Delete <span className="font-semibold text-gray-800">{course.title}</span>?</p>
            <p className="mt-2 text-xs text-gray-500">This also deletes its {lessons.length} lesson(s) and every enrollment in it. Issued certificates are kept. This can't be undone.</p>
          </>
        }
        onConfirm={() => api.del(`/courses/${id}`)}
        onDone={() => navigate("/courses", { replace: true })}
      />
    </div>
  );
}
