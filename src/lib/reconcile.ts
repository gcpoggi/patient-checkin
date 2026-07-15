import { TIME_SLOTS, workdaysInMonth } from "@/lib/dates";
import { getStore } from "@/lib/store";
import { normalizeName, normalizePhone } from "@/lib/normalize";
import type { AttendanceMonth, AttendanceTotals, ClaimsKpis, OfficeId, ReconciledRow, SlotDayCell, TimeSlot } from "@/lib/types";

const emptyCell = (): SlotDayCell => ({ attended: 0, evals: 0, scheduled: 0, noShows: 0 });
const emptyTotals = (): AttendanceTotals => ({ ...emptyCell(), ptFu: 0 });

export function reconcileClaims(month: string, office?: OfficeId): { rows: ReconciledRow[]; kpis: ClaimsKpis } {
  const store = getStore();
  const claims = store.claims.filter(
    (claim) => claim.dateOfService.startsWith(`${month}-`) && (!office || claim.office === office),
  );
  const visits = store.visits.filter(
    (visit) => visit.date.startsWith(`${month}-`) && (!office || visit.office === office),
  );
  const matchedVisitIds = new Set<string>();
  const rows: ReconciledRow[] = [];

  for (const claim of claims) {
    const patient = store.patients.find(
      (candidate) =>
        normalizeName(candidate.fullName) === normalizeName(claim.patientName) &&
        (candidate.dob === claim.patientDob || normalizePhone(candidate.phone) === normalizePhone(claim.patientPhone)),
    );
    const visit = patient
      ? visits.find(
          (candidate) =>
            candidate.patientId === patient.id &&
            candidate.date === claim.dateOfService &&
            candidate.office === claim.office &&
            !matchedVisitIds.has(candidate.id),
        ) ?? null
      : null;
    if (visit) matchedVisitIds.add(visit.id);
    const status = visit
      ? claim.fileStatus === "paid" && claim.paidAmount > 0 ? "paid" : "pending"
      : "phantom";
    rows.push({
      status,
      claim,
      visit,
      patientName: claim.patientName,
      office: claim.office,
      dateOfService: claim.dateOfService,
      billedAmount: claim.billedAmount,
      paidAmount: claim.paidAmount,
    });
  }

  for (const visit of visits) {
    if (matchedVisitIds.has(visit.id) || visit.eventType === "account_only") continue;
    const patientName = store.patients.find((patient) => patient.id === visit.patientId)?.fullName ?? "Unknown patient";
    rows.push({ status: "missing", claim: null, visit, patientName, office: visit.office, dateOfService: visit.date, billedAmount: 0, paidAmount: 0 });
  }

  const counts = (status: ReconciledRow["status"]) => rows.filter((row) => row.status === status).length;
  const matchedClaims = rows.filter((row) => row.status === "paid" || row.status === "pending");
  const matchedBilled = matchedClaims.reduce((sum, row) => sum + row.billedAmount, 0);
  const collectedTotal = matchedClaims.reduce((sum, row) => sum + row.paidAmount, 0);
  const missing = counts("missing");
  const averageMatchedBilled = matchedClaims.length ? matchedBilled / matchedClaims.length : 0;
  const kpis: ClaimsKpis = {
    paid: counts("paid"), pending: counts("pending"), missing, phantom: counts("phantom"),
    billedTotal: claims.reduce((sum, claim) => sum + claim.billedAmount, 0),
    collectedTotal,
    atRiskAmount: rows.filter((row) => row.status === "phantom").reduce((sum, row) => sum + row.billedAmount, 0) + missing * averageMatchedBilled,
    collectionRate: matchedBilled ? collectedTotal / matchedBilled : 0,
  };
  return { rows, kpis };
}

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
