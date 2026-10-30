import { PageHeader } from "../components/ui/PageHeader";
import { UsersTable } from "../components/data/UsersTable";
import { useCompanyNames } from "../lib/useApi";

export default function Users() {
  const { names } = useCompanyNames();
  return (
    <div className="space-y-5">
      <PageHeader title="Users" subtitle="Every account on the platform: Company Admins, employees and Super Admins." />
      <UsersTable companyNames={names} />
    </div>
  );
}
