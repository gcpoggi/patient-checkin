import { AppShell } from "@/components/AppShell";
import { CheckInForm } from "@/components/CheckInForm";
import { PageHeader } from "@/components/PageHeader";

export default function CheckInPage() {
  return (
    <AppShell>
      <PageHeader title="Register Check-In" subtitle="Capture the visit: Name, DOB, Phone" />
      <CheckInForm />
    </AppShell>
  );
}
