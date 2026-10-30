import { useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { api, errorMessage } from "../../lib/api";
import type { Plan } from "../../lib/types";
import { Modal, FieldLabel, FieldInput, FieldTextarea, ModalBtn } from "../ui/Modal";
import { Alert, Spinner } from "../ui/States";

export const STRIPE_PRODUCTS_URL = "https://dashboard.stripe.com/products";

interface FormState {
  name: string;
  description: string;
  stripeProductId: string;
  monthlyPriceId: string;
  annualPriceId: string;
  perSeatPriceId: string;
  seatLimit: string; // "" = unlimited
  features: string;  // one per line
}

function toForm(p?: Plan | null): FormState {
  return {
    name: p?.name ?? "",
    description: p?.description ?? "",
    stripeProductId: p?.stripeProductId ?? "",
    monthlyPriceId: p?.monthlyPriceId ?? "",
    annualPriceId: p?.annualPriceId ?? "",
    perSeatPriceId: p?.perSeatPriceId ?? "",
    seatLimit: p?.seatLimit === null || p?.seatLimit === undefined ? "" : String(p.seatLimit),
    features: (p?.features ?? []).join("\n"),
  };
}

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  // null = create a new plan
  plan: Plan | null;
  onSaved: () => void;
}

export function PlanModal({ isOpen, onClose, plan, onSaved }: PlanModalProps) {
  const [form, setForm] = useState<FormState>(() => toForm(plan));
  const [openedFor, setOpenedFor] = useState<Plan | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = plan !== null;

  // Re-seed the form each time it opens for a different plan (or for "create").
  if (isOpen && openedFor !== plan) {
    setOpenedFor(plan);
    setForm(toForm(plan));
    setError(null);
  }
  if (!isOpen && openedFor !== undefined) setOpenedFor(undefined);

  const bind = (k: keyof FormState) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value })),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const seat = form.seatLimit.trim();
    if (seat && (!Number.isInteger(Number(seat)) || Number(seat) < 1)) {
      setError("Seat limit must be a whole number of 1 or more. Leave it blank for unlimited.");
      return;
    }
    setBusy(true);
    setError(null);
    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      monthlyPriceId: form.monthlyPriceId.trim(),
      annualPriceId: form.annualPriceId.trim(),
      perSeatPriceId: form.perSeatPriceId.trim(),
      seatLimit: seat ? Number(seat) : null,
      features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
    };
    try {
      if (isEdit) {
        // PATCH doesn't accept stripeProductId — the Stripe Product is fixed once registered.
        await api.patch(`/billing/plans/${plan._id}`, body);
      } else {
        await api.post("/billing/plans", { ...body, stripeProductId: form.stripeProductId.trim() });
      }
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
      title={isEdit ? "Edit Plan" : "Add Plan"}
      size="lg"
      footer={
        <>
          <ModalBtn variant="secondary" type="button" onClick={onClose} disabled={busy}>Cancel</ModalBtn>
          <ModalBtn variant="primary" type="submit" form="plan-form" disabled={busy} className="flex items-center gap-2 disabled:opacity-50">
            {busy && <Spinner />} {isEdit ? "Save Changes" : "Register Plan"}
          </ModalBtn>
        </>
      }
    >
      <form id="plan-form" onSubmit={submit} className="space-y-5">
        <Alert variant="info">
          This form only registers IDs from Stripe. Create the Product and its Prices in the Stripe Dashboard first, then
          paste their IDs here.{" "}
          <a href={STRIPE_PRODUCTS_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold underline">
            Open Stripe Products <FaExternalLinkAlt size={9} />
          </a>
        </Alert>
        {error && <Alert variant="error">{error}</Alert>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><FieldLabel>Plan name</FieldLabel><FieldInput required {...bind("name")} placeholder="e.g. Professional" /></div>
          <div><FieldLabel>Seat limit</FieldLabel><FieldInput type="number" min={1} {...bind("seatLimit")} placeholder="Blank = unlimited" /></div>
          <div className="sm:col-span-2"><FieldLabel>Description</FieldLabel><FieldInput {...bind("description")} /></div>
        </div>

        <div>
          <p className="mb-3 border-b border-gray-100 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Stripe IDs</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldLabel>Product ID</FieldLabel>
              <FieldInput required={!isEdit} disabled={isEdit} {...bind("stripeProductId")} placeholder="prod_…" className="font-mono" />
              {isEdit && <p className="mt-1 text-[11px] text-gray-400">The Product can't be changed after registration. Create a new plan for a different Product.</p>}
            </div>
            <div><FieldLabel>Monthly price ID</FieldLabel><FieldInput {...bind("monthlyPriceId")} placeholder="price_…" className="font-mono" /></div>
            <div><FieldLabel>Annual price ID</FieldLabel><FieldInput {...bind("annualPriceId")} placeholder="price_…" className="font-mono" /></div>
            <div className="sm:col-span-2">
              <FieldLabel>Per-seat price ID</FieldLabel>
              <FieldInput {...bind("perSeatPriceId")} placeholder="price_… (only if this plan bills per mobile-user seat)" className="font-mono" />
            </div>
          </div>
        </div>

        <div>
          <FieldLabel>Features (one per line)</FieldLabel>
          <FieldTextarea rows={4} {...bind("features")} placeholder={"Course + form library\nCompliance dashboard\nCustom branding"} />
        </div>
      </form>
    </Modal>
  );
}
