"use client";

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
  reduction: number;
  collectionPct: number;
}

export interface ReimbursementDetailRow {
  id: string;
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
  reduction: number;
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
  { key: "billed", header: "Billed", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "allowed", header: "Allowed", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "paid", header: "Paid", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "reduction", header: "Reduction", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "collectionPct", header: "Collection %", align: "right", filter: "none", render: (value) => percent.format(Number(value)) },
];

const detailColumns: ExcelColumn<ReimbursementDetailRow>[] = [
  { key: "patient", header: "Patient", width: 190 },
  { key: "office", header: "Office", filter: "select", render: (value) => <span className="capitalize">{String(value)}</span> },
  { key: "dateOfService", header: "Date of Service", width: 135, render: (value) => date.format(new Date(`${String(value)}T00:00:00Z`)) },
  { key: "cpt", header: "CPT" },
  { key: "provider", header: "Provider", width: 180 },
  { key: "payer", header: "Payer", width: 180, filter: "select" },
  { key: "payerCategory", header: "Payer Category", width: 160, filter: "select", render: (value) => <span className="capitalize">{String(value).replaceAll("_", " ")}</span> },
  { key: "status", header: "Status", width: 145, filter: "select", render: (value) => <StatusBadge status={value as ClaimStatus} /> },
  { key: "billed", header: "Billed", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "allowed", header: "Allowed", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "paid", header: "Paid", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "reduction", header: "Reduction", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "collectionPct", header: "Collection %", align: "right", filter: "none", render: (value) => percent.format(Number(value)) },
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
