import { AppShell } from "@/components/AppShell";
import { OfficeMonthPicker } from "@/components/OfficeMonthPicker";
import { PageHeader } from "@/components/PageHeader";
import { PtTransactionsTable } from "@/components/PtTransactionsTable";
import { SubNavTabs } from "@/components/SubNavTabs";
import { buildServiceTransactions } from "@/lib/reconcile";
import type { OfficeId } from "@/lib/types";

interface TransactionsPageProps {
  searchParams: Promise<{ office?: string | string[]; month?: string | string[] }>;
}
const tabs = [
  { label: "PT Grid", href: "/attendance" },
  { label: "PT Transactions", href: "/attendance/transactions" },
  { label: "Physicians", href: "/attendance/physicians" },
  { label: "Summary", href: "/attendance/summary" },
];

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const query = await searchParams;
  const office: OfficeId = query.office === "ponce" ? "ponce" : "kendall";
  const requestedMonth = typeof query.month === "string" ? query.month : "2026-01";
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth) ? requestedMonth : "2026-01";
  const rows = buildServiceTransactions(office, month).filter((row) => row.serviceType === "pt");
  const billed = rows.filter((row) => row.billingStatus !== "not_billed").length;

  return <AppShell>
    <PageHeader title="PT Transactions" subtitle="Every PT service line — filter, sort, export" />
    <SubNavTabs items={tabs} />
    <div className="mt-6"><OfficeMonthPicker current={office} month={month} /></div>
    <p className="mt-4 text-sm text-slate-600">
      <span className="font-mono font-semibold tabular-nums text-navy">{rows.length}</span> PT services ·{" "}
      <span className="font-mono font-semibold tabular-nums text-navy">{billed}</span> billed ·{" "}
      <span className="font-mono font-semibold tabular-nums text-missing">{rows.length - billed}</span> not billed
    </p>
    <div className="mt-4"><PtTransactionsTable rows={rows} exportFilename={`pt-transactions-${office}-${month}`} /></div>
  </AppShell>;
}
