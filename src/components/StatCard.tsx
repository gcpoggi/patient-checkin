export interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  variant?: "default" | "navy" | "warning";
}

export function StatCard({ label, value, sub, variant = "default" }: StatCardProps) {
  const navy = variant === "navy";
  const warning = variant === "warning";
  const cardClasses = navy
    ? "border-navy bg-navy text-mist-100"
    : warning
      ? "border-underpayment bg-underpayment-bg text-underpayment"
      : "border-mist-200 bg-white text-ink";

  return (
    <article className={`rounded-xl border p-5 shadow-sm ${cardClasses}`}>
      <p className={`text-xs font-semibold uppercase tracking-widest ${navy ? "text-teal-300" : warning ? "text-underpayment" : "text-teal-600"}`}>{label}</p>
      <p className={`mt-3 font-mono text-3xl font-medium tabular-nums ${navy ? "text-white" : warning ? "text-underpayment" : "text-navy"}`}>{value}</p>
      {sub ? <p className={`mt-2 text-xs ${navy ? "text-mist-200" : warning ? "text-underpayment/80" : "text-slate-500"}`}>{sub}</p> : null}
    </article>
  );
}
