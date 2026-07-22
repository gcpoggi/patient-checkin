import { MenuCard } from "@/components/MenuCard";

const financialReports = [
  { title: "Reimbursement Analysis", description: "Review billed, allowed, collected, and reduced amounts by payer.", href: "/reports/reimbursement-analysis" },
  { title: "Claims Analysis", description: "Analyze claim volume, status mix, and reductions across every dimension.", href: "/reports/claims-analysis" },
  { title: "Unpaid Claims", description: "Review claims with no payment received and prioritize collection follow-up.", href: "/claims?status=unpaid" },
  { title: "Underpayment", description: "Find claims where Plan Paid is below 100% Medicare.", href: "/claims?status=underpayment" },
  { title: "Denied Claims", description: "Investigate denied claims and their recorded denial reasons.", href: "/claims?status=denied" },
  { title: "Phantom Claims", description: "Identify billed claims with no matching patient visit.", href: "/claims?status=phantom" },
] as const;

const complianceReports = [
  { title: "Errors — Place of Service", description: "Audit claims for improper place-of-service coding.", href: "/claims/errors" },
] as const;

export function ReportsGrid() {
  return (
    <div className="space-y-8">
      <section aria-labelledby="financial-reports-title">
        <p id="financial-reports-title" className="mb-4 text-xs font-semibold uppercase tracking-widest text-teal-600">Financial reports</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{financialReports.map((report) => <MenuCard key={report.title} {...report} />)}</div>
      </section>
      <section aria-labelledby="compliance-reports-title">
        <p id="compliance-reports-title" className="mb-4 text-xs font-semibold uppercase tracking-widest text-teal-600">Compliance &amp; audit</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{complianceReports.map((report) => <MenuCard key={report.title} {...report} />)}</div>
      </section>
    </div>
  );
}
