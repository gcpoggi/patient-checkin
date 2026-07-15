export interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  variant?: "default" | "navy";
}

export function StatCard({ label, value, sub, variant = "default" }: StatCardProps) {
  const navy = variant === "navy";

  return (
    <article className={`rounded-xl border p-5 shadow-sm ${navy ? "border-navy bg-navy text-mist-100" : "border-mist-200 bg-white text-ink"}`}>
      <p className={`text-xs font-semibold uppercase tracking-widest ${navy ? "text-teal-300" : "text-teal-600"}`}>{label}</p>
      <p className={`mt-3 font-mono text-3xl font-medium tabular-nums ${navy ? "text-white" : "text-navy"}`}>{value}</p>
      {sub ? <p className={`mt-2 text-xs ${navy ? "text-mist-200" : "text-slate-500"}`}>{sub}</p> : null}
    </article>
  );
}
