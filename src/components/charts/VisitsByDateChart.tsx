"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CHART_COLORS, CHART_GRID, CHART_TEXT, ChartTooltip } from "@/components/charts/theme";
import type { VisitDateBucket } from "@/lib/reconcile";

type Granularity = "week" | "month";

interface ChartRow {
  key: string;
  label: string;
  "Doctor Visits": number;
  "PT Therapies": number;
  Evals: number;
}

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Monday (UTC) of the week containing an ISO date, as "YYYY-MM-DD". */
function weekStart(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return date.toISOString().slice(0, 10);
}

function formatDayLabel(dateStr: string): string {
  const [, month, day] = dateStr.split("-");
  return `${MONTHS_SHORT[Number(month) - 1]} ${Number(day)}`;
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  return `${MONTHS_SHORT[Number(month) - 1]} ${year}`;
}

function emptyRow(key: string, label: string): ChartRow {
  return { key, label, "Doctor Visits": 0, "PT Therapies": 0, Evals: 0 };
}

export function VisitsByDateChart({ timeline, month }: { timeline: VisitDateBucket[]; month: string }) {
  const [granularity, setGranularity] = useState<Granularity>("week");

  const data = useMemo<ChartRow[]>(() => {
    const buckets = new Map<string, ChartRow>();

    if (granularity === "week") {
      // Weeks within the selected month only.
      for (const day of timeline.filter((entry) => entry.date.startsWith(`${month}-`))) {
        const key = weekStart(day.date);
        const row = buckets.get(key) ?? emptyRow(key, `Week of ${formatDayLabel(key)}`);
        row["Doctor Visits"] += day.doctorVisits;
        row["PT Therapies"] += day.ptVisits;
        row.Evals += day.evals;
        buckets.set(key, row);
      }
    } else {
      // One bar per month present in the store for this office.
      for (const day of timeline) {
        const key = day.date.slice(0, 7);
        const row = buckets.get(key) ?? emptyRow(key, formatMonthLabel(key));
        row["Doctor Visits"] += day.doctorVisits;
        row["PT Therapies"] += day.ptVisits;
        row.Evals += day.evals;
        buckets.set(key, row);
      }
    }

    return [...buckets.values()].sort((left, right) => left.key.localeCompare(right.key));
  }, [timeline, month, granularity]);

  const hasActivity = data.some(
    (row) => row["Doctor Visits"] > 0 || row["PT Therapies"] > 0 || row.Evals > 0,
  );

  return (
    <section className="rounded-xl border border-mist-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">Activity over time</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-navy">Monthly visits by date</h2>
        </div>
        <div className="inline-flex rounded-lg border border-mist-200 bg-mist-50 p-0.5">
          {(["week", "month"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setGranularity(option)}
              className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition ${
                granularity === option ? "bg-teal-500 text-white shadow-sm" : "text-navy hover:bg-mist-100"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {!hasActivity ? (
        <p className="flex h-72 items-center justify-center text-center text-sm text-slate-500">
          No visit activity found for this period.
        </p>
      ) : (
        <div className="mt-5 h-80 w-full" aria-label={`Doctor visits, PT therapies, and evals by ${granularity}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 12 }}>
              <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: CHART_TEXT, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis allowDecimals={false} tick={{ fill: CHART_TEXT, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(27,126,166,0.06)" }} />
              <Bar dataKey="Doctor Visits" stackId="visits" fill={CHART_COLORS.navy} radius={[0, 0, 3, 3]} />
              <Bar dataKey="PT Therapies" stackId="visits" fill={CHART_COLORS.teal400} />
              <Bar dataKey="Evals" stackId="visits" fill={CHART_COLORS.sky} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
