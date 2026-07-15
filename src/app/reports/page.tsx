import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { ReportsGrid } from "@/components/ReportsGrid";

export default function ReportsPage() {
  return <AppShell><PageHeader title="Power BI Reports" subtitle="Financial & operational dashboards — productivity · no-shows · billing & collections" /><section className="mt-8" aria-labelledby="report-library-title"><p id="report-library-title" className="mb-4 text-xs font-semibold uppercase tracking-widest text-teal-600">Report library</p><ReportsGrid /></section></AppShell>;
}
