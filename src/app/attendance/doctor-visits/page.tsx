import { AppShell } from "@/components/AppShell";
import { DoctorVisitsTable } from "@/components/DoctorVisitsTable";
import { OfficeMonthPicker } from "@/components/OfficeMonthPicker";
import { PageHeader } from "@/components/PageHeader";
import { SubNavTabs } from "@/components/SubNavTabs";
import { buildDoctorVisits } from "@/lib/reconcile";
import type { OfficeId } from "@/lib/types";

interface DoctorVisitsPageProps {
  searchParams: Promise<{ office?: string | string[]; month?: string | string[] }>;
}

const tabs = [
  { label: "PT Grid", href: "/attendance" },
  { label: "PT Transactions", href: "/attendance/transactions" },
  { label: "Doctor Visits", href: "/attendance/doctor-visits" },
  { label: "Physicians", href: "/attendance/physicians" },
  { label: "Summary", href: "/attendance/summary" },
];

export default async function DoctorVisitsPage({ searchParams }: DoctorVisitsPageProps) {
  const query = await searchParams;
  const office: OfficeId = query.office === "ponce" ? "ponce" : "kendall";
  const requestedMonth = typeof query.month === "string" ? query.month : "2026-01";
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth) ? requestedMonth : "2026-01";
  const rows = buildDoctorVisits(office, month);
  const initial = rows.filter((row) => row.eventType === "doctor").length;
  const followup = rows.filter((row) => row.eventType === "followup").length;
  const billed = rows.filter((row) => row.billingStatus !== "not_billed").length;

  return (
    <AppShell>
      <PageHeader
        title="Doctor Visits"
        subtitle="Every orthopedist office visit: Initial + Follow-up - filter, sort, export"
      />
      <SubNavTabs items={tabs} />
      <div className="mt-6"><OfficeMonthPicker current={office} month={month} /></div>
      <p className="mt-4 text-sm text-slate-600">
        <span className="font-mono font-semibold tabular-nums text-navy">{rows.length}</span> doctor visits ·{" "}
        <span className="font-mono font-semibold tabular-nums text-navy">{initial}</span> Initial ·{" "}
        <span className="font-mono font-semibold tabular-nums text-navy">{followup}</span> Follow-up ·{" "}
        <span className="font-mono font-semibold tabular-nums text-navy">{billed}</span> billed
      </p>
      <div className="mt-4">
        <DoctorVisitsTable rows={rows} exportFilename={`doctor-visits-${office}-${month}`} />
      </div>
    </AppShell>
  );
}
