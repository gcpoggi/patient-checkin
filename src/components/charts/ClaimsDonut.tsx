"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_COLORS, ChartTooltip } from "@/components/charts/theme";
import type { ClaimsKpis } from "@/lib/types";

export function ClaimsDonut({ kpis }: { kpis: ClaimsKpis }) {
  const data = [
    { name: "Paid", value: kpis.paid, color: CHART_COLORS.paid },
    { name: "Pending", value: kpis.pending, color: CHART_COLORS.pending },
    { name: "Missing", value: kpis.missing, color: CHART_COLORS.missing },
    { name: "Phantom", value: kpis.phantom, color: CHART_COLORS.phantom },
  ];
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="rounded-xl border border-mist-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">Cross-check results</p>
      <h2 className="mt-1 font-display text-xl font-semibold text-navy">Claims status</h2>
      <div className="relative mt-3 h-72" aria-label={`Claims status chart, ${total} total records`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="86%" paddingAngle={2} stroke="none">
              {data.map((item) => <Cell key={item.name} fill={item.color} />)}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-semibold tabular-nums text-navy">{total}</span>
          <span className="text-xs uppercase tracking-widest text-slate-500">Total</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {data.map((item) => <div key={item.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-slate-600">{item.name}</span><span className="ml-auto font-mono tabular-nums text-navy">{item.value}</span></div>)}
      </div>
    </section>
  );
}
