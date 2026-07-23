"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CHART_COLORS, CHART_GRID, CHART_TEXT, ChartTooltip } from "@/components/charts/theme";
import type { MonthlySummary } from "@/lib/types";

function shortenProviderName(name: string): string {
  return name.length > 18 ? `${name.slice(0, 16)}…` : name;
}

export function ProviderPatientsBarChart({ summary }: { summary: MonthlySummary }) {
  const data = summary.byPhysician.map((row) => ({
    physician: row.physician,
    axisLabel: shortenProviderName(row.physician),
    "Initial Visits": row.initialVisits,
    "Follow-ups": row.followups,
    "PT Therapies": row.ptVisits,
    Evals: row.evals,
  }));
  const hasActivity = data.some(
    (row) =>
      row["Initial Visits"] > 0 ||
      row["Follow-ups"] > 0 ||
      row["PT Therapies"] > 0 ||
      row.Evals > 0,
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
        <div
          className="mt-5 h-80 w-full"
          aria-label="Initial visits, follow-ups, PT therapies, and evals by physician"
        >
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
              <Tooltip content={<ChartTooltip />} labelFormatter={(_, payload) => payload?.[0]?.payload?.physician ?? ""} />
              <Bar dataKey="Initial Visits" stackId="visits" fill={CHART_COLORS.navy} radius={[0, 0, 3, 3]} />
              <Bar dataKey="Follow-ups" stackId="visits" fill={CHART_COLORS.teal} />
              <Bar dataKey="PT Therapies" stackId="visits" fill={CHART_COLORS.teal400} />
              <Bar dataKey="Evals" stackId="visits" fill={CHART_COLORS.sky} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
