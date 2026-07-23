import { AppShell } from "@/components/AppShell";
import { ClaimsErrorsTable, type ClaimsErrorTableRow } from "@/components/ClaimsErrorsTable";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { detectPlaceOfServiceErrors } from "@/lib/reconcile";
import type { OfficeId } from "@/lib/types";

interface ClaimsErrorsPageProps {
  searchParams: Promise<{ month?: string | string[]; office?: string | string[] }>;
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default async function ClaimsErrorsPage({ searchParams }: ClaimsErrorsPageProps) {
  const query = await searchParams;
  const requestedMonth = typeof query.month === "string" ? query.month : "2026-01";
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth) ? requestedMonth : "2026-01";
  const office: OfficeId | undefined = query.office === "kendall" || query.office === "ponce" ? query.office : undefined;
  const rows: ClaimsErrorTableRow[] = detectPlaceOfServiceErrors(month, office).map(({ claim }) => ({
    claimId: claim.id,
    patientId: claim.patientId,
    patient: claim.patientName,
    provider: claim.provider,
    office: claim.office,
    dateOfService: claim.dateOfService,
    cptCode: claim.cptCode,
    description: claim.description,
    placeOfService: claim.placeOfService,
    payer: claim.payer,
    billedAmount: claim.billedAmount,
  }));
  const billedAtRisk = rows.reduce((total, row) => total + row.billedAmount, 0);

  return (
    <AppShell>
      <PageHeader title="Claims Errors" subtitle="Improper In-Patient / Observation place-of-service on outpatient services" />
      <form className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-mist-200 bg-white p-4 shadow-sm">
        <label className="text-sm font-semibold text-navy">Month<select name="month" defaultValue={month} className="mt-1 block rounded-lg border border-mist-200 bg-white px-3 py-2 font-normal outline-none focus:border-sky-hpp focus:ring-2 focus:ring-sky-hpp/20"><option value="2026-01">January 2026</option><option value="2026-02">February 2026</option></select></label>
        <label className="text-sm font-semibold text-navy">Office<select name="office" defaultValue={office ?? ""} className="mt-1 block rounded-lg border border-mist-200 bg-white px-3 py-2 font-normal outline-none focus:border-sky-hpp focus:ring-2 focus:ring-sky-hpp/20"><option value="">All offices</option><option value="kendall">Kendall</option><option value="ponce">Ponce</option></select></label>
        <button type="submit" className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600">Apply</button>
      </form>
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Errors found" value={rows.length} sub="Improper inpatient or observation POS" variant="navy" />
        <StatCard label="Billed amount at risk" value={money.format(billedAtRisk)} sub="Total billed on flagged claims" />
      </section>
      <div className="mt-6"><ClaimsErrorsTable rows={rows} exportFilename={`claims-errors-${month}`} /></div>
    </AppShell>
  );
}
