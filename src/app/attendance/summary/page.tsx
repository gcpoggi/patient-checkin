import { AppShell } from "@/components/AppShell";
import { OfficeMonthPicker } from "@/components/OfficeMonthPicker";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { SubNavTabs } from "@/components/SubNavTabs";
import { ProviderPatientsBarChart } from "@/components/charts/ProviderPatientsBarChart";
import { buildMonthlySummary } from "@/lib/reconcile";
import type { OfficeId } from "@/lib/types";

interface SummaryPageProps {
  searchParams: Promise<{ office?: string | string[]; month?: string | string[] }>;
}

const tabs = [
  { label: "PT Grid", href: "/attendance" },
  { label: "PT Transactions", href: "/attendance/transactions" },
  { label: "Doctor Visits", href: "/attendance/doctor-visits" },
  { label: "Physicians", href: "/attendance/physicians" },
  { label: "Summary", href: "/attendance/summary" },
];

export default async function SummaryPage({ searchParams }: SummaryPageProps) {
  const query = await searchParams;
  const office: OfficeId = query.office === "ponce" ? "ponce" : "kendall";
  const requestedMonth = typeof query.month === "string" ? query.month : "2026-01";
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth) ? requestedMonth : "2026-01";
  const summary = buildMonthlySummary(office, month);
  const combinedVisits = summary.combined.doctorVisits + summary.combined.ptVisits + summary.combined.evals;

  return (
    <AppShell>
      <PageHeader title="Monthly Summary" subtitle="Combined doctor and PT activity, with volume by physician" />
      <SubNavTabs items={tabs} />
      <div className="mt-6"><OfficeMonthPicker current={office} month={month} /></div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total patients" value={summary.combined.patients} sub="Distinct patients" variant="navy" />
        <StatCard label="Doctor visits" value={summary.combined.doctorVisits} />
        <StatCard label="PT visits" value={summary.combined.ptVisits} />
        <StatCard label="Evaluations" value={summary.combined.evals} />
      </section>

      <div className="mt-6"><ProviderPatientsBarChart summary={summary} /></div>
      <p className="mt-3 text-sm text-slate-600">
        Combined total: <span className="font-mono font-semibold tabular-nums text-navy">{summary.combined.patients}</span>{" "}
        distinct patients and <span className="font-mono font-semibold tabular-nums text-navy">{combinedVisits}</span> visits.
      </p>
    </AppShell>
  );
}
