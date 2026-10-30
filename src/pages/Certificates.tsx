import { PageHeader } from "../components/ui/PageHeader";
import { CertificatesTable } from "../components/data/CertificatesTable";
import { useCompanyNames } from "../lib/useApi";

export default function Certificates() {
  const { names } = useCompanyNames();
  return (
    <div className="space-y-5">
      <PageHeader title="Certificates" subtitle="Certificates issued on course completion or manually by Company Admins. View or revoke." />
      <CertificatesTable companyNames={names} />
    </div>
  );
}
