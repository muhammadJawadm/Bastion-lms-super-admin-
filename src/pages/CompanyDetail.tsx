import { useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router";
import {
  FaArrowLeft, FaBuilding, FaEdit, FaTrash, FaPowerOff, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaGraduationCap, FaClipboardList, FaUsers, FaUserGraduate, FaCertificate, FaCreditCard,
} from "react-icons/fa";
import { Badge } from "../components/ui/Badge";
import { Tabs } from "../components/ui/Tabs";
import { StatCard } from "../components/ui/StatCard";
import { ProgressBar } from "../components/ui/ProgressBar";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Alert, LoadingBlock, ErrorBlock } from "../components/ui/States";
import { SecondaryButton, DangerButton } from "../components/ui/PageHeader";
import { EditCompanyModal } from "../components/data/CompanyModals";
import { UsersTable } from "../components/data/UsersTable";
import { CoursesTable } from "../components/data/CoursesTable";
import { FormsTable } from "../components/data/FormsTable";
import { EnrollmentsTable } from "../components/data/EnrollmentsTable";
import { CertificatesTable } from "../components/data/CertificatesTable";
import { UploadsTable } from "../components/data/UploadsTable";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";
import { formatDate } from "../lib/format";
import type { ApiResponse, Company, CompanyDashboard } from "../lib/types";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "users", label: "Users" },
  { key: "courses", label: "Courses" },
  { key: "forms", label: "Forms" },
  { key: "enrollments", label: "Enrollments" },
  { key: "certificates", label: "Certificates" },
  { key: "uploads", label: "Uploads" },
];

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={12} className="mt-1 shrink-0 text-gray-400" />
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="wrap-break-word text-sm text-gray-800">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function CompanyDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice;
  const [tab, setTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const companyQ = useApi<ApiResponse<Company>>(`/company/${id}`);
  const statsQ = useApi<ApiResponse<CompanyDashboard>>(`/company/${id}/dashboard`);
  const company = companyQ.data?.data;
  const stats = statsQ.data?.data;

  if (companyQ.loading) return <LoadingBlock label="Loading company…" />;
  if (companyQ.error || !company) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <ErrorBlock message={companyQ.error ?? "Company not found."} onRetry={companyQ.reload} />
        <div className="pb-6 text-center">
          <button onClick={() => navigate("/companies")} className="text-sm font-medium text-blue-600 hover:text-blue-800">&larr; Back to Companies</button>
        </div>
      </div>
    );
  }

  const e = stats?.enrollments;
  const completion = e && e.total ? Math.round((e.completed / e.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <Link to="/companies" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <FaArrowLeft size={11} /> Companies
      </Link>

      {notice && <Alert variant="warning">{notice}</Alert>}

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          {company.branding?.logoUrl ? (
            <img src={company.branding.logoUrl} alt="" className="h-14 w-14 rounded-xl object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white"><FaBuilding size={20} /></div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
              <Badge variant={company.isActive ? "success" : "danger"}>{company.isActive ? "Active" : "Inactive"}</Badge>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">{company.industry || "No industry set"} · Created {formatDate(company.createdAt)}</p>
            <p className="mt-0.5 font-mono text-[11px] text-gray-400">{company._id}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <SecondaryButton onClick={() => navigate(`/billing/${id}`)}><FaCreditCard size={12} /> Billing</SecondaryButton>
          <SecondaryButton onClick={() => setEditOpen(true)}><FaEdit size={12} /> Edit</SecondaryButton>
          <SecondaryButton onClick={() => setToggleOpen(true)}>
            <FaPowerOff size={12} className={company.isActive ? "text-red-500" : "text-green-600"} />
            {company.isActive ? "Deactivate" : "Activate"}
          </SecondaryButton>
          <DangerButton onClick={() => setDeleteOpen(true)}><FaTrash size={11} /> Delete</DangerButton>
        </div>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "overview" && (
        <div className="space-y-6">
          {statsQ.error ? (
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm"><ErrorBlock message={statsQ.error} onRetry={statsQ.reload} /></div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard label="Employees" value={stats ? String(stats.employees.total) : "…"} sub="role: user" icon={FaUsers} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
              <StatCard label="Courses" value={stats ? String(stats.courses.total) : "…"} sub={stats ? `${stats.courses.published} published · ${stats.courses.draft} draft` : ""} icon={FaGraduationCap} iconBg="bg-blue-50" iconColor="text-blue-600" />
              <StatCard label="Forms" value={stats ? String(stats.forms.total) : "…"} sub={stats ? `${stats.forms.published} published · ${stats.forms.draft} draft` : ""} icon={FaClipboardList} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
              <StatCard label="Enrollments" value={e ? String(e.total) : "…"} sub={e ? `${e.overdue} overdue` : ""} subColor={e?.overdue ? "text-red-500" : undefined} icon={FaUserGraduate} iconBg="bg-violet-50" iconColor="text-violet-600" />
              <StatCard label="Certificates" value={stats ? String(stats.certificates.total) : "…"} sub="Issued" icon={FaCertificate} iconBg="bg-amber-50" iconColor="text-amber-600" />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">Company Profile</h2>
              <div className="space-y-3.5">
                <InfoRow icon={FaUsers} label="Primary contact" value={company.contactName} />
                <InfoRow icon={FaEnvelope} label="Contact email" value={company.contactEmail} />
                <InfoRow icon={FaPhone} label="Contact phone" value={company.contactPhone} />
                <InfoRow icon={FaMapMarkerAlt} label="Location" value={[company.city, company.state].filter(Boolean).join(", ")} />
                <InfoRow icon={FaCreditCard} label="Payment method" value={company.paymentMethods} />
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">Training Progress</h2>
              {!e ? <LoadingBlock /> : (
                <>
                  <ProgressBar value={completion} color="bg-green-500" label="Completion rate" trailing={`${completion}%`} />
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {([
                      ["Assigned", e.assigned, "text-gray-700"],
                      ["In progress", e.inProgress, "text-blue-600"],
                      ["Completed", e.completed, "text-green-600"],
                      ["Overdue", e.overdue, "text-red-500"],
                    ] as const).map(([label, value, color]) => (
                      <div key={label} className="rounded-lg bg-gray-50 px-3 py-2.5">
                        <p className={`text-lg font-bold ${color}`}>{value}</p>
                        <p className="text-xs text-gray-500">{label}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {company.branding && (company.branding.primaryColor || company.branding.accentColor) && (
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <p className="mb-2 text-xs font-semibold text-gray-500">Branding (set by the Company Admin)</p>
                  <div className="flex gap-4 text-xs text-gray-600">
                    {company.branding.primaryColor && <span className="flex items-center gap-1.5"><span className="h-4 w-4 rounded border border-gray-200" style={{ background: company.branding.primaryColor }} /> Primary {company.branding.primaryColor}</span>}
                    {company.branding.accentColor && <span className="flex items-center gap-1.5"><span className="h-4 w-4 rounded border border-gray-200" style={{ background: company.branding.accentColor }} /> Accent {company.branding.accentColor}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Alert variant="info">
            Company content (courses, forms, profile, branding, notifications) is created and edited by the company's own admin.
            As Super Admin you can view and delete it here, and edit only the company record itself.
          </Alert>
        </div>
      )}

      {tab === "users" && <UsersTable companyId={id} />}
      {tab === "courses" && <CoursesTable companyId={id} />}
      {tab === "forms" && <FormsTable companyId={id} />}
      {tab === "enrollments" && <EnrollmentsTable companyId={id} />}
      {tab === "certificates" && <CertificatesTable companyId={id} />}
      {tab === "uploads" && <UploadsTable companyId={id} />}

      <EditCompanyModal company={company} isOpen={editOpen} onClose={() => setEditOpen(false)} onSaved={companyQ.reload} />

      <ConfirmDialog
        isOpen={toggleOpen}
        onClose={() => setToggleOpen(false)}
        title={company.isActive ? "Deactivate company" : "Activate company"}
        confirmLabel={company.isActive ? "Deactivate" : "Activate"}
        message={
          <>
            <p>Set <span className="font-semibold text-gray-800">{company.name}</span> to {company.isActive ? "inactive" : "active"}?</p>
            {company.isActive && (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Heads-up: the API currently only stores this flag. It does <span className="font-semibold">not</span> block this company's users from logging in or using the app.
              </p>
            )}
          </>
        }
        onConfirm={() => api.patch(`/company/${id}`, { isActive: !company.isActive })}
        onDone={companyQ.reload}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete company"
        confirmLabel="Delete everything"
        requireText={company.name}
        message={
          <>
            <p>This permanently deletes <span className="font-semibold text-gray-800">{company.name}</span> and everything it owns:</p>
            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-gray-600">
              <li>all users{stats ? ` (${stats.employees.total} employees + admins)` : ""}</li>
              <li>all courses and lessons{stats ? ` (${stats.courses.total} courses)` : ""}</li>
              <li>all forms and form responses{stats ? ` (${stats.forms.total} forms)` : ""}</li>
              <li>all enrollments, answer sets and certificates</li>
            </ul>
            <p className="mt-2 text-xs font-semibold text-red-600">This can't be undone. Uploaded files stay in Cloudinary and are not removed.</p>
          </>
        }
        onConfirm={() => api.del(`/company/${id}`)}
        onDone={() => navigate("/companies", { replace: true })}
      />
    </div>
  );
}
