import { useState } from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { Tabs } from "../components/ui/Tabs";
import { Alert } from "../components/ui/States";
import { CoursesTable } from "../components/data/CoursesTable";
import { useCompanyNames } from "../lib/useApi";

export default function CourseLibrary() {
  const { names } = useCompanyNames();
  const [tab, setTab] = useState("all");

  return (
    <div className="space-y-5">
      <PageHeader title="Courses" subtitle="Courses across every company, plus Bastion's shared library." />
      <Tabs
        tabs={[{ key: "all", label: "All courses" }, { key: "library", label: "Bastion library" }]}
        active={tab}
        onChange={setTab}
      />
      {tab === "library" && (
        <Alert variant="info">
          Library courses (no company) are what Company Admins can copy into their own catalog. The API has no endpoint for a
          Super Admin to create or edit them, so they can only be seeded directly in the database.
        </Alert>
      )}
      {tab === "all" ? <CoursesTable companyNames={names} /> : <CoursesTable source="library" />}
    </div>
  );
}
