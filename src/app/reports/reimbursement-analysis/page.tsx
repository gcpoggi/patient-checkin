import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import {
  ReimbursementTables,
  type ReimbursementDetailRow,
  type ReimbursementPayerRow,
} from "@/components/ReimbursementTables";
import { StatCard } from "@/components/StatCard";
import { reconcileClaims } from "@/lib/reconcile";
import type { OfficeId } from "@/lib/types";

interface ReimbursementAnalysisPageProps {
  searchParams: Promise<{ month?: string | string[]; office?: string | string[] }>;
}

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function ReimbursementAnalysisPage({ searchParams }: ReimbursementAnalysisPageProps) {
  const query = await searchParams;
  const requestedMonth = typeof query.month === "string" ? query.month : "2026-01";
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth) ? requestedMonth : "2026-01";
  const office: OfficeId | undefined = query.office === "kendall" || query.office === "ponce" ? query.office : undefined;
  const { rows, kpis } = reconcileClaims(month, office);

  const payerGroups = new Map<string, typeof rows>();
  for (const row of rows) {
    const group = payerGroups.get(row.claim.payer) ?? [];
    group.push(row);
    payerGroups.set(row.claim.payer, group);
  }

  const payerRows: ReimbursementPayerRow[] = [...payerGroups.entries()]
    .map(([payer, payerClaims]) => {
      const allowed = payerClaims.reduce((sum, row) => sum + row.allowedAmount, 0);
      const paid = payerClaims.reduce((sum, row) => sum + row.paidAmount, 0);
      return {
        payer,
        payerCategory: payerClaims[0].claim.payerCategory,
        claims: payerClaims.length,
        billed: payerClaims.reduce((sum, row) => sum + row.billedAmount, 0),
        allowed,
        paid,
        reduction: payerClaims
          .filter((row) => row.visit !== null && row.status !== "denied" && row.status !== "phantom")
          .reduce((sum, row) => sum + Math.max(0, row.allowedAmount - row.paidAmount), 0),
        collectionPct: allowed ? paid / allowed : 0,
      };
    })
    .sort((left, right) => right.reduction - left.reduction);

  const detailRows: ReimbursementDetailRow[] = rows.map((row) => ({
    id: row.claim.id,
    patient: row.patientName,
    office: row.office,
    dateOfService: row.dateOfService,
    cpt: row.claim.cptCode,
    provider: row.claim.provider,
    payer: row.claim.payer,
    payerCategory: row.claim.payerCategory,
    status: row.status,
    billed: row.billedAmount,
    allowed: row.allowedAmount,
    paid: row.paidAmount,
    reduction: Math.max(0, row.reduction),
    collectionPct: row.collectionPct,
  }));

  return (
    <AppShell>
      <PageHeader
        title="Reimbursement Analysis"
        subtitle="Billed vs allowed vs collected, and reimbursement reductions by payer"
      />
      <form className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-mist-200 bg-white p-4 shadow-sm">
        <label className="text-sm font-semibold text-navy">
          Month
          <select name="month" defaultValue={month} className="mt-1 block rounded-lg border border-mist-200 bg-white px-3 py-2 font-normal outline-none focus:border-sky-hpp focus:ring-2 focus:ring-sky-hpp/20">
            <option value="2026-01">January 2026</option>
            <option value="2026-02">February 2026</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-navy">
          Office
          <select name="office" defaultValue={office ?? ""} className="mt-1 block rounded-lg border border-mist-200 bg-white px-3 py-2 font-normal outline-none focus:border-sky-hpp focus:ring-2 focus:ring-sky-hpp/20">
            <option value="">All offices</option>
            <option value="kendall">Kendall</option>
            <option value="ponce">Ponce</option>
          </select>
        </label>
        <button type="submit" className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600">Apply</button>
      </form>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Reimbursement key performance indicators">
        <StatCard label="Billed total" value={money.format(kpis.billedTotal)} sub="All claims received" variant="navy" />
        <StatCard label="Allowed total" value={money.format(kpis.allowedTotal)} sub="Fee-schedule allowance" />
        <StatCard label="Collected total" value={money.format(kpis.collectedTotal)} sub="Payments received" />
        <StatCard label="Reduction total" value={money.format(kpis.reductionTotal)} sub="Shaved from allowed" />
        <StatCard label="Collection rate" value={`${(kpis.collectionRate * 100).toFixed(1)}%`} sub="Collected ÷ collectible allowed" />
      </section>
      <ReimbursementTables payerRows={payerRows} detailRows={detailRows} month={month} />
    </AppShell>
  );
}
