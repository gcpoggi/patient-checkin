import { AppShell } from "@/components/AppShell";
import { ContestationForm } from "@/components/ContestationForm";
import { PageHeader } from "@/components/PageHeader";
import type { ContestationReason } from "@/lib/types";

interface NewPageProps { searchParams: Promise<{ claimIds?: string | string[]; insurer?: string | string[]; reason?: string | string[]; amount?: string | string[] }> }

export default async function NewContestationPage({ searchParams }: NewPageProps) {
  const query = await searchParams;
  const reason: ContestationReason = query.reason === "denied" ? "denied" : "underpayment";
  return (
    <AppShell>
      <PageHeader title="New contestation" subtitle="Create an insurer appeal from one or more underpaid or denied claims" />
      <ContestationForm claimIds={typeof query.claimIds === "string" ? query.claimIds : ""} insurer={typeof query.insurer === "string" ? query.insurer : ""} reason={reason} amount={typeof query.amount === "string" ? query.amount : ""} />
    </AppShell>
  );
}
