import { TIME_SLOTS, workdaysInMonth } from "@/lib/dates";
import { getStore } from "@/lib/store";
import type { AttendanceMonth, AttendanceTotals, OfficeId, SlotDayCell, TimeSlot } from "@/lib/types";

const emptyCell = (): SlotDayCell => ({ attended: 0, evals: 0, scheduled: 0, noShows: 0 });
const emptyTotals = (): AttendanceTotals => ({ ...emptyCell(), ptFu: 0 });

export function buildAttendanceMonth(office: OfficeId, month: string): AttendanceMonth {
  const store = getStore();
  const dates = workdaysInMonth(month);
  const dateSet = new Set(dates);
  const grid = Object.fromEntries(
    TIME_SLOTS.map((slot) => [slot, Object.fromEntries(dates.map((date) => [date, emptyCell()]))]),
  ) as Record<TimeSlot, Record<string, SlotDayCell>>;

  for (const appointment of store.appointments) {
    if (appointment.office === office && dateSet.has(appointment.date)) {
      grid[appointment.slot][appointment.date].scheduled += 1;
    }
  }
  for (const visit of store.visits) {
    if (visit.office === office && dateSet.has(visit.date) && visit.eventType !== "account_only") {
      const cell = grid[visit.slot][visit.date];
      cell.attended += 1;
      if (visit.eventType === "evaluation") cell.evals += 1;
    }
  }

  const dayTotals: Record<string, AttendanceTotals> = {};
  for (const date of dates) {
    const total = emptyTotals();
    for (const slot of TIME_SLOTS) {
      const cell = grid[slot][date];
      cell.noShows = Math.max(0, cell.scheduled - cell.attended);
      total.attended += cell.attended;
      total.evals += cell.evals;
      total.scheduled += cell.scheduled;
      total.noShows += cell.noShows;
    }
    total.ptFu = total.attended - total.evals;
    dayTotals[date] = total;
  }

  const monthTotals = dates.reduce((total, date) => {
    const day = dayTotals[date];
    total.attended += day.attended;
    total.evals += day.evals;
    total.scheduled += day.scheduled;
    total.noShows += day.noShows;
    total.ptFu += day.ptFu;
    return total;
  }, { ...emptyTotals(), attendanceRate: 0 });
  monthTotals.attendanceRate = monthTotals.scheduled ? monthTotals.attended / monthTotals.scheduled : 0;

  const year = month.slice(0, 4);
  const yearToDate = emptyTotals();
  for (const appointment of store.appointments) {
    if (appointment.office === office && appointment.date.startsWith(`${year}-`)) yearToDate.scheduled += 1;
  }
  for (const visit of store.visits) {
    if (visit.office === office && visit.date.startsWith(`${year}-`) && visit.eventType !== "account_only") {
      yearToDate.attended += 1;
      if (visit.eventType === "evaluation") yearToDate.evals += 1;
    }
  }
  yearToDate.ptFu = yearToDate.attended - yearToDate.evals;
  yearToDate.noShows = Math.max(0, yearToDate.scheduled - yearToDate.attended);

  return { office, month, slots: [...TIME_SLOTS], dates, grid, dayTotals, monthTotals, yearToDate };
}
