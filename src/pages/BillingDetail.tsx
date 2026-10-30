import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  FaArrowLeft, FaExclamationTriangle, FaClock, FaBan, FaCreditCard, FaUniversity,
  FaExternalLinkAlt, FaFilePdf, FaBuilding,
} from "react-icons/fa";
import { api, ApiError, errorMessage } from "../lib/api";
import { useApi } from "../lib/useApi";
import {
  formatDate, formatMoney, titleCase, SUBSCRIPTION_STATUS_LABEL, subscriptionStatusVariant, invoiceStatusVariant,
} from "../lib/format";
import type { ApiResponse, PaymentMethod, TenantBillingDetail } from "../lib/types";
import { Badge } from "../components/ui/Badge";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Modal, FieldLabel, FieldInput, ModalBtn } from "../components/ui/Modal";
import { Alert, LoadingBlock, ErrorBlock, EmptyBlock, Spinner } from "../components/ui/States";
import { TableCard, Th, Td, SecondaryButton, DangerButton } from "../components/ui/PageHeader";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-400">{label}</p>
      <div className="mt-0.5 text-sm text-gray-800">{children}</div>
    </div>
  );
}

function paymentMethodLabel(pm: PaymentMethod) {
  if (pm.type === "bank_account") return `${pm.bankName ?? "Bank"}${pm.accountType ? ` ${pm.accountType}` : ""} •••• ${pm.last4 ?? "—"}`;
  return `${titleCase(pm.brand ?? "Card")} •••• ${pm.last4 ?? "—"}`;
}

function toDateInput(d: Date) {
  return d.toISOString().slice(0, 10);
}

function GracePeriodModal({ isOpen, onClose, companyId, current, onSaved }: {
  isOpen: boolean; onClose: () => void; companyId: string; current: string | null; onSaved: () => void;
}) {
  const [until, setUntil] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(false);

  // Seed with the existing grace date, or two weeks out, each time it opens.
  if (isOpen && !wasOpen) {
    setWasOpen(true);
    setError(null);
    const base = current ? new Date(current) : new Date();
    if (!current) base.setDate(base.getDate() + 14);
    setUntil(toDateInput(base));
  }
  if (!isOpen && wasOpen) setWasOpen(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // End of the chosen day, sent as an ISO timestamp.
      const iso = new Date(`${until}T23:59:59`).toISOString();
      await api.post(`/billing/tenants/${companyId}/grace-period`, { until: iso });
      setBusy(false);
      onClose();
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { if (!busy) onClose(); }}
      title="Extend grace period"
      size="sm"
      footer={
        <>
          <ModalBtn variant="secondary" type="button" onClick={onClose} disabled={busy}>Cancel</ModalBtn>
          <ModalBtn variant="primary" type="submit" form="grace-form" disabled={busy || !until} className="flex items-center gap-2 disabled:opacity-50">
            {busy && <Spinner />} Save
          </ModalBtn>
        </>
      }
    >
      <form id="grace-form" onSubmit={submit} className="space-y-3">
        {error && <Alert variant="error">{error}</Alert>}
        <p className="text-sm text-gray-600">
          Keep this company's access open while a payment is being sorted out, for example a wire transfer that's in transit.
        </p>
        <div>
          <FieldLabel>Grace period until</FieldLabel>
          <FieldInput type="date" required min={toDateInput(new Date())} value={until} onChange={(e) => setUntil(e.target.value)} />
        </div>
      </form>
    </Modal>
  );
}

export default function BillingDetail() {
  const { companyId = "" } = useParams();
  const [graceOpen, setGraceOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const { data, loading, error, reload } = useApi<ApiResponse<TenantBillingDetail>>(`/billing/tenants/${companyId}`);
  const detail = data?.data;

  const back = (
    <Link to="/billing" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
      <FaArrowLeft size={11} /> Billing
    </Link>
  );

  if (loading) return <LoadingBlock label="Loading billing…" />;
  if (error || !detail) {
    return (
      <div className="space-y-4">
        {back}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <ErrorBlock message={error ?? "No billing record for this company."} onRetry={reload} />
          <div className="pb-6 text-center">
            <Link to={`/companies/${companyId}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">View company</Link>
          </div>
        </div>
      </div>
    );
  }

  const { billing: b, invoices, paymentMethods } = detail;
  const companyName = b.companyId?.name ?? "This company";
  const atRisk = b.status === "past_due" || b.status === "unpaid";
  const canCancel = Boolean(b.stripeSubscriptionId) && b.status !== "canceled";
  const graceActive = b.gracePeriodUntil ? new Date(b.gracePeriodUntil).getTime() > new Date().getTime() : false;
  const plan = b.planId;

  return (
    <div className="space-y-6">
      {back}

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{companyName}</h1>
            <Badge variant={subscriptionStatusVariant(b.status)}>{SUBSCRIPTION_STATUS_LABEL[b.status] ?? b.status}</Badge>
            {b.cancelAtPeriodEnd && <Badge variant="warning">Cancels at period end</Badge>}
          </div>
          <p className="mt-0.5 text-sm text-gray-500">{b.companyId?.contactEmail ?? "No contact email"}</p>
          {b.companyId?._id && (
            <Link to={`/companies/${b.companyId._id}`} className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800">
              <FaBuilding size={10} /> Company profile
            </Link>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <SecondaryButton onClick={() => setGraceOpen(true)}><FaClock size={12} /> Extend grace period</SecondaryButton>
          <DangerButton onClick={() => setCancelOpen(true)} disabled={!canCancel} title={canCancel ? undefined : "No active subscription to cancel"}>
            <FaBan size={11} /> Force cancel
          </DangerButton>
        </div>
      </div>

      {atRisk && (
        <Alert variant="error">
          <span className="flex items-start gap-2">
            <FaExclamationTriangle size={13} className="mt-0.5 shrink-0" />
            <span>
              Payment is {b.status === "past_due" ? "past due" : "unpaid"}. This company is at risk of losing access
              {graceActive ? `, but its grace period runs until ${formatDate(b.gracePeriodUntil)}.` : ". Consider a grace period if payment is on its way."}
            </span>
          </span>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">Subscription</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Plan">{plan?.name ?? "—"}</Field>
            <Field label="Seat limit">{b.seatLimit ?? plan?.seatLimit ?? "Unlimited"}</Field>
            <Field label="Current period ends">{formatDate(b.currentPeriodEnd)}</Field>
            <Field label="Grace period">{b.gracePeriodUntil ? `${graceActive ? "Until" : "Ended"} ${formatDate(b.gracePeriodUntil)}` : "None"}</Field>
            <Field label="Collection method">{b.collectionMethod ? titleCase(b.collectionMethod) : "—"}</Field>
            <Field label="PO reference">{b.poReference || "—"}</Field>
            <Field label="Billing contact">
              {b.billingContact?.name || b.billingContact?.email ? (
                <><p>{b.billingContact?.name || "—"}</p><p className="text-xs text-gray-400">{b.billingContact?.email}</p></>
              ) : "—"}
            </Field>
            <Field label="Stripe customer"><span className="font-mono text-xs">{b.stripeCustomerId || "—"}</span></Field>
            <Field label="Stripe subscription"><span className="font-mono text-xs">{b.stripeSubscriptionId || "—"}</span></Field>
          </div>
          {plan?.features && plan.features.length > 0 && (
            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="mb-2 text-xs text-gray-400">Plan features</p>
              <div className="flex flex-wrap gap-1.5">{plan.features.map((f) => <Badge key={f} variant="neutral">{f}</Badge>)}</div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">Payment methods</h2>
          {paymentMethods.length === 0 ? (
            <p className="text-sm text-gray-400">None on file.</p>
          ) : (
            <ul className="space-y-2.5">
              {paymentMethods.map((pm) => (
                <li key={pm._id} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
                  {pm.type === "bank_account" ? <FaUniversity size={14} className="shrink-0 text-gray-400" /> : <FaCreditCard size={14} className="shrink-0 text-gray-400" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-gray-800">{paymentMethodLabel(pm)}</p>
                    {pm.type === "card" && pm.expMonth && pm.expYear && (
                      <p className="text-xs text-gray-400">Expires {String(pm.expMonth).padStart(2, "0")}/{pm.expYear}</p>
                    )}
                  </div>
                  {pm.isDefault && <Badge variant="info">Default</Badge>}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-[11px] text-gray-400">Display details only. Card and bank numbers stay in Stripe.</p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Invoices</h2>
        <TableCard footer={invoices.length ? `${invoices.length} invoice${invoices.length === 1 ? "" : "s"}` : undefined}>
          {invoices.length === 0 ? <EmptyBlock label="No invoices yet." /> : (
            <table className="min-w-full">
              <thead className="bg-gray-50/70">
                <tr><Th>Invoice</Th><Th>Amount due</Th><Th>Amount paid</Th><Th>Status</Th><Th>Due</Th><Th>Paid</Th><Th /></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <tr key={inv._id} className={inv.status === "payment_failed" ? "bg-red-50/50" : "hover:bg-gray-50/60"}>
                    <Td className="whitespace-nowrap font-mono text-xs">{inv.number || inv.stripeInvoiceId}</Td>
                    <Td className="whitespace-nowrap font-medium text-gray-800">{formatMoney(inv.amountDue, inv.currency)}</Td>
                    <Td className="whitespace-nowrap">{formatMoney(inv.amountPaid, inv.currency)}</Td>
                    <Td><Badge variant={invoiceStatusVariant(inv.status)}>{titleCase(inv.status)}</Badge></Td>
                    <Td className="whitespace-nowrap text-gray-500">{formatDate(inv.dueDate)}</Td>
                    <Td className="whitespace-nowrap text-gray-500">{formatDate(inv.paidAt)}</Td>
                    <Td>
                      <div className="flex items-center gap-3 text-xs font-medium">
                        {inv.hostedInvoiceUrl && (
                          <a href={inv.hostedInvoiceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                            <FaExternalLinkAlt size={9} /> View
                          </a>
                        )}
                        {inv.pdfUrl && (
                          <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                            <FaFilePdf size={10} /> PDF
                          </a>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TableCard>
      </div>

      <GracePeriodModal isOpen={graceOpen} onClose={() => setGraceOpen(false)} companyId={companyId} current={b.gracePeriodUntil} onSaved={reload} />

      <ConfirmDialog
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Force cancel subscription"
        confirmLabel="Cancel subscription now"
        requireText={companyName}
        message={
          <>
            <p>
              This <span className="font-semibold text-gray-800">immediately</span> cancels {companyName}'s Stripe subscription.
              It doesn't wait for the end of the billing period.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Use this only for contract termination. For a routine cancellation, the Company Admin cancels from their own billing page.
            </p>
          </>
        }
        onConfirm={async () => {
          try {
            await api.post(`/billing/tenants/${companyId}/cancel`);
          } catch (err) {
            if (err instanceof ApiError && err.status === 404) throw new Error("This company has no active subscription to cancel.", { cause: err });
            throw err;
          }
        }}
        onDone={reload}
      />
    </div>
  );
}
