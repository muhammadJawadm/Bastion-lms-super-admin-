import { PageHeader } from "../components/ui/PageHeader";
import { FormsTable } from "../components/data/FormsTable";
import { useCompanyNames } from "../lib/useApi";

export default function Forms() {
  const { names } = useCompanyNames();
  return (
    <div className="space-y-5">
      <PageHeader title="Forms" subtitle="Inspection and audit forms built by every company. View or delete." />
      <FormsTable companyNames={names} />
    </div>
  );
}
