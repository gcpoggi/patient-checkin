import type { AttendanceMonth, TimeSlot } from "@/lib/types";

const labels: Record<TimeSlot, string> = { "07:00": "7:00 AM", "08:00": "8:00 AM", "09:00": "9:00 AM", "10:00": "10:00 AM", "11:00": "11:00 AM", "13:00": "1:00 PM", "14:00": "2:00 PM", "15:00": "3:00 PM", "16:00": "4:00 PM", "17:00": "5:00 PM" };
const heat = ["bg-white text-slate-300", "bg-teal-300/15 text-navy", "bg-teal-300/30 text-navy", "bg-teal-300/45 text-navy", "bg-teal-300/65 text-navy", "bg-teal-300 text-navy"];

export function AttendanceGrid({ attendance }: { attendance: AttendanceMonth }) {
  const footerRows = [
    ["TOTAL", "attended"], ["PT FU", "ptFu"], ["SCHEDULED", "scheduled"], ["EVALS", "evals"],
  ] as const;
  return (
    <section className="overflow-hidden rounded-xl border border-mist-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mist-200 p-5"><div><p className="text-xs font-semibold uppercase tracking-widest text-teal-600">Monthly worksheet</p><h2 className="mt-1 font-display text-xl font-semibold text-navy">PT attendance grid</h2></div><div className="rounded-lg bg-navy px-5 py-3 text-mist-100"><span className="mr-3 text-xs font-semibold uppercase tracking-widest text-teal-300">Total</span><span className="font-mono text-2xl font-bold tabular-nums text-white">{attendance.monthTotals.attended}</span></div></div>
      <div className="overflow-x-auto">
        <table className="min-w-max border-separate border-spacing-0 text-center font-mono text-xs tabular-nums">
          <thead><tr><th className="sticky left-0 z-20 min-w-28 border-b border-r border-mist-200 bg-navy px-3 py-3 text-left font-sans text-xs uppercase tracking-wider text-white">Time</th>{attendance.dates.map((date) => <th key={date} className="min-w-12 border-b border-r border-mist-200 bg-navy px-2 py-3 text-white">{Number(date.slice(5,7))}/{Number(date.slice(8))}</th>)}<th className="min-w-20 border-b bg-teal-700 px-3 py-3 text-white">TOTAL</th></tr></thead>
          <tbody>
            {attendance.slots.map((slot, index) => <SlotRows key={slot} slot={slot} attendance={attendance} lunchAfter={index === 4} />)}
            {footerRows.map(([label, key]) => <tr key={label} className={label === "TOTAL" ? "font-bold" : ""}><th className="sticky left-0 z-10 border-r border-t border-mist-200 bg-mist-100 px-3 py-2 text-left font-sans text-[11px] tracking-wide text-navy">{label}</th>{attendance.dates.map((date) => <td key={date} className="border-r border-t border-mist-200 bg-mist-50 px-2 py-2 text-navy">{attendance.dayTotals[date][key]}</td>)}<td className="border-t border-mist-200 bg-navy px-3 py-2 font-bold text-white">{attendance.monthTotals[key]}</td></tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SlotRows({ slot, attendance, lunchAfter }: { slot: TimeSlot; attendance: AttendanceMonth; lunchAfter: boolean }) {
  const slotTotal = attendance.dates.reduce((sum, date) => sum + attendance.grid[slot][date].attended, 0);
  const evalTotal = attendance.dates.reduce((sum, date) => sum + attendance.grid[slot][date].evals, 0);
  return <>
    <tr><th className="sticky left-0 z-10 border-b border-r border-mist-200 bg-white px-3 py-2 text-left font-sans font-semibold text-navy">{labels[slot]}</th>{attendance.dates.map((date) => { const value = attendance.grid[slot][date].attended; return <td key={date} className={`border-b border-r border-mist-200 px-2 py-2 ${heat[Math.min(5, value)]}`}>{value}</td>; })}<td className="border-b border-mist-200 bg-mist-100 px-3 py-2 font-bold text-navy">{slotTotal}</td></tr>
    <tr><th className="sticky left-0 z-10 border-b border-r border-mist-200 bg-missing-bg px-3 py-1 text-left font-sans text-[10px] font-bold tracking-widest text-missing">EVAL</th>{attendance.dates.map((date) => <td key={date} className="border-b border-r border-mist-200 bg-missing-bg/50 px-2 py-1 text-[10px] text-missing">{attendance.grid[slot][date].evals}</td>)}<td className="border-b border-mist-200 bg-missing-bg px-3 py-1 text-missing">{evalTotal}</td></tr>
    {lunchAfter ? <tr><th className="sticky left-0 z-10 border-b border-r border-mist-200 bg-slate-200 px-3 py-2 text-left font-sans font-semibold text-slate-600">12:00 PM</th><td colSpan={attendance.dates.length + 1} className="border-b border-mist-200 bg-slate-200 px-3 py-2 font-sans font-semibold tracking-[0.3em] text-slate-500">LUNCH</td></tr> : null}
  </>;
}
