"use client";

import Link from "next/link";

import { ExcelTable, type ExcelColumn } from "@/components/ExcelTable";
import { formatPhone } from "@/lib/format";
import type { BillingStatus, OfficeId, PhysicianSummary, ServiceTransaction } from "@/lib/types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const statusLabels: Record<BillingStatus, string> = {
  paid_full: "Paid in full",
  unpaid: "Unpaid",
  underpayment: "Underpayment",
  denied: "Denied",
  not_billed: "Not billed",
};
const statusClasses: Record<BillingStatus, string> = {
  paid_full: "bg-paid-bg text-paid",
  unpaid: "bg-pending-bg text-pending",
  underpayment: "bg-underpayment-bg text-underpayment",
  denied: "bg-denied-bg text-denied",
  not_billed: "bg-missing-bg text-missing",
};

function money(value: PhysicianSummary[keyof PhysicianSummary] | ServiceTransaction[keyof ServiceTransaction]) {
  return typeof value === "number" ? currency.format(value) : "—";
}

function physicianColumns(office: OfficeId, month: string): ExcelColumn<PhysicianSummary>[] {
  return [
    {
      key: "physician",
      header: "Physician",
      width: 190,
      render: (value) => {
        const physician = String(value);
        const params = new URLSearchParams({ office, month, physician });
        return <Link href={`/attendance/physicians?${params.toString()}`} className="font-semibold text-teal-700 hover:text-teal-500 hover:underline">{physician}</Link>;
      },
    },
    { key: "patients", header: "Patients", align: "right", filter: "none" },
    { key: "doctorVisits", header: "Doctor Visits", align: "right", filter: "none" },
    { key: "ptVisits", header: "PT Visits", align: "right", filter: "none" },
    { key: "evals", header: "Evals", align: "right", filter: "none" },
    { key: "billedTotal", header: "Billed", align: "right", filter: "none", render: money },
    { key: "allowedTotal", header: "Allowed", align: "right", filter: "none", render: money },
    { key: "paidTotal", header: "Paid", align: "right", filter: "none", render: money },
  ];
}

const transactionColumns: ExcelColumn<ServiceTransaction>[] = [
  { key: "patientName", header: "Patient", width: 180 },
  { key: "dob", header: "DOB", width: 100 },
  { key: "phone", header: "Phone", width: 110, render: (value) => formatPhone(String(value)) },
  { key: "pcp", header: "PCP", filter: "select", width: 140 },
  { key: "date", header: "Date", width: 100 },
  { key: "serviceType", header: "Service Type", filter: "select" },
  { key: "eventType", header: "Event Type", filter: "select" },
  { key: "cptCode", header: "CPT" },
  { key: "payer", header: "Payer", filter: "select", width: 150 },
  { key: "billedAmount", header: "Billed", align: "right", filter: "none", render: money },
  { key: "allowedAmount", header: "Allowed", align: "right", filter: "none", render: money },
  { key: "paidAmount", header: "Paid", align: "right", filter: "none", render: money },
  {
    key: "billingStatus",
    header: "Billing Status",
    filter: "select",
    filterOptions: Object.keys(statusLabels),
    render: (_, row) => <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClasses[row.billingStatus]}`}>{statusLabels[row.billingStatus]}</span>,
    exportValue: (row) => statusLabels[row.billingStatus],
  },
];

export function PhysicianSummaryTable({
  rows,
  office,
  month,
}: {
  rows: PhysicianSummary[];
  office: OfficeId;
  month: string;
}) {
  return <ExcelTable columns={physicianColumns(office, month)} rows={rows} rowKey={(row) => row.physician}
    dense stickyFirstColumn exportFilename={`physicians-${office}-${month}`} title="Physician attendance summary"
    empty="No physician attendance found for this office and month." />;
}

export function PhysicianTransactionsTable({ rows, office, month, physician }: {
  rows: ServiceTransaction[];
  office: OfficeId;
  month: string;
  physician: string;
}) {
  return <ExcelTable columns={transactionColumns} rows={rows} rowKey={(row) => row.visitId}
    dense stickyFirstColumn exportFilename={`physician-transactions-${office}-${month}-${physician}`}
    empty="No transactions found for this physician." />;
}
