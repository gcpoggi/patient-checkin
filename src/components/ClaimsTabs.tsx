"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import type { ReconciledRow, ReconStatus } from "@/lib/types";

interface ClaimsTabsProps {
  rows: ReconciledRow[];
  activeStatus: ReconStatus;
  counts: Record<ReconStatus, number>;
}

interface DisplayRow {
  patient: string;
  office: string;
  date: string;
  cpt: string;
  payer: string;
  billed: number | null;
  paid: number | null;
  visitType: string;
  note: string;
  status: ReconStatus;
}

const labels: Record<ReconStatus, { short: string; long: string }> = {
  paid: { short: "Paid", long: "Billed & paid" },
  pending: { short: "Pending", long: "Billed, payment pending" },
  missing: { short: "Missing", long: "Service not billed" },
  phantom: { short: "Phantom", long: "Phantom charge" },
};
const statuses = Object.keys(labels) as ReconStatus[];
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

const baseColumns: DataTableColumn<DisplayRow>[] = [
  { key: "patient", header: "Patient" },
  { key: "office", header: "Office", render: (value) => <span className="capitalize">{String(value)}</span> },
  { key: "date", header: "Date of Service", render: (value) => date.format(new Date(`${String(value)}T00:00:00Z`)) },
];
const statusColumn: DataTableColumn<DisplayRow> = { key: "status", header: "Status", render: (_, row) => <StatusBadge status={row.status} /> };
const claimColumns: DataTableColumn<DisplayRow>[] = [
  ...baseColumns,
  { key: "cpt", header: "CPT" }, { key: "payer", header: "Payer" },
  { key: "billed", header: "Billed", align: "right", render: (value) => value == null ? "" : money.format(Number(value)) },
  { key: "paid", header: "Paid", align: "right", render: (value) => value == null ? "" : money.format(Number(value)) },
  statusColumn,
];

export function ClaimsTabs({ rows, activeStatus, counts }: ClaimsTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const displayRows: DisplayRow[] = rows.filter((row) => row.status === activeStatus).map((row) => ({
    patient: row.patientName, office: row.office, date: row.dateOfService,
    cpt: row.claim?.cptCode ?? "", payer: row.claim?.payer ?? "",
    billed: row.claim ? row.billedAmount : null, paid: row.claim ? row.paidAmount : null,
    visitType: row.visit?.eventType.replaceAll("_", " ") ?? "", status: row.status,
    note: row.status === "missing" ? "Never billed" : row.status === "phantom" ? "No visit on record" : "",
  }));
  const columns = activeStatus === "missing"
    ? [...baseColumns, { key: "visitType", header: "Visit type", render: (value: DisplayRow[keyof DisplayRow]) => <span className="capitalize">{String(value)}</span> } as DataTableColumn<DisplayRow>, { key: "note", header: "Note" } as DataTableColumn<DisplayRow>, statusColumn]
    : activeStatus === "phantom"
      ? [...baseColumns, { key: "cpt", header: "CPT" }, { key: "payer", header: "Payer" }, { key: "billed", header: "Billed", align: "right", render: (value) => money.format(Number(value)) }, { key: "note", header: "Note" }, statusColumn] as DataTableColumn<DisplayRow>[]
      : claimColumns;

  function selectStatus(status: ReconStatus) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", status);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <section>
      <div className="mb-4 flex gap-2 overflow-x-auto" role="tablist" aria-label="Claims status">
        {statuses.map((status) => <button key={status} type="button" role="tab" aria-selected={activeStatus === status} title={labels[status].long} onClick={() => selectStatus(status)} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${activeStatus === status ? "bg-navy text-white shadow-sm" : "border border-mist-200 bg-white text-slate-600 hover:text-navy"}`}><span>{labels[status].short}</span><span className={`rounded-full px-2 py-0.5 font-mono text-xs tabular-nums ${activeStatus === status ? "bg-white/15 text-white" : "bg-mist-100 text-teal-700"}`}>{counts[status]}</span></button>)}
      </div>
      <p className="mb-3 text-sm text-slate-500">{labels[activeStatus].long}</p>
      <DataTable columns={columns} rows={displayRows} empty={`No ${labels[activeStatus].short.toLowerCase()} records found.`} />
    </section>
  );
}
