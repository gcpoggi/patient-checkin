import { AppShell } from "@/components/AppShell";
import { AttendanceGrid } from "@/components/AttendanceGrid";
import { OfficeMonthPicker } from "@/components/OfficeMonthPicker";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { SubNavTabs } from "@/components/SubNavTabs";
import { AttendanceBarChart } from "@/components/charts/AttendanceBarChart";
import { buildAttendanceMonth } from "@/lib/reconcile";
import type { OfficeId } from "@/lib/types";

interface AttendancePageProps {
  searchParams: Promise<{ office?: string | string[]; month?: string | string[] }>;
}

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const query = await searchParams;
  const office: OfficeId = query.office === "ponce" ? "ponce" : "kendall";
  const requestedMonth = typeof query.month === "string" ? query.month : "2026-01";
  const month = /^2026-(01|02)$/.test(requestedMonth) ? requestedMonth : "2026-01";
  const attendance = buildAttendanceMonth(office, month);
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));
  const noShowRate = attendance.monthTotals.scheduled
    ? attendance.monthTotals.noShows / attendance.monthTotals.scheduled
    : 0;
  const hasActivity = attendance.monthTotals.scheduled > 0 || attendance.monthTotals.attended > 0;

  return (
    <AppShell>
      <PageHeader title="Attendance" subtitle="Scheduled vs attended vs evaluated - by office & month" />
      <SubNavTabs items={[
        { label: "PT Grid", href: "/attendance" },
        { label: "PT Transactions", href: "/attendance/transactions" },
        { label: "Doctor Visits", href: "/attendance/doctor-visits" },
        { label: "Physicians", href: "/attendance/physicians" },
        { label: "Summary", href: "/attendance/summary" },
      ]} />
      <div className="mt-6"><OfficeMonthPicker current={office} month={month} /></div>

      <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-navy px-5 py-4 text-mist-100">
        <div><p className="text-xs font-semibold uppercase tracking-widest text-teal-300">Reporting period</p><p className="mt-1 font-display text-xl text-white">{office === "kendall" ? "Kendall" : "Ponce"} · {monthLabel}</p></div>
        <div className="rounded-lg border border-white/15 bg-white/10 px-4 py-2"><span className="mr-3 text-xs font-semibold uppercase tracking-widest text-sky-hpp">{month.slice(0, 4)} YTD total</span><span className="font-mono text-2xl font-bold tabular-nums text-white">{attendance.yearToDate.attended}</span></div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Attended PT" value={attendance.monthTotals.attended} variant="navy" />
        <StatCard label="PT FU" value={attendance.monthTotals.ptFu} sub="Attended - evals" />
        <StatCard label="Evals" value={attendance.monthTotals.evals} sub="Initial evaluations" />
        <StatCard label="Scheduled" value={attendance.monthTotals.scheduled} sub={`${(attendance.monthTotals.attendanceRate * 100).toFixed(1)}% attendance`} />
        <StatCard label="No-show rate" value={`${(noShowRate * 100).toFixed(1)}%`} sub={`${attendance.monthTotals.noShows} no-shows`} />
      </section>

      {hasActivity ? (
        <>
          <div className="mt-6"><AttendanceBarChart attendance={attendance} /></div>
          <div className="mt-6"><AttendanceGrid attendance={attendance} /></div>
        </>
      ) : (
        <section className="mt-6 rounded-xl border border-dashed border-mist-200 bg-white px-6 py-16 text-center shadow-sm">
          <h2 className="font-display text-xl font-semibold text-navy">No attendance activity</h2>
          <p className="mt-2 text-sm text-slate-500">There are no scheduled appointments or recorded visits for this office and month.</p>
        </section>
      )}
    </AppShell>
  );
}
