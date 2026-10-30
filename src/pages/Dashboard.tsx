import { Link, useNavigate } from "react-router";
import {
  FaBuilding, FaBan, FaUserTie, FaUsers, FaGraduationCap, FaClipboardList,
  FaUserGraduate, FaCheckCircle, FaExclamationTriangle, FaCertificate,
} from "react-icons/fa";
import { StatCard } from "../components/ui/StatCard";
import { Badge } from "../components/ui/Badge";
import { ProgressBar } from "../components/ui/ProgressBar";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../components/ui/States";
import { PageHeader, TableCard, Th, Td } from "../components/ui/PageHeader";
import { useApi } from "../lib/useApi";
import { formatDate, formatDateTime, ROLE_LABEL } from "../lib/format";
import type { ApiResponse, Certificate, Company, Course, Enrollment, Form, Paginated, User } from "../lib/types";

// perPage=1 — we only want pagination.total from these.
function useEnrollmentCount(status?: string) {
  const { data } = useApi<Paginated<Enrollment>>("/enrollments", { status, perPage: 1 });
  return data?.pagination.total;
}

const n = (v: number | undefined) => (v === undefined ? "…" : v.toLocaleString());

export default function Dashboard() {
  const navigate = useNavigate();
  const companiesQ = useApi<ApiResponse<Company[]>>("/admin/companies");
  const usersQ = useApi<ApiResponse<User[]>>("/admin/users");
  const coursesQ = useApi<ApiResponse<Course[]>>("/courses");
  const formsQ = useApi<ApiResponse<Form[]>>("/forms");
  const certsQ = useApi<ApiResponse<Certificate[]>>("/certificates");
  const enrolTotal = useEnrollmentCount();
  const enrolCompleted = useEnrollmentCount("completed");
  const enrolInProgress = useEnrollmentCount("in_progress");
  const enrolOverdue = useEnrollmentCount("overdue");

  const companies = companiesQ.data?.data;
  const users = usersQ.data?.data;
  const courses = coursesQ.data?.data;
  const forms = formsQ.data?.data;
  const certs = certsQ.data?.data;

  const activeCompanies = companies?.filter((c) => c.isActive).length;
  const inactiveCompanies = companies?.filter((c) => !c.isActive).length;
  const companyAdmins = users?.filter((u) => u.role === "client_admin").length;
  const employees = users?.filter((u) => u.role === "user").length;
  const publishedCourses = courses?.filter((c) => c.status === "published").length;
  const libraryCourses = courses?.filter((c) => !c.companyId).length;
  const publishedForms = forms?.filter((f) => f.status === "published").length;
  const completionRate = enrolTotal ? Math.round(((enrolCompleted ?? 0) / enrolTotal) * 100) : 0;

  // Per-company rollups for the overview table.
  const countBy = <T,>(rows: T[] | undefined, key: (r: T) => string | null | undefined) => {
    const m: Record<string, number> = {};
    rows?.forEach((r) => { const k = key(r); if (k) m[k] = (m[k] ?? 0) + 1; });
    return m;
  };
  const usersByCo = countBy(users?.filter((u) => u.role !== "platform_admin"), (u) => u.companyId);
  const coursesByCo = countBy(courses, (c) => c.companyId);
  const formsByCo = countBy(forms, (f) => f.companyId);
  const certsByCo = countBy(certs, (c) => c.companyId);
  const companyName: Record<string, string> = {};
  companies?.forEach((c) => { companyName[c._id] = c.name; });

  const recentLogins = [...(users ?? [])]
    .filter((u) => u.lastLoginAt)
    .sort((a, b) => new Date(b.lastLoginAt!).getTime() - new Date(a.lastLoginAt!).getTime())
    .slice(0, 6);

  const fatal = companiesQ.error;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Live platform snapshot across every client company." />

      {fatal && (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <ErrorBlock message={fatal} onRetry={companiesQ.reload} />
        </div>
      )}

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Clients</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active Companies" value={n(activeCompanies)} sub={`of ${n(companies?.length)} total`} icon={FaBuilding} iconBg="bg-green-50" iconColor="text-green-600" />
          <StatCard label="Inactive Companies" value={n(inactiveCompanies)} sub="isActive = false" icon={FaBan} iconBg="bg-red-50" iconColor="text-red-500" subColor="text-red-500" />
          <StatCard label="Company Admins" value={n(companyAdmins)} sub="client_admin accounts" icon={FaUserTie} iconBg="bg-blue-50" iconColor="text-blue-600" />
          <StatCard label="Employees" value={n(employees)} sub="Mobile learners" icon={FaUsers} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Content &amp; Learning</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Courses" value={n(courses?.length)} sub={`${n(publishedCourses)} published · ${n(libraryCourses)} in Bastion library`} icon={FaGraduationCap} iconBg="bg-blue-50" iconColor="text-blue-600" />
          <StatCard label="Forms" value={n(forms?.length)} sub={`${n(publishedForms)} published`} icon={FaClipboardList} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
          <StatCard label="Enrollments" value={n(enrolTotal)} sub={`${n(enrolInProgress)} in progress`} icon={FaUserGraduate} iconBg="bg-violet-50" iconColor="text-violet-600" />
          <StatCard label="Certificates" value={n(certs?.length)} sub="Issued across all clients" icon={FaCertificate} iconBg="bg-amber-50" iconColor="text-amber-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">Training Completion</h2>
          <p className="text-3xl font-bold text-gray-900">{enrolTotal === undefined ? "…" : `${completionRate}%`}</p>
          <p className="mb-4 text-xs text-gray-400">of all enrollments completed</p>
          <ProgressBar value={completionRate} color="bg-green-500" />
          <div className="mt-5 space-y-2.5 text-sm">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-gray-600"><FaCheckCircle size={12} className="text-green-500" /> Completed</span><span className="font-medium">{n(enrolCompleted)}</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-gray-600"><FaUserGraduate size={12} className="text-blue-500" /> In progress</span><span className="font-medium">{n(enrolInProgress)}</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-gray-600"><FaExclamationTriangle size={12} className="text-red-500" /> Overdue</span><span className="font-medium">{n(enrolOverdue)}</span></div>
          </div>
          <Link to="/enrollments" className="mt-5 block text-xs font-semibold text-blue-600 hover:text-blue-800">View all enrollments →</Link>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-800">Recent Sign-ins</h2>
            <Link to="/users" className="text-xs font-semibold text-blue-600 hover:text-blue-800">All users →</Link>
          </div>
          {usersQ.loading ? <LoadingBlock /> : usersQ.error ? <ErrorBlock message={usersQ.error} onRetry={usersQ.reload} /> : recentLogins.length === 0 ? (
            <EmptyBlock label="Nobody has signed in yet." />
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentLogins.map((u) => (
                <li key={u._id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-gray-800">{u.name} <span className="text-xs text-gray-400">· {ROLE_LABEL[u.role]}</span></p>
                    <p className="truncate text-xs text-gray-400">{u.companyId ? companyName[u.companyId] ?? "Unknown company" : "Bastion"}</p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-500">{formatDateTime(u.lastLoginAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Companies Overview</h2>
          <Link to="/companies" className="text-xs font-semibold text-blue-600 hover:text-blue-800">Manage companies →</Link>
        </div>
        <TableCard>
          {companiesQ.loading ? <LoadingBlock /> : !companies || companies.length === 0 ? (
            <EmptyBlock label="No companies yet." />
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50/70">
                <tr><Th>Company</Th><Th>Status</Th><Th>Users</Th><Th>Courses</Th><Th>Forms</Th><Th>Certificates</Th><Th>Created</Th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {companies.slice(0, 8).map((c) => (
                  <tr key={c._id} onClick={() => navigate(`/companies/${c._id}`)} className="cursor-pointer hover:bg-gray-50/60">
                    <Td><p className="font-medium text-gray-900">{c.name}</p><p className="text-xs text-gray-400">{c.industry || "—"}</p></Td>
                    <Td><Badge variant={c.isActive ? "success" : "danger"}>{c.isActive ? "Active" : "Inactive"}</Badge></Td>
                    <Td>{usersByCo[c._id] ?? 0}</Td>
                    <Td>{coursesByCo[c._id] ?? 0}</Td>
                    <Td>{formsByCo[c._id] ?? 0}</Td>
                    <Td>{certsByCo[c._id] ?? 0}</Td>
                    <Td className="whitespace-nowrap text-gray-500">{formatDate(c.createdAt)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TableCard>
      </div>
    </div>
  );
}
