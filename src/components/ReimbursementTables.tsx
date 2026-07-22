"use client";

import Link from "next/link";
import { ExcelTable, type ExcelColumn } from "@/components/ExcelTable";
import { StatusBadge } from "@/components/StatusBadge";
import type { ClaimStatus } from "@/lib/types";

export interface ReimbursementPayerRow {
  payer: string;
  payerCategory: string;
  claims: number;
  billed: number;
  allowed: number;
  paid: number;
  medicareTotal: number;
  underpayment: number;
  collectionPct: number;
}

export interface ReimbursementDetailRow {
  id: string;
  claimNumber: string;
  patient: string;
  office: string;
  dateOfService: string;
  cpt: string;
  provider: string;
  payer: string;
  payerCategory: string;
  status: ClaimStatus;
  billed: number;
  allowed: number;
  paid: number;
  medicareTotal: number;
  underpayment: number;
  collectionPct: number;
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const payerColumns: ExcelColumn<ReimbursementPayerRow>[] = [
  { key: "payer", header: "Payer", width: 190 },
  { key: "payerCategory", header: "Payer Category", width: 160, filter: "select", render: (value) => <span className="capitalize">{String(value).replaceAll("_", " ")}</span> },
  { key: "claims", header: "# Claims", align: "right", filter: "none" },
  { key: "billed", header: "Total Billed", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "allowed", header: "Total Cost (Allowed)", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "paid", header: "Plan Paid", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "medicareTotal", header: "100% Medicare", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "underpayment", header: "Underpayment", align: "right", filter: "none", render: (value) => <span className="rounded-md bg-underpayment-bg px-2 py-1 font-semibold text-underpayment">{money.format(Number(value))}</span> },
  { key: "collectionPct", header: "Collection %", align: "right", filter: "none", render: (value) => percent.format(Number(value)) },
];

const detailColumns: ExcelColumn<ReimbursementDetailRow>[] = [
  { key: "claimNumber", header: "Claim #", width: 140, render: (value) => <Link href={`/claims/${encodeURIComponent(String(value))}`} className="font-mono font-semibold text-teal-700 hover:underline">{String(value)}</Link> },
  { key: "patient", header: "Patient", width: 190 },
  { key: "office", header: "Office", filter: "select", render: (value) => <span className="capitalize">{String(value)}</span> },
  { key: "dateOfService", header: "Date Visited", width: 135, render: (value) => date.format(new Date(`${String(value)}T00:00:00Z`)) },
  { key: "provider", header: "Physician", width: 180 },
  { key: "payer", header: "Payer", width: 180, filter: "select" },
  { key: "payerCategory", header: "Payer Category", width: 160, filter: "select", render: (value) => <span className="capitalize">{String(value).replaceAll("_", " ")}</span> },
  { key: "status", header: "Status", width: 145, filter: "select", render: (value) => <StatusBadge status={value as ClaimStatus} /> },
  { key: "billed", header: "Total Billed", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "allowed", header: "Total Cost (Allowed)", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "paid", header: "Plan Paid", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "medicareTotal", header: "100% Medicare", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "underpayment", header: "Underpayment", align: "right", filter: "none", render: (value) => <span className="rounded-md bg-underpayment-bg px-2 py-1 font-semibold text-underpayment">{money.format(Number(value))}</span> },
  { key: "id", header: "Action", filter: "none", sortable: false, render: (_, row) => row.status === "underpayment" || row.status === "denied" ? <Link className="font-semibold text-teal-700 hover:underline" href={`/contestations/new?claimIds=${encodeURIComponent(row.id)}&insurer=${encodeURIComponent(row.payer)}&reason=${row.status}&amount=${row.status === "denied" ? row.billed : row.underpayment}`}>Contest</Link> : null },
];

export function ReimbursementTables({
  payerRows,
  detailRows,
  month,
}: {
  payerRows: ReimbursementPayerRow[];
  detailRows: ReimbursementDetailRow[];
  month: string;
}) {
  return (
    <div className="mt-8 space-y-8">
      <ExcelTable
        columns={payerColumns}
        rows={payerRows}
        rowKey={(row) => row.payer}
        dense
        stickyFirstColumn
        exportFilename={`reimbursement-by-payer-${month}`}
        title="Summary by payer"
        empty="No payer reimbursement records found for this reporting period."
      />
      <ExcelTable
        columns={detailColumns}
        rows={detailRows}
        rowKey={(row) => row.id}
        dense
        stickyFirstColumn
        exportFilename={`reimbursement-detail-${month}`}
        title="Claim-level detail"
        empty="No claim reimbursement records found for this reporting period."
      />
    </div>
  );
}
