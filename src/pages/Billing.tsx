import { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Tabs } from "../components/ui/Tabs";
import { Modal, FieldLabel, FieldInput, ModalBtn } from "../components/ui/Modal";
import { COMPANIES } from "../data/companies";
import {
  FaDollarSign, FaFileInvoice, FaExclamationTriangle, FaRedo,
  FaDownload, FaPlus, FaLock,
} from "react-icons/fa";

const PLAN_TIERS = [
  { name: "Starter",      price: "$45 / seat / mo",  seatLimit: "Up to 50",     features: "Course + form library, basic analytics" },
  { name: "Professional", price: "$65 / seat / mo",  seatLimit: "Up to 150",    features: "+ custom content, compliance dashboard" },
  { name: "Enterprise",   price: "Custom",           seatLimit: "Unlimited",    features: "+ white-labeling, API access, priority SLA" },
];

const INVOICES = [
  { id: "INV-2026-0812", client: COMPANIES[0].name, amount: "$12,400.00", status: "Paid",    date: "01 Aug 2026" },
  { id: "INV-2026-0811", client: COMPANIES[3].name, amount: "$19,890.00", status: "Paid",    date: "01 Aug 2026" },
  { id: "INV-2026-0810", client: COMPANIES[6].name, amount: "$10,150.00", status: "Paid",    date: "01 Aug 2026" },
  { id: "INV-2026-0809", client: COMPANIES[7].name, amount: "$1,240.00",  status: "Failed",  date: "01 Aug 2026" },
  { id: "INV-2026-0808", client: COMPANIES[4].name, amount: "$625.00",    status: "Overdue", date: "01 Aug 2026" },
  { id: "INV-2026-0807", client: COMPANIES[1].name, amount: "$4,940.00",  status: "Paid",    date: "01 Jul 2026" },
];

function statusBadge(s: string): "success" | "danger" | "warning" {
  if (s === "Paid") return "success";
  if (s === "Failed") return "danger";
  return "warning";
}
function maskedPaymentMethod(pm: (typeof COMPANIES)[number]["billing"]["paymentMethod"]) {
  if (pm.type === "card") return `${pm.brand} •••• ${pm.last4}`;
  if (pm.type === "ach") return `${pm.bankName} ${pm.maskedAccountNumber}`;
  if (pm.type === "invoice") return "Invoice / manual";
  return "None on file";
}

function AssignPlanContent() {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Company</FieldLabel>
        <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none cursor-pointer">
          {COMPANIES.map((c) => <option key={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Plan</FieldLabel>
          <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none cursor-pointer">
            {PLAN_TIERS.map((p) => <option key={p.name}>{p.name}</option>)}
          </select>
        </div>
        <div><FieldLabel>Seat Count</FieldLabel><FieldInput type="number" defaultValue={50} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><FieldLabel>Discount / Credit (%)</FieldLabel><FieldInput type="number" placeholder="0" /></div>
        <div><FieldLabel>Renewal Date</FieldLabel><FieldInput type="date" /></div>
      </div>
    </div>
  );
}

export default function Billing() {
  const [tab, setTab] = useState("overview");
  const [assignOpen, setAssignOpen] = useState(false);

  const mrr = COMPANIES.reduce((s, c) => s + c.billing.recurringPlatformFee * (1 - c.billing.discountPercent / 100), 0);
  const outstanding = COMPANIES.reduce((s, c) => s + c.billing.outstandingBalance, 0);
  const failedCount = COMPANIES.filter((c) => c.paymentStatus === "Failed").length;
  const failedPayments = COMPANIES.filter((c) => c.billing.outstandingBalance > 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing &amp; Contracts</h1>
          <p className="mt-1 text-sm text-gray-500">Plans, seats, contracts, invoices and payment health across every client.</p>
        </div>
        <button
          onClick={() => setAssignOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <FaPlus size={12} /> Assign Plan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Monthly Revenue",     value: `$${Math.round(mrr).toLocaleString()}`, icon: FaDollarSign,          bg: "bg-green-50", color: "text-green-600" },
          { label: "Outstanding Invoices", value: `$${outstanding.toLocaleString()}`,     icon: FaFileInvoice,         bg: "bg-orange-50", color: "text-orange-600" },
          { label: "Failed Payments",      value: failedCount, icon: FaExclamationTriangle, bg: "bg-red-50", color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-2xl font-bold text-gray-900">{s.value}</p><p className="mt-0.5 text-xs font-medium text-gray-500">{s.label}</p></div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}><s.icon size={16} className={s.color} /></div>
            </div>
          </div>
        ))}
      </div>

      <Tabs
        tabs={[
          { key: "overview", label: "Plan Tiers" },
          { key: "contracts", label: "Contracts", count: COMPANIES.length },
          { key: "invoices", label: "Invoices" },
          { key: "failed",   label: "Failed Payments", count: failedPayments.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PLAN_TIERS.map((p) => (
            <div key={p.name} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-gray-900">{p.name}</h3>
              <p className="mt-1 text-lg font-semibold text-blue-600">{p.price}</p>
              <p className="mt-1 text-xs text-gray-400">Seats: {p.seatLimit}</p>
              <p className="mt-3 text-sm text-gray-600">{p.features}</p>
              <button className="mt-4 w-full rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">Edit Tier</button>
            </div>
          ))}
        </div>
      )}

      {tab === "contracts" && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50/70">
                <tr>{["Client", "Plan", "Billing Frequency", "Recurring Fee", "Discount", "PO Reference", "Payment Method", "Renewal"].map((h) => <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {COMPANIES.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-gray-800">{c.name}</td>
                    <td className="px-5 py-3"><Badge variant="info">{c.plan}</Badge></td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-500">{c.billing.billingFrequency}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-gray-700">${c.billing.recurringPlatformFee.toLocaleString()}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-500">{c.billing.discountPercent}%</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-500">{c.billing.poReference}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1.5"><FaLock size={9} className="text-gray-300" /> {maskedPaymentMethod(c.billing.paymentMethod)}</span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-500">{c.renewalDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400 flex items-center gap-1.5">
            <FaLock size={9} /> Card and ACH details are collected via payment-provider-hosted fields — only masked summaries and processor tokens are stored here.
          </div>
        </div>
      )}

      {tab === "invoices" && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50/70">
                <tr>{["Invoice", "Client", "Amount", "Status", "Date", ""].map((h) => <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {INVOICES.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="whitespace-nowrap px-5 py-3 text-sm font-mono text-gray-700">{inv.id}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{inv.client}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-gray-800">{inv.amount}</td>
                    <td className="px-5 py-3"><Badge variant={statusBadge(inv.status)}>{inv.status}</Badge></td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-500">{inv.date}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3 text-xs font-medium">
                        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"><FaDownload size={10} /> PDF</button>
                        {inv.status !== "Paid" && <button className="text-green-600 hover:text-green-800 transition-colors">Mark Paid</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "failed" && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          {failedPayments.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-400">No outstanding balances.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {failedPayments.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50"><FaExclamationTriangle size={15} className="text-red-500" /></div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.billing.suspensionRules} · ${c.billing.outstandingBalance.toLocaleString()} outstanding</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
                      <FaRedo size={10} /> Retry Now
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Modal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign Plan"
        footer={<><ModalBtn variant="secondary" onClick={() => setAssignOpen(false)}>Cancel</ModalBtn><ModalBtn variant="primary" onClick={() => setAssignOpen(false)}>Save</ModalBtn></>}
      >
        <AssignPlanContent />
      </Modal>
    </div>
  );
}
