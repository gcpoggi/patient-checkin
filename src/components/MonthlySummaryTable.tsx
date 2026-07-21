"use client";

import { ExcelTable, type ExcelColumn } from "@/components/ExcelTable";
import type { MonthlySummary } from "@/lib/types";

type SummaryRow = MonthlySummary["byProvider"][number] & { total: number };

const columns: ExcelColumn<SummaryRow>[] = [
  { key: "provider", header: "Physician", width: 220 },
  { key: "patients", header: "Patients", filter: "none" },
  { key: "doctorVisits", header: "Doctor Visits", filter: "none" },
  { key: "ptVisits", header: "PT Visits", filter: "none" },
  { key: "evals", header: "Evals", filter: "none" },
  { key: "total", header: "Total", filter: "none" },
];

export function MonthlySummaryTable({ summary }: { summary: MonthlySummary }) {
  const rows = summary.byProvider.map((row) => ({
    ...row,
    total: row.doctorVisits + row.ptVisits + row.evals,
  }));

  return (
    <ExcelTable
      columns={columns}
      rows={rows}
      rowKey={(row) => row.provider}
      stickyFirstColumn
      title="Summary by physician"
      exportFilename={`monthly-summary-${summary.office}-${summary.month}`}
      empty="No provider activity found for this period."
    />
  );
}
