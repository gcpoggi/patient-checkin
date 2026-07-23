"use client";

import { ExcelTable, type ExcelColumn } from "@/components/ExcelTable";
import { formatPatientId, formatPhone } from "@/lib/format";
import type { BillingStatus, ServiceTransaction } from "@/lib/types";
import Link from "next/link";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const statusLabels: Record<BillingStatus, string> = {
  paid_full: "Paid in full", unpaid: "Unpaid", underpayment: "Underpayment",
  denied: "Denied", not_billed: "Not billed",
};
const statusClasses: Record<BillingStatus, string> = {
  paid_full: "bg-paid-bg text-paid", unpaid: "bg-pending-bg text-pending",
  underpayment: "bg-underpayment-bg text-underpayment", denied: "bg-denied-bg text-denied",
  not_billed: "bg-missing-bg text-missing",
};
function money(value: ServiceTransaction[keyof ServiceTransaction]) {
  return typeof value === "number" ? currency.format(value) : "—";
}

const columns: ExcelColumn<ServiceTransaction>[] = [
  {
    key: "patientId",
    header: "Patient ID",
    width: 120,
    render: (value) => <span className="font-mono text-slate-500">{formatPatientId(String(value))}</span>,
    exportValue: (row) => formatPatientId(row.patientId),
  },
  {
    key: "patientName",
    header: "Patient",
    width: 180,
    render: (value, row) => row.claimNumber ? (
      <Link href={`/claims/${row.claimNumber}`} className="font-medium text-teal-600 hover:underline">
        {String(value)}
      </Link>
    ) : String(value),
  },
  { key: "dob", header: "DOB", width: 100 },
  { key: "phone", header: "Phone", width: 110, render: (value) => formatPhone(String(value)) },
  { key: "office", header: "Office", filter: "select" },
  { key: "date", header: "Date", width: 100 },
  { key: "slot", header: "Slot", width: 75 },
  { key: "eventType", header: "Event Type", filter: "select" },
  { key: "pcp", header: "PCP", filter: "select", width: 140 },
  { key: "physician", header: "Physician", filter: "select", width: 170 },
  {
    key: "cptCode",
    header: "CPT",
    render: (_, row) => (
      <span className="inline-flex items-center gap-1.5">
        <span>{row.cptCode ?? "—"}</span>
        {row.procedureCount > 1 ? (
          <span className="rounded-full bg-mist-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
            +{row.procedureCount - 1}
          </span>
        ) : null}
      </span>
    ),
  },
  { key: "payer", header: "Payer", filter: "select", width: 150 },
  { key: "payerCategory", header: "Payer Category", filter: "select" },
  { key: "billedAmount", header: "Billed", align: "right", render: money },
  { key: "allowedAmount", header: "Allowed", align: "right", render: money },
  { key: "paidAmount", header: "Paid", align: "right", render: money },
  { key: "reduction", header: "Reduction", align: "right", render: money },
  { key: "billingStatus", header: "Billing Status", filter: "select",
    filterOptions: Object.keys(statusLabels),
    render: (_, row) => <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClasses[row.billingStatus]}`}>{statusLabels[row.billingStatus]}</span>,
    exportValue: (row) => statusLabels[row.billingStatus] },
];

export function PtTransactionsTable({ rows, exportFilename }: { rows: ServiceTransaction[]; exportFilename: string }) {
  return <ExcelTable columns={columns} rows={rows} rowKey={(row) => row.visitId} dense stickyFirstColumn
    exportFilename={exportFilename} title="PT service transactions"
    caption="Click a patient to see all procedures (CPTs) billed that day."
    empty="No PT service transactions found for this office and month." />;
}
