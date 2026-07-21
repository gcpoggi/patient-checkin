"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CHART_COLORS, CHART_GRID, CHART_TEXT, ChartTooltip } from "@/components/charts/theme";
import type { MonthlySummary } from "@/lib/types";

function shortenProviderName(name: string): string {
  return name.length > 18 ? `${name.slice(0, 16)}…` : name;
}

export function ProviderPatientsBarChart({ summary }: { summary: MonthlySummary }) {
  const data = summary.byProvider.map((row) => ({
    provider: row.provider,
    axisLabel: shortenProviderName(row.provider),
    "Doctor visits": row.doctorVisits,
    "PT visits": row.ptVisits,
    Evaluations: row.evals,
  }));
  const hasActivity = data.some(
    (row) => row["Doctor visits"] > 0 || row["PT visits"] > 0 || row.Evaluations > 0,
  );

  return (
    <section className="rounded-xl border border-mist-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">Provider volume</p>
      <h2 className="mt-1 font-display text-xl font-semibold text-navy">Monthly visits by physician</h2>
      {!hasActivity ? (
        <p className="flex h-72 items-center justify-center text-center text-sm text-slate-500">
          No provider activity found for this period.
        </p>
      ) : (
        <div className="mt-5 h-80 w-full" aria-label="Doctor, PT, and evaluation visits by physician">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 12 }}>
              <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="axisLabel"
                tick={{ fill: CHART_TEXT, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis allowDecimals={false} tick={{ fill: CHART_TEXT, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} labelFormatter={(_, payload) => payload?.[0]?.payload?.provider ?? ""} />
              <Bar dataKey="Doctor visits" stackId="visits" fill={CHART_COLORS.navy} radius={[0, 0, 3, 3]} />
              <Bar dataKey="PT visits" stackId="visits" fill={CHART_COLORS.teal400} />
              <Bar dataKey="Evaluations" stackId="visits" fill={CHART_COLORS.sky} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
