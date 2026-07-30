import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import type { ClaimStatus } from "@/lib/types";

interface Definition {
  status: ClaimStatus;
  planTerm: string;
  definition: string;
}

// Definitions for claims sent to and processed by insurance companies, as used
// by the HPP Adjudication Scrubber to classify every claim.
const definitions: Definition[] = [
  {
    status: "paid_full",
    planTerm: "Approved",
    definition: "The plan paid the claim at or above the 100% Medicare / Workers Comp benchmark. Nothing further is owed.",
  },
  {
    status: "partial_paid",
    planTerm: "Under review (partial payment)",
    definition: "The plan issued a partial payment while the claim is still being processed. A balance remains outstanding.",
  },
  {
    status: "unpaid",
    planTerm: "Under review",
    definition: "The claim was received by the plan and has not been paid. The plan may label this Under review to alert the provider that it was received and remains unpaid; HPP classifies it as Unpaid.",
  },
  {
    status: "underpayment",
    planTerm: "Approved (below contract)",
    definition: "The plan finalized payment below what the contract stipulates, below 100% Allowed (Medicare or Workers Comp). This is the gap HPP recovers through contestations.",
  },
  {
    status: "denied",
    planTerm: "Denied",
    definition: "The insurance company refused to pay. The statement states an explanation and a code. Denied claims must be contested by refuting the denial with the missing information or a letter of medical necessity requesting approval.",
  },
  {
    status: "phantom",
    planTerm: "Not applicable",
    definition: "HPP cross-check: a claim was billed to the plan but no patient visit is on record. It signals a possible phantom charge.",
  },
];

const rules: string[] = [
  "If the payer denied the claim, classify it as Denied.",
  "Otherwise, if there is no visit on record for the claim, classify it as Phantom (HPP cross-check).",
  "Otherwise, if nothing has been paid, classify it as Unpaid (this includes claims the plan reports as Under review).",
  "Otherwise, if the plan is still reviewing the claim and has issued a partial payment, classify it as Partial Paid.",
  "Otherwise, if the finalized payment is below 100% Medicare / Workers Comp, classify it as Underpaid.",
  "Otherwise, classify it as Paid.",
];

export default function AdjudicationRulesPage() {
  return (
    <AppShell>
      <PageHeader
        title="Adjudication Rules"
        subtitle="HPP Adjudication Scrubber: definitions and rules for claims sent to and processed by insurance companies"
      />

      <section className="mt-6 rounded-xl border border-mist-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">Definitions</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-navy">Claim status definitions</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Every claim is classified into one HPP status. The plan reports its own file status on the statement (shown as the plan term); the scrubber maps that plus the payment into HPP&apos;s status.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-mist-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-2 pr-4">HPP status</th>
                <th className="py-2 pr-4">Plan term</th>
                <th className="py-2">Definition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-200">
              {definitions.map((item) => (
                <tr key={item.status} className="align-top">
                  <td className="py-3 pr-4"><StatusBadge status={item.status} /></td>
                  <td className="py-3 pr-4 text-slate-600">{item.planTerm}</td>
                  <td className="py-3 text-slate-700">{item.definition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-mist-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">Scrubber logic</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-navy">Rules applied, in order</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          The scrubber evaluates these rules top to bottom and assigns the first one that matches.
        </p>
        <ol className="mt-5 space-y-3">
          {rules.map((rule, index) => (
            <li key={rule} className="flex gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-navy font-mono text-xs font-semibold text-white">{index + 1}</span>
              <span className="text-sm text-slate-700">{rule}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6 rounded-xl border border-mist-200 bg-mist-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">Contested claims</p>
        <h2 className="mt-1 font-display text-xl font-semibold text-navy">Denied and Underpaid claims can be contested</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          A Denied claim must be contested to the insurance company, refuting the denial and presenting an argument, the missing information, or a letter from the provider explaining the medical necessity of the procedure, requesting that the claim be approved. Once submitted, it is a Contested claim, tracked end to end in{" "}
          <Link href="/contestations" className="font-semibold text-teal-700 hover:underline">Contestations</Link>. Underpaid claims are contested the same way to recover the amount below 100% Medicare.
        </p>
      </section>

      <div className="mt-6">
        <Link href="/claims" className="inline-flex text-sm font-semibold text-teal-700 hover:underline">Return to claims</Link>
      </div>
    </AppShell>
  );
}
