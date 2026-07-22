"use client";

import { ExcelTable, type ExcelColumn } from "@/components/ExcelTable";
import type { ProcedureLine } from "@/lib/types";

interface ClaimProceduresTableProps {
  claimNumber: string;
  procedures: ProcedureLine[];
}

interface ProcedureRow extends ProcedureLine {
  id: string;
  underpayment: number;
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const moneyCell = (value: unknown) => <span className="font-mono tabular-nums">{money.format(Number(value))}</span>;

const columns: ExcelColumn<ProcedureRow>[] = [
  { key: "cptCode", header: "Billing Code", filter: "none" },
  { key: "description", header: "Description", filter: "none", width: 34 },
  { key: "billedAmount", header: "Billed", align: "right", filter: "none", render: moneyCell },
  { key: "allowedAmount", header: "Total Cost (Allowed)", align: "right", filter: "none", render: moneyCell },
  { key: "planPaid", header: "Plan Paid", align: "right", filter: "none", render: moneyCell },
  { key: "medicarePrice", header: "100% Medicare", align: "right", filter: "none", render: moneyCell },
  { key: "underpayment", header: "Underpayment", align: "right", filter: "none", render: (value) => <span className="rounded bg-underpayment-bg px-2 py-0.5 font-mono font-semibold tabular-nums text-underpayment">{money.format(Number(value))}</span> },
];

export function ClaimProceduresTable({ claimNumber, procedures }: ClaimProceduresTableProps) {
  const rows: ProcedureRow[] = procedures.map((procedure, index) => ({
    ...procedure,
    id: `${procedure.cptCode}-${index}`,
    underpayment: Math.max(0, procedure.medicarePrice - procedure.planPaid),
  }));

  return <ExcelTable columns={columns} rows={rows} rowKey={(row) => row.id} dense stickyFirstColumn exportFilename={`claim-${claimNumber}-procedures`} empty="No procedures found for this claim." />;
}
