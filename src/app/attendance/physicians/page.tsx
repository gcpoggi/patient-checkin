import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { OfficeMonthPicker } from "@/components/OfficeMonthPicker";
import { PageHeader } from "@/components/PageHeader";
import { PhysicianSummaryTable, PhysicianTransactionsTable } from "@/components/PhysicianAttendanceTables";
import { SubNavTabs } from "@/components/SubNavTabs";
import { buildProviderAttendance } from "@/lib/reconcile";
import type { OfficeId } from "@/lib/types";

interface PhysiciansPageProps {
  searchParams: Promise<{
    office?: string | string[];
    month?: string | string[];
    physician?: string | string[];
  }>;
}

const tabs = [
  { label: "PT Grid", href: "/attendance" },
  { label: "PT Transactions", href: "/attendance/transactions" },
  { label: "Physicians", href: "/attendance/physicians" },
  { label: "Summary", href: "/attendance/summary" },
];

export default async function PhysiciansPage({ searchParams }: PhysiciansPageProps) {
  const query = await searchParams;
  const office: OfficeId = query.office === "ponce" ? "ponce" : "kendall";
  const requestedMonth = typeof query.month === "string" ? query.month : "2026-01";
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth) ? requestedMonth : "2026-01";
  const physician = typeof query.physician === "string" && query.physician ? query.physician : null;
  const { physicians, transactions } = buildProviderAttendance(office, month);
  const physicianTransactions = physician
    ? transactions.filter((transaction) => transaction.physician === physician)
    : [];
  const clearParams = new URLSearchParams({ office, month });

  return (
    <AppShell>
      <PageHeader title="Physician Attendance" subtitle="Attendance reports grouped by physician" />
      <SubNavTabs items={tabs} />
      <div className="mt-6"><OfficeMonthPicker current={office} month={month} /></div>
      <div className="mt-6">
        <PhysicianSummaryTable rows={physicians} office={office} month={month} />
      </div>

      {physician ? (
        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-navy">Transactions — {physician}</h2>
            <Link href={`/attendance/physicians?${clearParams.toString()}`} className="text-sm font-semibold text-teal-700 hover:text-teal-500 hover:underline">Clear</Link>
          </div>
          <PhysicianTransactionsTable rows={physicianTransactions} office={office} month={month} physician={physician} />
        </section>
      ) : null}
    </AppShell>
  );
}
