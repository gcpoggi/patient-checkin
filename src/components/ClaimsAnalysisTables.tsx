"use client";

import Link from "next/link";
import { ExcelTable, type ExcelColumn } from "@/components/ExcelTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatPatientId } from "@/lib/format";
import type { ClaimStatus } from "@/lib/types";

export interface ClaimsStatusSummaryRow { status: ClaimStatus; claims: number; billed: number; allowed: number; paid: number; medicareTotal: number; underpayment: number; share: number; }
export interface ClaimsAnalysisLedgerRow { id: string; claimNumber: string; patientId: string | null; patient: string; office: string; date: string; cpt: string; serviceType: string; provider: string; payer: string; payerCategory: string; status: ClaimStatus; billed: number; allowed: number; paid: number; medicareTotal: number; underpayment: number; collectionPct: number; }

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

const summaryColumns: ExcelColumn<ClaimsStatusSummaryRow>[] = [
  { key: "status", header: "Status", width: 150, filter: "select", render: (value) => <StatusBadge status={value as ClaimStatus} /> },
  { key: "claims", header: "# Claims", align: "right", filter: "none" },
  { key: "billed", header: "Total Billed", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "allowed", header: "Total Cost (Allowed)", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "paid", header: "Plan Paid", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "medicareTotal", header: "100% Medicare", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "underpayment", header: "Underpayment", align: "right", filter: "none", render: (value) => <span className="rounded-md bg-underpayment-bg px-2 py-1 font-semibold text-underpayment">{money.format(Number(value))}</span> },
  { key: "share", header: "% of Claims", align: "right", filter: "none", render: (value) => percent.format(Number(value)) },
];

const ledgerColumns: ExcelColumn<ClaimsAnalysisLedgerRow>[] = [
  { key: "patientId", header: "Patient ID", width: 120, render: (value) => <span className="font-mono text-slate-500">{formatPatientId(value as string | null)}</span>, exportValue: (row) => formatPatientId(row.patientId) },
  { key: "patient", header: "Patient", width: 190 },
  { key: "claimNumber", header: "Claim #", width: 140, render: (value) => <Link href={`/claims/${encodeURIComponent(String(value))}`} className="font-mono font-semibold text-teal-700 hover:underline">{String(value)}</Link> },
  { key: "office", header: "Office", filter: "select", render: (value) => <span className="capitalize">{String(value)}</span> },
  { key: "date", header: "Date", width: 135, render: (value) => date.format(new Date(`${String(value)}T00:00:00Z`)) },
  { key: "cpt", header: "CPT", filter: "select" },
  { key: "serviceType", header: "Service Type", width: 130, filter: "select", render: (value) => <span className="uppercase">{String(value)}</span> },
  { key: "provider", header: "Physician", width: 180, filter: "select" },
  { key: "payer", header: "Payer", width: 180, filter: "select" },
  { key: "payerCategory", header: "Payer Category", width: 160, filter: "select", render: (value) => <span className="capitalize">{String(value).replaceAll("_", " ")}</span> },
  { key: "status", header: "Status", width: 145, filter: "select", render: (value) => <StatusBadge status={value as ClaimStatus} /> },
  { key: "billed", header: "Total Billed", align: "right", render: (value) => money.format(Number(value)) },
  { key: "allowed", header: "Total Cost (Allowed)", align: "right", render: (value) => money.format(Number(value)) },
  { key: "paid", header: "Plan Paid", align: "right", render: (value) => money.format(Number(value)) },
  { key: "medicareTotal", header: "100% Medicare", align: "right", render: (value) => money.format(Number(value)) },
  { key: "underpayment", header: "Underpayment", align: "right", render: (value) => <span className="rounded-md bg-underpayment-bg px-2 py-1 font-semibold text-underpayment">{money.format(Number(value))}</span> },
  { key: "collectionPct", header: "Collection %", align: "right", render: (value) => percent.format(Number(value)) },
];

export function ClaimsAnalysisTables({ summaryRows, ledgerRows, month }: { summaryRows: ClaimsStatusSummaryRow[]; ledgerRows: ClaimsAnalysisLedgerRow[]; month: string }) {
  return <div className="mt-8 space-y-8">
    <ExcelTable columns={summaryColumns} rows={summaryRows} rowKey={(row) => row.status} dense stickyFirstColumn exportFilename={`claims-by-status-${month}`} title="Summary by status" empty="No claim status records found for this reporting period." />
    <ExcelTable columns={ledgerColumns} rows={ledgerRows} rowKey={(row) => row.id} dense stickyFirstColumn exportFilename={`claims-analysis-${month}`} title="Full claims ledger" empty="No claims found for this reporting period." />
  </div>;
}
