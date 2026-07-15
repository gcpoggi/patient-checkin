import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { MenuCard } from "@/components/MenuCard";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { buildAttendanceMonth, reconcileClaims } from "@/lib/reconcile";

export const dynamic = "force-dynamic";

const menuItems = [
  { href: "/check-in", title: "Register Check-In", description: "Document patient arrivals and keep the daily visit record complete." },
  { href: "/attendance", title: "Attendance", description: "Review scheduled visits, evaluations, attendance, and no-shows." },
  { href: "/claims", title: "Claims", description: "Cross-check services against billing data and resolve exceptions." },
  { href: "/reports", title: "Power BI Reports", description: "Open financial and operational reporting for practice oversight." },
] as const;

export default function Home() {
  const attendance = buildAttendanceMonth("kendall", "2026-01");
  const { kpis } = reconcileClaims("2026-01", "kendall");
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const statuses = ["paid", "pending", "missing", "phantom"] as const;

  return (
    <AppShell>
      <PageHeader title="Dashboard" subtitle="Practice control layer for patient operations & billing oversight" />
      <section className="mt-8"><p className="mb-4 text-xs font-semibold uppercase tracking-widest text-teal-600">Practice operations</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{menuItems.map((item) => <MenuCard key={item.href} {...item} />)}</div></section>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="January 2026 highlights">
        <StatCard label="Visits MTD" value={attendance.monthTotals.attended} sub="Kendall · January 2026" />
        <StatCard label="Attendance rate" value={`${Math.round(attendance.monthTotals.attendanceRate * 100)}%`} sub="Month to date" variant="navy" />
        <StatCard label="Claims at risk" value={money.format(kpis.atRiskAmount)} sub="Phantom + estimated missing" />
        <StatCard label="Collection rate" value={`${Math.round(kpis.collectionRate * 100)}%`} sub="Collected ÷ matched billed" />
      </section>
      <section className="mt-6 flex flex-col gap-4 rounded-xl border border-mist-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between" aria-labelledby="month-end-status">
        <div><p id="month-end-status" className="text-xs font-semibold uppercase tracking-widest text-teal-600">Month-end status</p><p className="mt-1 text-sm text-slate-500">Kendall · January 2026 reconciliation</p></div>
        <div className="flex flex-wrap gap-2">{statuses.map((status) => <Link key={status} href={`/claims?month=2026-01&office=kendall&status=${status}`} className="inline-flex items-center gap-2 rounded-full border border-mist-200 bg-mist-50 py-1 pl-1 pr-3 transition hover:border-teal-300 hover:bg-mist-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-hpp"><StatusBadge status={status} /><span className="font-mono text-xs font-semibold tabular-nums text-navy">{kpis[status]}</span></Link>)}</div>
      </section>
    </AppShell>
  );
}
