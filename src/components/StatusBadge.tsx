export type Status = "paid" | "pending" | "missing" | "phantom";

export interface StatusBadgeProps {
  status: Status;
}

const statusStyles: Record<Status, { label: string; classes: string; dot: string }> = {
  paid: { label: "Paid", classes: "bg-paid-bg text-paid", dot: "bg-paid" },
  pending: { label: "Pending", classes: "bg-pending-bg text-pending", dot: "bg-pending" },
  missing: { label: "Missing", classes: "bg-missing-bg text-missing", dot: "bg-missing" },
  phantom: { label: "Phantom", classes: "bg-phantom-bg text-phantom", dot: "bg-phantom" },
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
