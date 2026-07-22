import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ClaimsTabs } from "@/components/ClaimsTabs";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { ClaimsDonut } from "@/components/charts/ClaimsDonut";
import { CollectionsBar } from "@/components/charts/CollectionsBar";
import { reconcileClaims } from "@/lib/reconcile";
import type { ClaimStatus, ClaimsFinancialKpis, OfficeId, ReconciledClaimRow } from "@/lib/types";

interface ClaimsPageProps {
  searchParams: Promise<{ month?: string | string[]; office?: string | string[]; status?: string | string[] }>;
}

type TabStatus = Exclude<ClaimStatus, "paid_full">;
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const statuses: TabStatus[] = ["unpaid", "underpayment", "phantom", "denied"];

export default async function ClaimsPage({ searchParams }: ClaimsPageProps) {
  const query = await searchParams;
  const requestedMonth = typeof query.month === "string" ? query.month : "2026-01";
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth) ? requestedMonth : "2026-01";
  const office: OfficeId | undefined = query.office === "kendall" || query.office === "ponce" ? query.office : undefined;
  const requestedStatus = typeof query.status === "string" ? query.status as TabStatus : "unpaid";
  const activeStatus: TabStatus = statuses.includes(requestedStatus) ? requestedStatus : "unpaid";
  const { rows, kpis }: { rows: ReconciledClaimRow[]; kpis: ClaimsFinancialKpis } = reconcileClaims(month, office);
  const counts = { unpaid: kpis.unpaid, underpayment: kpis.underpayment, phantom: kpis.phantom, denied: kpis.denied };
  const errorsHref = `/claims/errors?month=${month}${office ? `&office=${office}` : ""}`;

  return (
    <AppShell>
      <PageHeader title="Claims" subtitle="Financial reconciliation — Paid in full · Unpaid · Underpayment · Phantom · Denied" actions={<Link href="/claims/upload" className="rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600">Feed Claims Data</Link>} />
      <div className="mt-4 flex items-center gap-3 text-xs uppercase tracking-widest">
        <span className="font-semibold text-teal-600">Related reports</span>
        <Link href={errorsHref} className="font-semibold normal-case tracking-normal text-navy underline decoration-mist-200 underline-offset-4 transition hover:text-teal-600 hover:decoration-teal-400">Errors — Place of Service</Link>
      </div>
      <form className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-mist-200 bg-white p-4 shadow-sm">
        <label className="text-sm font-semibold text-navy">Month<select name="month" defaultValue={month} className="mt-1 block rounded-lg border border-mist-200 bg-white px-3 py-2 font-normal outline-none focus:border-sky-hpp focus:ring-2 focus:ring-sky-hpp/20"><option value="2026-01">January 2026</option><option value="2026-02">February 2026</option></select></label>
        <label className="text-sm font-semibold text-navy">Office<select name="office" defaultValue={office ?? ""} className="mt-1 block rounded-lg border border-mist-200 bg-white px-3 py-2 font-normal outline-none focus:border-sky-hpp focus:ring-2 focus:ring-sky-hpp/20"><option value="">All offices</option><option value="kendall">Kendall</option><option value="ponce">Ponce</option></select></label>
        <input type="hidden" name="status" value={activeStatus} />
        <button type="submit" className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600">Apply</button>
      </form>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard label="Billed total" value={money.format(kpis.billedTotal)} sub="All claims received" variant="navy" />
        <StatCard label="Total Cost (Allowed)" value={money.format(kpis.allowedTotal)} sub="Plan allowance" />
        <StatCard label="Plan Paid" value={money.format(kpis.collectedTotal)} sub="Payments received" />
        <StatCard label="100% Medicare" value={money.format(kpis.medicareTotal)} sub="Medicare benchmark" />
        <StatCard label="Underpayment" value={money.format(kpis.underpaymentTotal)} sub="100% Medicare − Plan Paid" />
        <StatCard label="Collection rate" value={`${(kpis.collectionRate * 100).toFixed(1)}%`} sub="Plan Paid ÷ collectible Medicare" />
      </section>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]"><CollectionsBar rows={rows} /><ClaimsDonut kpis={kpis} /></div>
      <div className="mt-8"><ClaimsTabs rows={rows} activeStatus={activeStatus} counts={counts} /></div>
    </AppShell>
  );
}
