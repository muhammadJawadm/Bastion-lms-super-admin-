import { PageHeader } from "../components/ui/PageHeader";
import { UploadsTable } from "../components/data/UploadsTable";
import { useCompanyNames } from "../lib/useApi";

export default function Uploads() {
  const { names } = useCompanyNames();
  return (
    <div className="space-y-5">
      <PageHeader title="Uploads" subtitle="Every file stored in Cloudinary: course covers, lesson media, signatures, avatars and more." />
      <UploadsTable companyNames={names} />
    </div>
  );
}
