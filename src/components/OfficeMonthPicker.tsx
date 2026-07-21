"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { OfficeId } from "@/lib/types";

export function OfficeMonthPicker({ current, month }: { current: OfficeId; month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: "office" | "month", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-mist-200 bg-white p-3 shadow-sm sm:gap-4">
      <div className="flex w-full rounded-lg bg-mist-100 p-1 sm:w-auto" aria-label="Office">
        {(["kendall", "ponce"] as const).map((office) => (
          <button key={office} type="button" onClick={() => update("office", office)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold capitalize transition sm:flex-none ${current === office ? "bg-teal-500 text-white shadow-sm" : "text-slate-600 hover:text-navy"}`}
            aria-pressed={current === office}>{office}</button>
        ))}
      </div>
      <label className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-semibold text-navy sm:gap-3">
        Month
        <select value={month} onChange={(event) => update("month", event.target.value)} className="rounded-lg border border-mist-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-hpp focus:ring-2 focus:ring-sky-hpp/20">
          <option value="2026-01">January</option><option value="2026-02">February</option>
        </select>
      </label>
      <span className="font-mono text-sm font-semibold tabular-nums text-teal-700 sm:ml-auto">2026</span>
    </div>
  );
}
