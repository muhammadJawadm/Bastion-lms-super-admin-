import { useState } from "react";
import { useNavigate } from "react-router";
import { FaPlus, FaBuilding, FaEye } from "react-icons/fa";
import { Badge } from "../components/ui/Badge";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../components/ui/States";
import { PageHeader, SearchInput, FilterSelect, TableCard, Th, Td, PrimaryButton } from "../components/ui/PageHeader";
import { CreateCompanyModal } from "../components/data/CompanyModals";
import { useApi, useDebounced } from "../lib/useApi";
import { formatDate, INDUSTRIES } from "../lib/format";
import type { ApiResponse, Company } from "../lib/types";

const LOGO_COLORS = ["bg-blue-600", "bg-emerald-600", "bg-indigo-600", "bg-orange-500", "bg-slate-600", "bg-red-600", "bg-purple-600", "bg-cyan-600"];
const logoColor = (id: string) => LOGO_COLORS[parseInt(id.slice(-2), 16) % LOGO_COLORS.length] ?? LOGO_COLORS[0];

export default function Companies() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [industry, setIndustry] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const q = useDebounced(search);

  // GET /admin/companies?search=&industry=&isActive= — search matches name, contact name and contact email.
  const { data, loading, error, reload } = useApi<ApiResponse<Company[]>>("/admin/companies", { search: q, isActive: status, industry });
  const companies = data?.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Companies"
        subtitle="Every client company on the platform."
        actions={<PrimaryButton onClick={() => setAddOpen(true)}><FaPlus size={12} /> Add Company</PrimaryButton>}
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by company, contact name or email…" />
        <FilterSelect value={status} onChange={setStatus} options={[{ value: "", label: "All statuses" }, { value: "true", label: "Active" }, { value: "false", label: "Inactive" }]} />
        <FilterSelect value={industry} onChange={setIndustry} options={[{ value: "", label: "All industries" }, ...INDUSTRIES.map((i) => ({ value: i, label: i }))]} />
      </div>

      <TableCard footer={!loading && !error ? `${companies.length} compan${companies.length === 1 ? "y" : "ies"}` : undefined}>
        {loading ? <LoadingBlock /> : error ? <ErrorBlock message={error} onRetry={reload} /> : companies.length === 0 ? (
          <EmptyBlock label="No companies match your filters." />
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50/70">
              <tr><Th>Company</Th><Th>Primary contact</Th><Th>Location</Th><Th>Payment</Th><Th>Status</Th><Th>Created</Th><Th /></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {companies.map((c) => (
                <tr key={c._id} onClick={() => navigate(`/companies/${c._id}`)} className="cursor-pointer hover:bg-gray-50/60">
                  <Td>
                    <div className="flex items-center gap-3">
                      {c.branding?.logoUrl ? (
                        <img src={c.branding.logoUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white ${logoColor(c._id)}`}><FaBuilding size={13} /></div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.industry || "No industry set"}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    {c.contactName || c.contactEmail ? (
                      <><p className="text-gray-800">{c.contactName || "—"}</p><p className="text-xs text-gray-400">{c.contactEmail}</p></>
                    ) : <span className="text-gray-400">—</span>}
                  </Td>
                  <Td className="text-gray-500">{[c.city, c.state].filter(Boolean).join(", ") || "—"}</Td>
                  <Td className="text-gray-500">{c.paymentMethods || "—"}</Td>
                  <Td><Badge variant={c.isActive ? "success" : "danger"}>{c.isActive ? "Active" : "Inactive"}</Badge></Td>
                  <Td className="whitespace-nowrap text-gray-500">{formatDate(c.createdAt)}</Td>
                  <Td>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/companies/${c._id}`); }}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <FaEye size={11} /> View
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>

      <CreateCompanyModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(id, notice) => navigate(`/companies/${id}`, { state: { notice } })}
      />
    </div>
  );
}
