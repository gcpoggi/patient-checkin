import Link from "next/link";

export interface UploadResult {
  ok: true;
  parsed: number;
  merged: number;
  added: number;
  replaced: number;
  rejected: Array<{ row: number; reason: string }>;
}

export function UploadSummary({ result }: { result: UploadResult }) {
  const counts = [
    ["Parsed", result.parsed],
    ["Merged", result.merged],
    ["Added", result.added],
    ["Replaced", result.replaced],
  ] as const;

  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-mist-200 bg-white shadow-sm" aria-live="polite">
      <div className="grid grid-cols-2 divide-x divide-y divide-mist-200 sm:grid-cols-4 sm:divide-y-0">
        {counts.map(([label, value]) => (
          <div key={label} className="p-4 text-center">
            <p className="font-mono text-2xl font-semibold tabular-nums text-navy">{value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-teal-600">{label}</p>
          </div>
        ))}
      </div>

      {result.rejected.length > 0 ? (
        <div className="border-t border-mist-200 bg-[#FBE9E9] p-4">
          <h3 className="font-semibold text-[#991B1B]">Skipped {result.rejected.length} invalid row{result.rejected.length === 1 ? "" : "s"}</h3>
          <ul className="mt-2 space-y-1 text-sm text-[#991B1B]">
            {result.rejected.map((item) => <li key={`${item.row}-${item.reason}`}>Row {item.row}: {item.reason}</li>)}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 border-t border-mist-200 bg-navy p-5 text-mist-100 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">The four claims views — Paid, Pending, Missing, and Phantom — were recomputed.</p>
        <Link href="/claims?month=2026-01" className="shrink-0 rounded-lg bg-teal-500 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-teal-600">
          Open Claims views
        </Link>
      </div>
    </section>
  );
}
