import { useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaExternalLinkAlt, FaUsers } from "react-icons/fa";
import { api } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import type { ApiResponse, Plan } from "../../lib/types";
import { Badge } from "../ui/Badge";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { Alert, LoadingBlock, ErrorBlock, EmptyBlock } from "../ui/States";
import { PrimaryButton, SecondaryButton } from "../ui/PageHeader";
import { PlanModal, STRIPE_PRODUCTS_URL } from "./PlanModal";

function IdRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="shrink-0 text-gray-400">{label}</span>
      <span className="truncate font-mono text-gray-600" title={value}>{value || "—"}</span>
    </div>
  );
}

export function PlanCatalog() {
  // platform_admin sees active AND inactive plans from this endpoint.
  const { data, loading, error, reload } = useApi<ApiResponse<Plan[]>>("/billing/plans");
  const plans = data?.data ?? [];
  const [editing, setEditing] = useState<Plan | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toToggle, setToToggle] = useState<Plan | null>(null);
  const [toDelete, setToDelete] = useState<Plan | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: Plan) => { setEditing(p); setModalOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-sm text-gray-500">
          The plans companies can subscribe to. Each one points at a Product and Prices that already exist in Stripe.
        </p>
        <div className="flex gap-2">
          <a
            href={STRIPE_PRODUCTS_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <FaExternalLinkAlt size={11} /> Stripe Products
          </a>
          <PrimaryButton onClick={openCreate}><FaPlus size={11} /> Add Plan</PrimaryButton>
        </div>
      </div>

      {notice && <Alert variant="info">{notice}</Alert>}

      {loading ? <LoadingBlock /> : error ? (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm"><ErrorBlock message={error} onRetry={reload} /></div>
      ) : plans.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm"><EmptyBlock label="No plans yet. Add one to let companies subscribe." /></div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((p) => (
            <div key={p._id} className={`flex flex-col rounded-xl border bg-white p-5 shadow-sm ${p.isActive ? "border-gray-100" : "border-dashed border-gray-200 opacity-75"}`}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-bold text-gray-900">{p.name}</h3>
                <Badge variant={p.isActive ? "success" : "neutral"}>{p.isActive ? "Active" : "Retired"}</Badge>
              </div>
              {p.description && <p className="mt-1 text-sm text-gray-500">{p.description}</p>}
              <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                <FaUsers size={11} /> {p.seatLimit === null ? "Unlimited seats" : `Up to ${p.seatLimit} seats`}
              </p>

              {p.features.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-gray-600">
                  {p.features.map((f) => <li key={f}>• {f}</li>)}
                </ul>
              )}

              <div className="mt-4 space-y-1.5 rounded-lg bg-gray-50 px-3 py-2.5">
                <IdRow label="Product" value={p.stripeProductId} />
                <IdRow label="Monthly" value={p.monthlyPriceId} />
                <IdRow label="Annual" value={p.annualPriceId} />
                <IdRow label="Per seat" value={p.perSeatPriceId} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                <SecondaryButton className="px-3! py-1.5! text-xs!" onClick={() => openEdit(p)}><FaEdit size={10} /> Edit</SecondaryButton>
                <SecondaryButton className="px-3! py-1.5! text-xs!" onClick={() => setToToggle(p)}>{p.isActive ? "Retire" : "Reactivate"}</SecondaryButton>
                <button
                  onClick={() => setToDelete(p)}
                  className="ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                >
                  <FaTrash size={10} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PlanModal isOpen={modalOpen} onClose={() => setModalOpen(false)} plan={editing} onSaved={() => { setNotice(null); reload(); }} />

      <ConfirmDialog
        isOpen={toToggle !== null}
        onClose={() => setToToggle(null)}
        title={toToggle?.isActive ? "Retire plan" : "Reactivate plan"}
        confirmLabel={toToggle?.isActive ? "Retire" : "Reactivate"}
        message={
          toToggle?.isActive
            ? <p>Retire <span className="font-semibold text-gray-800">{toToggle?.name}</span>? Company Admins will no longer see it as an option. Companies already on it keep their subscription.</p>
            : <p>Make <span className="font-semibold text-gray-800">{toToggle?.name}</span> available to subscribe to again?</p>
        }
        onConfirm={() => api.patch(`/billing/plans/${toToggle!._id}`, { isActive: !toToggle!.isActive })}
        onDone={reload}
      />

      <ConfirmDialog
        isOpen={toDelete !== null}
        onClose={() => setToDelete(null)}
        title="Delete plan"
        message={
          <>
            <p>Delete <span className="font-semibold text-gray-800">{toDelete?.name}</span> from the catalog?</p>
            <p className="mt-2 text-xs text-gray-500">
              If any company is on this plan it is retired instead of deleted. Nothing changes in Stripe either way.
            </p>
          </>
        }
        onConfirm={async () => {
          const res = await api.del<{ message?: string }>(`/billing/plans/${toDelete!._id}`);
          setNotice(res.message ?? "Plan deleted.");
        }}
        onDone={reload}
      />
    </div>
  );
}
