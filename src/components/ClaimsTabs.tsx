"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ExcelTable, type ExcelColumn } from "@/components/ExcelTable";
import { StatusBadge } from "@/components/StatusBadge";
import { CLAIM_FILE_STATUS_LABELS, CLAIM_STATUS_LABELS, formatPatientId } from "@/lib/format";
import type { ClaimStatus, ReconciledClaimRow } from "@/lib/types";

type TabStatus = Exclude<ClaimStatus, "paid_full">;

interface ClaimsTabsProps {
  rows: ReconciledClaimRow[];
  activeStatus: TabStatus;
  counts: Record<TabStatus, number>;
  month: string;
}

const labels: Record<TabStatus, { short: string; long: string }> = {
  partial_paid: { short: "Partial Paid", long: "Plan issued a partial payment, balance still under review" },
  unpaid: { short: "Unpaid", long: "Received by the plan, no payment yet (plan may label it Under review)" },
  underpayment: { short: "Underpaid", long: "Plan payment finalized below 100% Medicare / Workers Comp" },
  phantom: { short: "Phantom", long: "Claims with no visit on record" },
  denied: { short: "Denied", long: "Claims the payer refused to pay; must be contested" },
};
const statuses = Object.keys(labels) as TabStatus[];
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function statusPill(row: ReconciledClaimRow) {
  const denial = row.status === "denied" && row.claim.denialReason
    ? `${row.claim.denialCode ? `${row.claim.denialCode}: ` : ""}${row.claim.denialReason}`
    : null;
  const note = row.status === "phantom" ? "No visit on record" : denial;
  return (
    <div className="space-y-1">
      <StatusBadge status={row.status} />
      <p className="text-[10px] uppercase tracking-wide text-slate-400">Plan: {CLAIM_FILE_STATUS_LABELS[row.claim.fileStatus]}</p>
      {row.contested ? <span className="inline-flex rounded-full bg-mist-100 px-2 py-0.5 text-[10px] font-semibold text-contest-submitted">Contested</span> : null}
      {note ? <p className="max-w-48 whitespace-normal text-[11px] text-slate-500">{note}</p> : null}
    </div>
  );
}

const columns: ExcelColumn<ReconciledClaimRow>[] = [
  { key: "patientId", header: "Patient ID", width: 14, render: (value) => <span className="font-mono text-slate-500">{formatPatientId(value as string | null)}</span>, exportValue: (row) => formatPatientId(row.patientId) },
  { key: "patientName", header: "Patient", width: 24 },
  { key: "claim", header: "Claim #", width: 16, render: (_, row) => <Link href={`/claims/${encodeURIComponent(row.claim.claimNumber)}`} className="font-mono font-semibold text-teal-700 hover:underline">{row.claim.claimNumber}</Link>, sortValue: (row) => row.claim.claimNumber, exportValue: (row) => row.claim.claimNumber },
  { key: "office", header: "Office", filter: "select", render: (value) => <span className="capitalize">{String(value)}</span> },
  { key: "dateOfService", header: "Date Visited", width: 14 },
  { key: "visitedProvider", header: "Physician", filter: "select", width: 24 },
  { key: "status", header: "Claim Status", render: (_, row) => statusPill(row), sortValue: (row) => CLAIM_STATUS_LABELS[row.status], exportValue: (row) => `${CLAIM_STATUS_LABELS[row.status]}${row.contested ? " (Contested)" : ""}` },
  { key: "dateProcessed", header: "Date Processed", width: 14 },
  { key: "totalDays", header: "Total Days", align: "right" },
  { key: "billedAmount", header: "Total Billed", align: "right", render: (value) => <span className="font-mono tabular-nums">{money.format(Number(value))}</span> },
  { key: "allowedAmount", header: "Total Cost (Allowed)", align: "right", render: (value) => <span className="font-mono tabular-nums">{money.format(Number(value))}</span> },
  { key: "paidAmount", header: "Plan Paid", align: "right", render: (value) => <span className="font-mono tabular-nums">{money.format(Number(value))}</span> },
  { key: "medicareTotal", header: "100% Medicare", align: "right", render: (value) => <span className="font-mono tabular-nums">{money.format(Number(value))}</span> },
  { key: "underpayment", header: "Underpayment", align: "right", render: (value) => <span className="rounded bg-underpayment-bg px-2 py-0.5 font-mono font-semibold tabular-nums text-underpayment">{money.format(Number(value))}</span> },
  { key: "visit", header: "Action", filter: "none", sortable: false, render: (_, row) => row.contested ? <span className="text-xs font-semibold text-contest-submitted">Contested</span> : row.status === "underpayment" || row.status === "denied" ? <Link className="font-semibold text-teal-700 hover:underline" href={`/contestations/new?claimIds=${encodeURIComponent(row.claim.id)}&insurer=${encodeURIComponent(row.claim.payer)}&reason=${row.status === "denied" ? "denied" : "underpayment"}&amount=${row.status === "denied" ? row.billedAmount : row.underpayment}`}>Contest</Link> : null, exportValue: (row) => row.contested ? "Contested" : "" },
];

export function ClaimsTabs({ rows, activeStatus, counts, month }: ClaimsTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const displayRows = rows.filter((row) => row.status === activeStatus);

  function selectStatus(status: TabStatus) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", status);
    router.push(`${pathname}?${params.toString()}`);
  }

  return <section><div className="mb-4 flex gap-2 overflow-x-auto" role="tablist" aria-label="Claims status">{statuses.map((status) => <button key={status} type="button" role="tab" aria-selected={activeStatus === status} title={labels[status].long} onClick={() => selectStatus(status)} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${activeStatus === status ? "bg-navy text-white shadow-sm" : "border border-mist-200 bg-white text-slate-600 hover:text-navy"}`}><span>{labels[status].short}</span><span className={`rounded-full px-2 py-0.5 font-mono text-xs tabular-nums ${activeStatus === status ? "bg-white/15 text-white" : "bg-mist-100 text-teal-700"}`}>{counts[status]}</span></button>)}</div><p className="mb-3 text-sm text-slate-500">{labels[activeStatus].long}</p><ExcelTable columns={columns} rows={displayRows} rowKey={(row) => row.claim.id} dense stickyFirstColumn exportFilename={`claims-${activeStatus}-${month}`} empty={`No ${labels[activeStatus].short.toLowerCase()} records found.`} /></section>;
}
