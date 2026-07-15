"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS, CHART_GRID, CHART_TEXT, ChartTooltip } from "@/components/charts/theme";
import type { ReconciledRow } from "@/lib/types";

export function CollectionsBar({ rows }: { rows: ReconciledRow[] }) {
  const buckets = Array.from({ length: 5 }, (_, index) => ({ week: `Week ${index + 1}`, Billed: 0, Collected: 0 }));
  for (const row of rows) {
    const bucket = Math.min(4, Math.floor((Number(row.dateOfService.slice(8, 10)) - 1) / 7));
    buckets[bucket].Billed += row.billedAmount;
    if (row.status === "paid" || row.status === "pending") buckets[bucket].Collected += row.paidAmount;
  }
  const data = buckets.filter((bucket, index) => index < 4 || bucket.Billed || bucket.Collected);
  const hasActivity = rows.some((row) => row.billedAmount > 0 || row.paidAmount > 0);

  return (
    <section className="rounded-xl border border-mist-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">Financial activity</p>
      <h2 className="mt-1 font-display text-xl font-semibold text-navy">Billed vs collected</h2>
      {!hasActivity ? (
        <p className="flex h-72 items-center justify-center text-center text-sm text-slate-500">No financial activity found for this period.</p>
      ) : <div className="mt-5 h-72" aria-label="Weekly billed and collected amounts">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" tick={{ fill: CHART_TEXT, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(value: number) => `$${value}`} tick={{ fill: CHART_TEXT, fontSize: 11 }} axisLine={false} tickLine={false} width={64} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="Billed" fill={CHART_COLORS.teal} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Collected" fill={CHART_COLORS.sky} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>}
    </section>
  );
}
