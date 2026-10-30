import { PageHeader } from "../components/ui/PageHeader";
import { EnrollmentsTable } from "../components/data/EnrollmentsTable";
import { useCompanyNames } from "../lib/useApi";

export default function Enrollments() {
  const { names } = useCompanyNames();
  return (
    <div className="space-y-5">
      <PageHeader title="Enrollments" subtitle="Who is assigned to which course, across every company." />
      <EnrollmentsTable companyNames={names} />
    </div>
  );
}
