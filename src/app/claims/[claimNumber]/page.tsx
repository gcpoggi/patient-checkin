import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ClaimProceduresTable } from "@/components/ClaimProceduresTable";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { CLAIM_FILE_STATUS_LABELS, formatPatientId, formatPhone } from "@/lib/format";
import { reconcileClaims } from "@/lib/reconcile";
import { getStore } from "@/lib/store";

interface ClaimDetailPageProps {
  params: Promise<{ claimNumber: string }>;
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default async function ClaimDetailPage({ params }: ClaimDetailPageProps) {
  const { claimNumber } = await params;
  const claim = getStore().claims.find((item) => item.claimNumber === claimNumber);

  if (!claim) {
    return <AppShell><PageHeader title="Claim not found" subtitle="The requested claim does not exist or is no longer available." /><Link href="/claims" className="mt-6 inline-flex text-sm font-semibold text-teal-700 hover:underline">Return to claims</Link></AppShell>;
  }

  const recon = reconcileClaims(claim.dateOfService.slice(0, 7), claim.office).rows.find((row) => row.claim.id === claim.id);
  const contested = recon?.contested ?? false;
  const isDenied = claim.fileStatus === "denied";
  const isUnderpayment = !isDenied && claim.fileStatus === "paid" && claim.paidAmount < claim.medicareTotal;
  const contestReason = isDenied ? "denied" : "underpayment";
  const contestAmount = isDenied ? claim.billedAmount : claim.underpayment;
  const contestHref = `/contestations/new?claimIds=${encodeURIComponent(claim.id)}&insurer=${encodeURIComponent(claim.payer)}&reason=${contestReason}&amount=${contestAmount}`;
  const pillColor = claim.fileStatus === "paid" ? "bg-emerald-100 text-emerald-700" : claim.fileStatus === "submitted" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700";
  const info = [
    ["Patient ID", formatPatientId(claim.patientId)],
    ["Date Visited", claim.dateOfService],
    ["Date Processed", claim.dateProcessed],
    ["Total Days", String(claim.totalDays)],
    ["Physician", claim.visitedProvider],
    ["Office", claim.office],
    ["Place of Service", claim.placeOfService],
    ["Patient DOB", claim.patientDob],
    ["Patient Phone", formatPhone(claim.patientPhone)],
  ];

  return (
    <AppShell>
      <PageHeader title={`Claim #${claim.claimNumber}`} subtitle={`${claim.patientName} · ${claim.payer}`} actions={<div className="flex flex-wrap items-center gap-2">{recon ? <StatusBadge status={recon.status} /> : null}{contested ? <span className="inline-flex rounded-full bg-mist-100 px-2.5 py-1 text-xs font-semibold text-contest-submitted">Contested</span> : null}<span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${pillColor}`}>Plan: {CLAIM_FILE_STATUS_LABELS[claim.fileStatus]}</span></div>} />

      {isDenied ? (
        <section className="mt-6 rounded-xl border border-denied/30 bg-denied-bg px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-denied">Denial from payer</p>
          <p className="mt-1 text-sm font-semibold text-denied">{claim.denialCode ? `${claim.denialCode} · ` : ""}{claim.denialReason ?? "Denied by payer"}</p>
          <p className="mt-1 text-xs text-denied/80">Denied claims must be contested: refute the denial with the missing information or a letter of medical necessity requesting approval.</p>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl border border-mist-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-navy">Payment breakdown</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Provider Billed" value={money.format(claim.billedAmount)} />
          <StatCard label="Total Cost (Allowed)" value={money.format(claim.allowedAmount)} />
          <StatCard label="Plan Paid" value={money.format(claim.paidAmount)} />
          <StatCard label="Your Share" value={money.format(Math.max(0, claim.allowedAmount - claim.paidAmount))} />
          <StatCard label="100% Medicare" value={money.format(claim.medicareTotal)} variant="navy" />
          <StatCard label="Underpayment" value={money.format(claim.underpayment)} variant="warning" />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-2xl font-semibold text-navy">Services / procedures</h2>
        <ClaimProceduresTable claimNumber={claim.claimNumber} procedures={claim.procedures} />
      </section>

      <section className="mt-8 rounded-xl border border-mist-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-navy">Claim info</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">{info.map(([label, value]) => <div key={label}><dt className="text-xs font-semibold uppercase tracking-widest text-teal-600">{label}</dt><dd className={`mt-1 text-sm text-navy ${label === "Office" ? "capitalize" : ""}`}>{value}</dd></div>)}</dl>
      </section>

      {contested ? <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-mist-200 bg-mist-50 px-4 py-2.5 text-sm font-semibold text-contest-submitted">This claim has been contested.</div> : (isUnderpayment || isDenied) ? <div className="mt-6"><Link href={contestHref} className="inline-flex rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600">Contest this claim</Link></div> : null}
      <p className="mt-6 text-xs text-slate-500">This view mirrors a real Medicare Advantage claim breakdown for demonstration purposes.</p>
    </AppShell>
  );
}
