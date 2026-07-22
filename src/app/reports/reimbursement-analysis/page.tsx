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
      const medicareTotal = payerClaims.reduce((sum, row) => sum + row.medicareTotal, 0);
      const paid = payerClaims.reduce((sum, row) => sum + row.paidAmount, 0);
      return {
        payer,
        payerCategory: payerClaims[0].claim.payerCategory,
        claims: payerClaims.length,
        billed: payerClaims.reduce((sum, row) => sum + row.billedAmount, 0),
        allowed,
        paid,
        medicareTotal,
        underpayment: payerClaims.reduce((sum, row) => sum + row.underpayment, 0),
        collectionPct: medicareTotal ? paid / medicareTotal : 0,
      };
    })
    .sort((left, right) => right.underpayment - left.underpayment);

  const detailRows: ReimbursementDetailRow[] = rows.map((row) => ({
    id: row.claim.id,
    claimNumber: row.claim.claimNumber,
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
    medicareTotal: row.medicareTotal,
    underpayment: row.underpayment,
    collectionPct: row.collectionPct,
  }));

  return (
    <AppShell>
      <PageHeader
        title="Reimbursement Analysis"
        subtitle="Plan paid vs 100% Medicare — reimbursement underpayment by payer"
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
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6" aria-label="Reimbursement key performance indicators">
        <StatCard label="Total Billed" value={money.format(kpis.billedTotal)} sub="All claims received" variant="navy" />
        <StatCard label="Total Cost (Allowed)" value={money.format(kpis.allowedTotal)} sub="Plan allowance" />
        <StatCard label="Plan Paid" value={money.format(kpis.collectedTotal)} sub="Payments received" />
        <StatCard label="100% Medicare" value={money.format(kpis.medicareTotal)} sub="Medicare benchmark" />
        <StatCard label="Underpayment" value={money.format(kpis.underpaymentTotal)} sub="100% Medicare − Plan Paid" variant="warning" />
        <StatCard label="Collection Rate" value={`${(kpis.medicareTotal ? kpis.collectedTotal / kpis.medicareTotal * 100 : 0).toFixed(1)}%`} sub="Plan Paid ÷ 100% Medicare" />
      </section>
      <ReimbursementTables payerRows={payerRows} detailRows={detailRows} month={month} />
    </AppShell>
  );
}
