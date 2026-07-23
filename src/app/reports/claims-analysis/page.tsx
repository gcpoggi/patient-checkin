import { AppShell } from "@/components/AppShell";
import { ClaimsAnalysisTables, type ClaimsAnalysisLedgerRow, type ClaimsStatusSummaryRow } from "@/components/ClaimsAnalysisTables";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { reconcileClaims } from "@/lib/reconcile";
import type { ClaimStatus, OfficeId } from "@/lib/types";

interface ClaimsAnalysisPageProps { searchParams: Promise<{ month?: string | string[]; office?: string | string[] }>; }
const statuses: ClaimStatus[] = ["paid_full", "unpaid", "underpayment", "phantom", "denied"];

export default async function ClaimsAnalysisPage({ searchParams }: ClaimsAnalysisPageProps) {
  const query = await searchParams;
  const requestedMonth = typeof query.month === "string" ? query.month : "2026-01";
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth) ? requestedMonth : "2026-01";
  const office: OfficeId | undefined = query.office === "kendall" || query.office === "ponce" ? query.office : undefined;
  const { rows, kpis } = reconcileClaims(month, office);

  const summaryRows: ClaimsStatusSummaryRow[] = statuses.map((status) => {
    const statusRows = rows.filter((row) => row.status === status);
    return {
      status,
      claims: statusRows.length,
      billed: statusRows.reduce((sum, row) => sum + row.billedAmount, 0),
      allowed: statusRows.reduce((sum, row) => sum + row.allowedAmount, 0),
      paid: statusRows.reduce((sum, row) => sum + row.paidAmount, 0),
      medicareTotal: statusRows.reduce((sum, row) => sum + row.medicareTotal, 0),
      underpayment: statusRows.reduce((sum, row) => sum + row.underpayment, 0),
      share: rows.length ? statusRows.length / rows.length : 0,
    };
  });

  const ledgerRows: ClaimsAnalysisLedgerRow[] = rows.map((row) => ({
    id: row.claim.id, claimNumber: row.claim.claimNumber, patientId: row.patientId, patient: row.patientName, office: row.office, date: row.dateOfService,
    cpt: row.claim.cptCode, serviceType: row.claim.serviceType, provider: row.claim.provider,
    payer: row.claim.payer, payerCategory: row.claim.payerCategory, status: row.status,
    billed: row.billedAmount, allowed: row.allowedAmount, paid: row.paidAmount,
    medicareTotal: row.medicareTotal, underpayment: row.underpayment, collectionPct: row.collectionPct,
  }));

  return <AppShell>
    <PageHeader title="Claims Analysis" subtitle="Claim volume, status mix, and underpayments across all dimensions" />
    <form className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-mist-200 bg-white p-4 shadow-sm">
      <label className="text-sm font-semibold text-navy">Month<select name="month" defaultValue={month} className="mt-1 block rounded-lg border border-mist-200 bg-white px-3 py-2 font-normal outline-none focus:border-sky-hpp focus:ring-2 focus:ring-sky-hpp/20"><option value="2026-01">January 2026</option><option value="2026-02">February 2026</option></select></label>
      <label className="text-sm font-semibold text-navy">Office<select name="office" defaultValue={office ?? ""} className="mt-1 block rounded-lg border border-mist-200 bg-white px-3 py-2 font-normal outline-none focus:border-sky-hpp focus:ring-2 focus:ring-sky-hpp/20"><option value="">All offices</option><option value="kendall">Kendall</option><option value="ponce">Ponce</option></select></label>
      <button type="submit" className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600">Apply</button>
    </form>
    <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-9" aria-label="Claims analysis key performance indicators">
      <StatCard label="Total claims" value={rows.length} sub="All claims received" variant="navy" />
      <StatCard label="Paid in full" value={kpis.paidFull} /><StatCard label="Unpaid" value={kpis.unpaid} />
      <StatCard label="Underpayment claims" value={kpis.underpayment} /><StatCard label="Phantom" value={kpis.phantom} />
      <StatCard label="Denied" value={kpis.denied} /><StatCard label="Collection rate" value={`${(kpis.collectionRate * 100).toFixed(1)}%`} />
      <StatCard label="100% Medicare" value={new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(kpis.medicareTotal)} />
      <StatCard label="Total underpayment" value={new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(kpis.underpaymentTotal)} variant="warning" />
    </section>
    <ClaimsAnalysisTables summaryRows={summaryRows} ledgerRows={ledgerRows} month={month} />
  </AppShell>;
}
