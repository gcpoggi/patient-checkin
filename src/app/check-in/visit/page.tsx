import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { VisitForm } from "@/components/VisitForm";
import { getStore } from "@/lib/store";

export default async function VisitPage({ searchParams }: { searchParams: Promise<{ patientId?: string }> }) {
  const { patientId } = await searchParams;
  const patient = getStore().patients.find((candidate) => candidate.id === patientId);

  return (
    <AppShell>
      <PageHeader title="Register Attendance" />
      {patient ? <VisitForm patient={patient} /> : (
        <div className="mt-8 rounded-xl border border-mist-200 bg-white p-6 shadow-sm">
          <p className="text-slate-700">We could not find that patient.</p>
          <Link href="/check-in" className="mt-4 inline-flex font-semibold text-teal-600 hover:text-teal-700">Back to check-in</Link>
        </div>
      )}
    </AppShell>
  );
}
