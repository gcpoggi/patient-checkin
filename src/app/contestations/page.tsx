import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ContestationsTable } from "@/components/ContestationsTable";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { computeContestationSummary } from "@/lib/contestations";
import { getStore } from "@/lib/store";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function ContestationsPage() {
  const contestations = getStore().contestations;
  const summary = computeContestationSummary(contestations);
  return (
    <AppShell>
      <PageHeader title="Contestations" subtitle="Appeals demanding refunds from insurers - reports sold separately" actions={<Link href="/contestations/new" className="rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-600">New contestation</Link>} />
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total demanded" value={money.format(summary.totalDemanded)} variant="navy" />
        <StatCard label="Total recovered" value={money.format(summary.totalRecovered)} />
        <StatCard label="Win rate" value={`${(summary.winRate * 100).toFixed(1)}%`} />
      </section>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Contestations by status">
        {(["draft", "submitted", "won", "lost"] as const).map((status) => {
          const classes = { draft: "bg-slate-100 text-contest-draft", submitted: "bg-mist-100 text-contest-submitted", won: "bg-paid-bg text-contest-won", lost: "bg-denied-bg text-contest-lost" }[status];
          return <span key={status} className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${classes}`}>{status}: {summary.byStatus[status]}</span>;
        })}
      </div>
      <div className="mt-6"><ContestationsTable rows={contestations} /></div>
    </AppShell>
  );
}
