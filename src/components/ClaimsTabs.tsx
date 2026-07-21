"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import type { ClaimStatus, ReconciledClaimRow } from "@/lib/types";

type TabStatus = Exclude<ClaimStatus, "paid_full">;

interface ClaimsTabsProps {
  rows: ReconciledClaimRow[];
  activeStatus: TabStatus;
  counts: Record<TabStatus, number>;
}

interface DisplayRow {
  patient: string;
  office: string;
  date: string;
  cpt: string;
  payer: string;
  payerCategory: string;
  billed: number;
  allowed: number;
  paid: number;
  reduction: number;
  collectionPct: number;
  status: ClaimStatus;
  note: string;
  claimId: string;
  contestAmount: number;
}

const labels: Record<TabStatus, { short: string; long: string }> = {
  unpaid: { short: "Unpaid", long: "Matched services with no payment received" },
  underpayment: { short: "Underpayment", long: "Payments below the contracted allowed amount" },
  phantom: { short: "Phantom", long: "Claims with no visit on record" },
  denied: { short: "Denied", long: "Claims denied by the payer" },
};
const statuses = Object.keys(labels) as TabStatus[];
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

const columns: DataTableColumn<DisplayRow>[] = [
  { key: "patient", header: "Patient" },
  { key: "office", header: "Office", render: (value) => <span className="capitalize">{String(value)}</span> },
  { key: "date", header: "Date of Service", render: (value) => date.format(new Date(`${String(value)}T00:00:00Z`)) },
  { key: "cpt", header: "CPT" },
  { key: "payer", header: "Payer" },
  { key: "payerCategory", header: "Payer Category", render: (value) => <span className="capitalize">{String(value).replaceAll("_", " ")}</span> },
  { key: "billed", header: "Billed", align: "right", render: (value) => money.format(Number(value)) },
  { key: "allowed", header: "Allowed", align: "right", render: (value) => money.format(Number(value)) },
  { key: "paid", header: "Paid", align: "right", render: (value) => money.format(Number(value)) },
  { key: "reduction", header: "Reduction", align: "right", render: (value) => money.format(Number(value)) },
  { key: "collectionPct", header: "Collection %", align: "right", render: (value) => percent.format(Number(value)) },
  { key: "status", header: "Status", render: (_, row) => <div><StatusBadge status={row.status} />{row.note ? <p className="mt-1 max-w-56 whitespace-normal text-xs text-slate-500">{row.note}</p> : null}</div> },
  { key: "claimId", header: "Action", render: (_, row) => row.status === "underpayment" || row.status === "denied" ? <Link className="font-semibold text-teal-700 hover:underline" href={`/contestations/new?claimIds=${encodeURIComponent(row.claimId)}&insurer=${encodeURIComponent(row.payer)}&reason=${row.status}&amount=${row.contestAmount}`}>Contest</Link> : null },
];

export function ClaimsTabs({ rows, activeStatus, counts }: ClaimsTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const displayRows: DisplayRow[] = rows.filter((row) => row.status === activeStatus).map((row) => ({
    patient: row.patientName,
    office: row.office,
    date: row.dateOfService,
    cpt: row.claim.cptCode,
    payer: row.claim.payer,
    payerCategory: row.claim.payerCategory,
    billed: row.billedAmount,
    allowed: row.allowedAmount,
    paid: row.paidAmount,
    reduction: row.reduction,
    collectionPct: row.collectionPct,
    status: row.status,
    note: row.status === "phantom" ? "No visit on record" : row.status === "denied" ? row.claim.denialReason ?? "Denied by payer" : "",
    claimId: row.claim.id,
    contestAmount: row.status === "denied" ? row.billedAmount : Math.max(0, row.reduction),
  }));

  function selectStatus(status: TabStatus) {
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
