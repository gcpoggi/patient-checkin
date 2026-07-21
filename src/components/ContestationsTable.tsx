"use client";

import Link from "next/link";
import { ExcelTable, type ExcelColumn } from "@/components/ExcelTable";
import { StatusBadge } from "@/components/StatusBadge";
import type { Contestation } from "@/lib/types";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

const columns: ExcelColumn<Contestation>[] = [
  { key: "id", header: "ID", render: (value) => <Link className="font-semibold text-teal-700 hover:underline" href={`/contestations/${String(value)}`}>{String(value)}</Link> },
  { key: "insurer", header: "Insurer", width: 210 },
  { key: "reason", header: "Reason", filter: "select", render: (value) => <span className={`rounded-full px-2 py-1 text-xs font-semibold ${value === "denied" ? "bg-denied-bg text-denied" : "bg-underpayment-bg text-underpayment"}`}>{String(value) === "denied" ? "Denied" : "Underpayment"}</span> },
  { key: "claimIds", header: "# Claims", align: "right", filter: "none", render: (_, row) => row.claimIds.length, exportValue: (row) => row.claimIds.length },
  { key: "amountDemanded", header: "Amount Demanded", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "amountRecovered", header: "Amount Recovered", align: "right", filter: "none", render: (value) => money.format(Number(value)) },
  { key: "status", header: "Status", filter: "select", render: (value) => <StatusBadge status={value as Contestation["status"]} /> },
  { key: "createdAt", header: "Created", render: (value) => date.format(new Date(String(value))) },
];

export function ContestationsTable({ rows }: { rows: Contestation[] }) {
  return <ExcelTable columns={columns} rows={rows} rowKey={(row) => row.id} exportFilename="contestations" stickyFirstColumn empty="No contestations found." />;
}
