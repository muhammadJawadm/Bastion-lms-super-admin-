import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { FaArrowLeft, FaClipboardList, FaTrash, FaBuilding, FaFlag, FaChevronDown, FaChevronRight } from "react-icons/fa";
import { Badge } from "../components/ui/Badge";
import { Tabs } from "../components/ui/Tabs";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../components/ui/States";
import { DangerButton } from "../components/ui/PageHeader";
import { api } from "../lib/api";
import { useApi, useCompanyNames } from "../lib/useApi";
import { formatDateTime, titleCase } from "../lib/format";
import type { ApiResponse, Form, FormField, FormResponse, User } from "../lib/types";

function renderValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) return v.map(renderValue).join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function ResponseRow({ r, fields, columns, userName }: {
  r: FormResponse;
  fields: Record<string, FormField>;
  columns: Record<string, string>;
  userName: string;
}) {
  const [open, setOpen] = useState(false);
  const flagged = r.answers.filter((a) => a.flagged).length;
  return (
    <li>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-gray-50/60">
        <div className="flex min-w-0 items-center gap-3">
          {open ? <FaChevronDown size={10} className="text-gray-400" /> : <FaChevronRight size={10} className="text-gray-400" />}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-800">{userName}</p>
            <p className="text-xs text-gray-400">{formatDateTime(r.submittedAt)}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-gray-400">{r.answers.length} answers</span>
          {flagged > 0 && <Badge variant="danger">{flagged} flagged</Badge>}
        </div>
      </button>
      {open && (
        <div className="space-y-3 bg-gray-50/50 px-5 pb-4 pl-12 pt-1">
          {r.answers.length > 0 && (
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              {r.answers.map((a) => (
                <div key={a.fieldId} className="min-w-0">
                  <dt className="flex items-center gap-1.5 text-xs text-gray-400">
                    {a.flagged && <FaFlag size={9} className="text-red-500" />} {fields[a.fieldId]?.label ?? "Removed field"}
                  </dt>
                  <dd className={`wrap-break-word text-sm ${a.flagged ? "font-semibold text-red-600" : "text-gray-800"}`}>{renderValue(a.value)}</dd>
                </div>
              ))}
            </dl>
          )}
          {r.tableRows.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500">Table rows</p>
              {r.tableRows.map((row, i) => (
                <p key={i} className="text-xs text-gray-600">
                  {row.cells.map((c) => `${columns[c.columnId] ?? "?"}: ${renderValue(c.value)}`).join(" · ")}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export default function FormView() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("structure");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { names } = useCompanyNames();
  const formQ = useApi<ApiResponse<Form>>(`/forms/${id}`);
  const responsesQ = useApi<ApiResponse<FormResponse[]>>(`/forms/${id}/responses`);
  const form = formQ.data?.data;
  const usersQ = useApi<ApiResponse<User[]>>(form?.companyId ? "/admin/users" : null, { companyId: form?.companyId ?? undefined });

  if (formQ.loading) return <LoadingBlock label="Loading form…" />;
  if (formQ.error || !form) {
    return <div className="rounded-xl border border-gray-100 bg-white shadow-sm"><ErrorBlock message={formQ.error ?? "Form not found."} onRetry={formQ.reload} /></div>;
  }

  const pages = [...(form.pages ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const fields: Record<string, FormField> = {};
  const columns: Record<string, string> = {};
  pages.forEach((p) => p.items.forEach((it) => {
    it.fields?.forEach((f) => { fields[f._id] = f; });
    it.columns?.forEach((c) => { columns[c._id] = c.label ?? ""; });
  }));
  const userName: Record<string, string> = {};
  (usersQ.data?.data ?? []).forEach((u) => { userName[u._id] = u.name; });
  const responses = responsesQ.data?.data ?? [];

  return (
    <div className="space-y-6">
      <Link to="/forms" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"><FaArrowLeft size={11} /> Forms</Link>

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><FaClipboardList size={20} /></div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{form.title}</h1>
              <Badge variant={form.status === "published" ? "success" : "neutral"}>{form.status}</Badge>
            </div>
            {form.description && <p className="mt-1 max-w-2xl text-sm text-gray-500">{form.description}</p>}
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <FaBuilding size={11} />
                {form.companyId ? <Link to={`/companies/${form.companyId}`} className="text-blue-600 hover:underline">{names[form.companyId] ?? "Company"}</Link> : "—"}
              </span>
              {form.ownerName && <span>Owner: {form.ownerName}</span>}
              <span>{pages.length} page{pages.length === 1 ? "" : "s"} · {Object.keys(fields).length} fields</span>
            </div>
          </div>
        </div>
        <DangerButton onClick={() => setDeleteOpen(true)}><FaTrash size={11} /> Delete form</DangerButton>
      </div>

      <Tabs
        tabs={[{ key: "structure", label: "Structure" }, { key: "responses", label: "Responses", count: responsesQ.data ? responses.length : undefined }]}
        active={tab}
        onChange={setTab}
      />

      {tab === "structure" && (
        pages.length === 0 ? <div className="rounded-xl border border-gray-100 bg-white shadow-sm"><EmptyBlock label="This form has no pages yet." /></div> : (
          <div className="space-y-4">
            {pages.map((p, pi) => (
              <div key={p._id} className="rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-3.5"><p className="text-sm font-semibold text-gray-800">Page {pi + 1}{p.title ? `: ${p.title}` : ""}</p></div>
                <div className="divide-y divide-gray-50">
                  {p.items.length === 0 && <p className="px-5 py-4 text-xs text-gray-400">Empty page.</p>}
                  {p.items.map((it) => (
                    <div key={it._id} className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Badge variant={it.kind === "table" ? "purple" : it.kind === "instruction" ? "orange" : "info"}>{titleCase(it.kind ?? "section")}</Badge>
                        <p className="text-sm font-medium text-gray-800">{it.title || "Untitled"}</p>
                      </div>
                      {it.body && <p className="mt-1.5 text-xs text-gray-500">{it.body}</p>}
                      {it.kind === "table" && it.columns.length > 0 && (
                        <p className="mt-2 text-xs text-gray-500">Columns: {it.columns.map((c) => c.label || "—").join(" · ")}</p>
                      )}
                      {it.fields.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {it.fields.map((f) => (
                            <li key={f._id} className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                              <Badge variant="neutral">{titleCase(f.type ?? "text")}</Badge>
                              <span>{f.label || "Untitled field"}</span>
                              {f.required && <span className="text-red-500">*</span>}
                              {f.options && f.options.length > 0 && <span className="text-gray-400">({f.options.join(", ")})</span>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "responses" && (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          {responsesQ.loading ? <LoadingBlock /> : responsesQ.error ? <ErrorBlock message={responsesQ.error} onRetry={responsesQ.reload} /> : responses.length === 0 ? (
            <EmptyBlock label="No responses submitted yet." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {responses.map((r) => (
                <ResponseRow key={r._id} r={r} fields={fields} columns={columns} userName={(r.submittedBy && userName[r.submittedBy]) || "Unknown submitter"} />
              ))}
            </ul>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete form"
        message={
          <>
            <p>Delete <span className="font-semibold text-gray-800">{form.title}</span>?</p>
            <p className="mt-2 text-xs text-gray-500">All {responsesQ.data ? responses.length : ""} submitted response(s) are deleted too. This can't be undone.</p>
          </>
        }
        onConfirm={() => api.del(`/forms/${id}`)}
        onDone={() => navigate("/forms", { replace: true })}
      />
    </div>
  );
}
