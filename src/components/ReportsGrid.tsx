"use client";

import { useState } from "react";
import { MenuCard } from "@/components/MenuCard";
import { Modal } from "@/components/Modal";
import { ReportPlaceholder } from "@/components/ReportPlaceholder";

const reports = [
  { title: "Reimbursement Analysis", description: "Payments, adjustments, and collection performance by payer." },
  { title: "Claims Analysis", description: "Claim volume, status mix, and denial trends across offices." },
  { title: "Unpaid Claims", description: "Outstanding and pending claims to follow up for collections." },
] as const;
type Report = (typeof reports)[number];

export function ReportsGrid() {
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  return <><div className="grid gap-4 md:grid-cols-3">{reports.map((report) => <MenuCard key={report.title} {...report} onClick={() => setActiveReport(report)} />)}</div><Modal open={activeReport !== null} onClose={() => setActiveReport(null)} title={activeReport?.title}>{activeReport ? <ReportPlaceholder {...activeReport} /> : null}</Modal></>;
}
