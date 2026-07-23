import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ContestationActions } from "@/components/ContestationActions";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { getStore } from "@/lib/store";

interface DetailPageProps { params: Promise<{ id: string }> }
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default async function ContestationDetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const store = getStore();
  const contestation = store.contestations.find((item) => item.id === id);
  if (!contestation) return <AppShell><PageHeader title="Contestation not found" subtitle="The requested appeal does not exist or is no longer available." /><Link href="/contestations" className="mt-6 inline-flex text-sm font-semibold text-teal-700 hover:underline">Return to contestations</Link></AppShell>;
  const claims = contestation.claimIds.map((claimId) => store.claims.find((claim) => claim.id === claimId));
  const steps = ["draft", "submitted", "won / lost"];
  return (
    <AppShell>
      <PageHeader title={contestation.insurer} subtitle={`${contestation.reason === "denied" ? "Denied claim" : "Underpayment"} appeal · ${contestation.id}`} actions={<StatusBadge status={contestation.status} />} />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-mist-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-widest text-teal-600">Amount demanded</p><p className="mt-2 font-mono text-3xl text-navy">{money.format(contestation.amountDemanded)}</p></article>
        <article className="rounded-xl border border-mist-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-widest text-teal-600">Amount recovered</p><p className="mt-2 font-mono text-3xl text-contest-won">{money.format(contestation.amountRecovered)}</p></article>
      </div>
      <ol className="mt-4 grid grid-cols-3 overflow-hidden rounded-xl border border-mist-200 bg-white" aria-label="Contestation progress">{steps.map((step, index) => { const active = index === 0 || contestation.submittedAt !== null && index === 1 || contestation.resolvedAt !== null && index === 2; return <li key={step} className={`border-r border-mist-200 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider last:border-r-0 ${active ? "bg-mist-100 text-contest-submitted" : "text-slate-400"}`}>{step}</li>; })}</ol>
      <section className="mt-6 overflow-hidden rounded-xl border border-mist-200 bg-white shadow-sm">
        <h2 className="border-b border-mist-200 px-4 py-3 font-semibold text-navy">Referenced claims</h2>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-mist-100 text-left text-xs uppercase tracking-wider text-navy"><tr><th className="px-4 py-2">Claim</th><th className="px-4 py-2">Patient</th><th className="px-4 py-2">CPT</th><th className="px-4 py-2 text-right">Billed</th><th className="px-4 py-2 text-right">Paid</th><th className="px-4 py-2 text-right">Underpayment</th></tr></thead><tbody className="divide-y divide-mist-200">{claims.map((claim, index) => <tr key={contestation.claimIds[index]}><td className="px-4 py-3 font-mono">{contestation.claimIds[index]}</td><td className="px-4 py-3">{claim?.patientName ?? "Claim unavailable"}</td><td className="px-4 py-3">{claim?.cptCode ?? "N/A"}</td><td className="px-4 py-3 text-right font-mono">{claim ? money.format(claim.billedAmount) : "N/A"}</td><td className="px-4 py-3 text-right font-mono">{claim ? money.format(claim.paidAmount) : "N/A"}</td><td className="px-4 py-3 text-right font-mono">{claim ? <span className="rounded-md bg-underpayment-bg px-2 py-1 font-semibold text-underpayment">{money.format(claim.underpayment)}</span> : "N/A"}</td></tr>)}</tbody></table></div>
      </section>
      <div className="mt-6"><ContestationActions contestation={contestation} /></div>
    </AppShell>
  );
}
