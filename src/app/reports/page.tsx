import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { ReportsGrid } from "@/components/ReportsGrid";

export default function ReportsPage() {
  return <AppShell><PageHeader title="Reports" subtitle="Financial, compliance, and audit reporting for billing oversight" /><div className="mt-8"><ReportsGrid /></div></AppShell>;
}
