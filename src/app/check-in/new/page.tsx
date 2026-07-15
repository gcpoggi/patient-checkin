import { AppShell } from "@/components/AppShell";
import { NewPatientForm } from "@/components/NewPatientForm";
import { PageHeader } from "@/components/PageHeader";

interface NewPatientSearchParams {
  name?: string;
  dob?: string;
  phone?: string;
}

export default async function NewPatientPage({ searchParams }: { searchParams: Promise<NewPatientSearchParams> }) {
  const { name = "", dob = "", phone = "" } = await searchParams;
  return (
    <AppShell>
      <PageHeader title="Register New Patient" subtitle="Not found in file — add the patient, then record the visit" />
      <NewPatientForm initial={{ name, dob, phone }} />
    </AppShell>
  );
}
