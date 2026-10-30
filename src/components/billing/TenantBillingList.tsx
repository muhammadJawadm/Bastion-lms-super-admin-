import { useState } from "react";
import { useNavigate } from "react-router";
import { FaExclamationTriangle, FaChevronRight } from "react-icons/fa";
import { useApi } from "../../lib/useApi";
import { formatDate, SUBSCRIPTION_STATUS_LABEL, subscriptionStatusVariant } from "../../lib/format";
import type { Paginated, SubscriptionStatus, TenantBilling } from "../../lib/types";
import { Badge } from "../ui/Badge";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../ui/States";
import { FilterSelect, TableCard, Th, Td, SecondaryButton } from "../ui/PageHeader";

const PER_PAGE = 20;
const STATUSES: SubscriptionStatus[] = ["active", "trialing", "past_due", "unpaid", "incomplete", "incomplete_expired", "canceled"];
// Companies at risk of losing access float to the top of each page.
const AT_RISK = new Set<string>(["past_due", "unpaid"]);

export function TenantBillingList() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, loading, error, reload } = useApi<Paginated<TenantBilling>>("/billing/tenants", { status, perPage: PER_PAGE, pageNo: page });
  // Separate count so the past-due warning shows regardless of the current filter/page.
  const pastDueQ = useApi<Paginated<TenantBilling>>("/billing/tenants", { status: "past_due", perPage: 1 });
  const pastDueTotal = pastDueQ.data?.pagination.total ?? 0;

  const rows = [...(data?.data ?? [])].sort((a, b) => Number(AT_RISK.has(b.status)) - Number(AT_RISK.has(a.status)));
  const pg = data?.pagination;

  return (
    <div className="space-y-4">
      {pastDueTotal > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-center gap-3 text-red-700">
            <FaExclamationTriangle size={15} className="shrink-0" />
            <p className="text-sm">
              <span className="font-semibold">{pastDueTotal} compan{pastDueTotal === 1 ? "y is" : "ies are"} past due</span> and at risk of losing access.
            </p>
          </div>
          {status !== "past_due" && (
            <button onClick={() => { setStatus("past_due"); setPage(1); }} className="text-xs font-semibold text-red-700 underline hover:text-red-900">
              Show only past due
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
          options={[{ value: "", label: "All statuses" }, ...STATUSES.map((s) => ({ value: s, label: SUBSCRIPTION_STATUS_LABEL[s] }))]}
        />
      </div>

      <TableCard
        footer={pg && !loading && !error ? (
          <div className="flex items-center justify-between gap-3">
            <span>{pg.total} compan{pg.total === 1 ? "y" : "ies"} · page {pg.pageNo} of {Math.max(1, pg.totalPages)}</span>
            <div className="flex gap-2">
              <SecondaryButton className="px-3! py-1! text-xs!" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</SecondaryButton>
              <SecondaryButton className="px-3! py-1! text-xs!" disabled={page >= pg.totalPages} onClick={() => setPage((p) => p + 1)}>Next</SecondaryButton>
            </div>
          </div>
        ) : undefined}
      >
        {loading ? <LoadingBlock /> : error ? <ErrorBlock message={error} onRetry={reload} /> : rows.length === 0 ? (
          <EmptyBlock label={status ? "No companies with this billing status." : "No company has a billing record yet."} />
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50/70">
              <tr><Th>Company</Th><Th>Plan</Th><Th>Status</Th><Th>Current period ends</Th><Th>Grace period</Th><Th /></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((t) => {
                const atRisk = AT_RISK.has(t.status);
                const companyId = t.companyId?._id;
                return (
                  <tr
                    key={t._id}
                    onClick={() => companyId && navigate(`/billing/${companyId}`)}
                    className={`cursor-pointer ${atRisk ? "bg-red-50/60 hover:bg-red-50" : "hover:bg-gray-50/60"}`}
                  >
                    <Td>
                      <div className="flex items-center gap-2">
                        {atRisk && <FaExclamationTriangle size={11} className="shrink-0 text-red-500" />}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{t.companyId?.name ?? "Deleted company"}</p>
                          <p className="truncate text-xs text-gray-400">{t.companyId?.contactEmail ?? "—"}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>{t.planId?.name ? <Badge variant="info">{t.planId.name}</Badge> : <span className="text-gray-400">—</span>}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={subscriptionStatusVariant(t.status)}>{SUBSCRIPTION_STATUS_LABEL[t.status] ?? t.status}</Badge>
                        {t.cancelAtPeriodEnd && <Badge variant="warning">Cancels at period end</Badge>}
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap text-gray-500">{formatDate(t.currentPeriodEnd)}</Td>
                    <Td className="whitespace-nowrap text-gray-500">{t.gracePeriodUntil ? `Until ${formatDate(t.gracePeriodUntil)}` : "—"}</Td>
                    <Td><FaChevronRight size={11} className="text-gray-300" /></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </TableCard>
    </div>
  );
}
