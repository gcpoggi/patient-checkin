import type { ClaimStatus } from "@/lib/types";

export interface StatusBadgeProps {
  status: ClaimStatus;
}

const statusStyles: Record<ClaimStatus, { label: string; classes: string; dot: string }> = {
  paid_full: { label: "Paid in full", classes: "bg-paid-bg text-paid", dot: "bg-paid" },
  unpaid: { label: "Unpaid", classes: "bg-pending-bg text-pending", dot: "bg-pending" },
  underpayment: { label: "Underpayment", classes: "bg-underpayment-bg text-underpayment", dot: "bg-underpayment" },
  phantom: { label: "Phantom", classes: "bg-phantom-bg text-phantom", dot: "bg-phantom" },
  denied: { label: "Denied", classes: "bg-denied-bg text-denied", dot: "bg-denied" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {style.label}
    </span>
  );
}
