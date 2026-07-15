import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ClaimsTabs } from "@/components/ClaimsTabs";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { ClaimsDonut } from "@/components/charts/ClaimsDonut";
import { CollectionsBar } from "@/components/charts/CollectionsBar";
import { reconcileClaims } from "@/lib/reconcile";
import type { OfficeId, ReconStatus } from "@/lib/types";

interface ClaimsPageProps {
  searchParams: Promise<{ month?: string | string[]; office?: string | string[]; status?: string | string[] }>;
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const statuses: ReconStatus[] = ["paid", "pending", "missing", "phantom"];

export default async function ClaimsPage({ searchParams }: ClaimsPageProps) {
  const query = await searchParams;
  const requestedMonth = typeof query.month === "string" ? query.month : "2026-01";
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth) ? requestedMonth : "2026-01";
  const office: OfficeId | undefined = query.office === "kendall" || query.office === "ponce" ? query.office : undefined;
  const requestedStatus = typeof query.status === "string" ? query.status as ReconStatus : "paid";
  const activeStatus = statuses.includes(requestedStatus) ? requestedStatus : "paid";
  const { rows, kpis } = reconcileClaims(month, office);
  const counts = { paid: kpis.paid, pending: kpis.pending, missing: kpis.missing, phantom: kpis.phantom };

  return (
    <AppShell>
      <PageHeader title="Claims" subtitle="Month-end cross-check — Paid · Pending · Missing · Phantom" actions={<Link href="/claims/upload" className="rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600">Feed Claims Data</Link>} />
      <form className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-mist-200 bg-white p-4 shadow-sm">
        <label className="text-sm font-semibold text-navy">Month<select name="month" defaultValue={month} className="mt-1 block rounded-lg border border-mist-200 bg-white px-3 py-2 font-normal outline-none focus:border-sky-hpp focus:ring-2 focus:ring-sky-hpp/20"><option value="2026-01">January 2026</option><option value="2026-02">February 2026</option></select></label>
        <label className="text-sm font-semibold text-navy">Office<select name="office" defaultValue={office ?? ""} className="mt-1 block rounded-lg border border-mist-200 bg-white px-3 py-2 font-normal outline-none focus:border-sky-hpp focus:ring-2 focus:ring-sky-hpp/20"><option value="">All offices</option><option value="kendall">Kendall</option><option value="ponce">Ponce</option></select></label>
        <input type="hidden" name="status" value={activeStatus} />
        <button type="submit" className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600">Apply</button>
      </form>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Billed total" value={money.format(kpis.billedTotal)} sub="All claims received" variant="navy" />
        <StatCard label="Collected total" value={money.format(kpis.collectedTotal)} sub="Paid and pending claims" />
        <StatCard label="Collection rate" value={`${(kpis.collectionRate * 100).toFixed(1)}%`} sub="Collected ÷ matched billed" />
        <StatCard label="At-risk" value={money.format(kpis.atRiskAmount)} sub="Phantom + estimated missing" />
      </section>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]"><CollectionsBar rows={rows} /><ClaimsDonut kpis={kpis} /></div>
      <div className="mt-8"><ClaimsTabs rows={rows} activeStatus={activeStatus} counts={counts} /></div>
    </AppShell>
  );
}
