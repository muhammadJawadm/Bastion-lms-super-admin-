import { useState } from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { Tabs } from "../components/ui/Tabs";
import { TenantBillingList } from "../components/billing/TenantBillingList";
import { PlanCatalog } from "../components/billing/PlanCatalog";

// Oversight console only — companies pay through Stripe from the Company Admin app.
// Nothing here collects card details or starts a payment.
export default function Billing() {
  const [tab, setTab] = useState("companies");

  return (
    <div className="space-y-5">
      <PageHeader title="Billing" subtitle="Every company's subscription to the platform, and the plans they can choose from." />
      <Tabs
        tabs={[
          { key: "companies", label: "Companies billing" },
          { key: "plans", label: "Plan catalog" },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === "companies" ? <TenantBillingList /> : <PlanCatalog />}
    </div>
  );
}
