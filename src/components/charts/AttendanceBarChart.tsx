"use client";

import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS, CHART_GRID, CHART_TEXT, ChartTooltip } from "@/components/charts/theme";
import type { AttendanceMonth } from "@/lib/types";

export function AttendanceBarChart({ attendance }: { attendance: AttendanceMonth }) {
  const data = attendance.dates.map((date) => ({
    date: `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`,
    "PT-FU": attendance.dayTotals[date].ptFu,
    EVAL: attendance.dayTotals[date].evals,
    Scheduled: attendance.dayTotals[date].scheduled,
  }));

  return (
    <section className="rounded-xl border border-mist-200 bg-white p-5 shadow-sm">
      <div className="mb-5"><p className="text-xs font-semibold uppercase tracking-widest text-teal-600">Daily volume</p><h2 className="mt-1 font-display text-xl font-semibold text-navy">Attendance vs schedule</h2></div>
      {!data.length ? <p className="py-16 text-center text-sm text-slate-500">No workdays available for this month.</p> :
        <div className="h-80 w-full" aria-label="Daily attendance chart">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 4 }}>
              <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: CHART_TEXT, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: CHART_TEXT, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="PT-FU" stackId="attendance" fill={CHART_COLORS.teal} radius={[0, 0, 3, 3]} />
              <Bar dataKey="EVAL" stackId="attendance" fill={CHART_COLORS.sky} radius={[3, 3, 0, 0]} />
              <Line dataKey="Scheduled" stroke={CHART_COLORS.navy} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>}
    </section>
  );
}
