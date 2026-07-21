import { TIME_SLOTS, workdaysInMonth } from "@/lib/dates";
import { allowedAmountForClaim } from "@/lib/feeSchedule";
import { getStore } from "@/lib/store";
import { normalizeName, normalizePhone } from "@/lib/normalize";
import type { AttendanceMonth, AttendanceTotals, Claim, ClaimError, ClaimsFinancialKpis, OfficeId, Patient, ReconciledClaimRow, SlotDayCell, TimeSlot, Visit } from "@/lib/types";

const emptyCell = (): SlotDayCell => ({ attended: 0, evals: 0, scheduled: 0, noShows: 0 });
const emptyTotals = (): AttendanceTotals => ({ ...emptyCell(), ptFu: 0 });

export function matchVisitForClaim(
  claim: Claim,
  visits: Visit[],
  patients: Patient[],
  matchedIds: Set<string>,
): Visit | null {
  const patient = patients.find(
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
          !matchedIds.has(candidate.id),
      ) ?? null
    : null;
  if (visit) matchedIds.add(visit.id);
  return visit;
}

export function reconcileClaims(month: string, office?: OfficeId): { rows: ReconciledClaimRow[]; kpis: ClaimsFinancialKpis } {
  const store = getStore();
  const claims = store.claims.filter(
    (claim) => claim.dateOfService.startsWith(`${month}-`) && (!office || claim.office === office),
  );
  const visits = store.visits.filter(
    (visit) => visit.date.startsWith(`${month}-`) && (!office || visit.office === office),
  );
  const matchedVisitIds = new Set<string>();
  const rows: ReconciledClaimRow[] = [];

  for (const claim of claims) {
    const allowedAmount = allowedAmountForClaim(claim);
    const reduction = allowedAmount - claim.paidAmount;
    const collectionPct = allowedAmount ? claim.paidAmount / allowedAmount : 0;
    const visit = matchVisitForClaim(claim, visits, store.patients, matchedVisitIds);
    const status = claim.fileStatus === "denied"
      ? "denied"
      : !visit
        ? "phantom"
        : claim.paidAmount === 0
          ? "unpaid"
          : claim.paidAmount < allowedAmount
            ? "underpayment"
            : "paid_full";
    rows.push({
      status,
      claim,
      visit,
      patientName: claim.patientName,
      office: claim.office,
      dateOfService: claim.dateOfService,
      billedAmount: claim.billedAmount,
      allowedAmount,
      paidAmount: claim.paidAmount,
      reduction,
      collectionPct,
    });
  }

  const counts = (status: ReconciledClaimRow["status"]) => rows.filter((row) => row.status === status).length;
  const collectibleRows = rows.filter((row) => row.status === "paid_full" || row.status === "underpayment" || row.status === "unpaid");
  const collectionBase = collectibleRows.reduce((sum, row) => sum + row.allowedAmount, 0);
  const collectedTotal = rows.reduce((sum, row) => sum + row.paidAmount, 0);
  const kpis: ClaimsFinancialKpis = {
    paidFull: counts("paid_full"),
    unpaid: counts("unpaid"),
    underpayment: counts("underpayment"),
    phantom: counts("phantom"),
    denied: counts("denied"),
    billedTotal: rows.reduce((sum, row) => sum + row.billedAmount, 0),
    allowedTotal: rows.reduce((sum, row) => sum + row.allowedAmount, 0),
    collectedTotal,
    reductionTotal: collectibleRows.reduce((sum, row) => sum + Math.max(0, row.reduction), 0),
    unpaidAmount: rows.filter((row) => row.status === "unpaid").reduce((sum, row) => sum + row.allowedAmount, 0),
    deniedAmount: rows.filter((row) => row.status === "denied").reduce((sum, row) => sum + row.billedAmount, 0),
    phantomAmount: rows.filter((row) => row.status === "phantom").reduce((sum, row) => sum + row.billedAmount, 0),
    collectionRate: collectionBase ? collectedTotal / collectionBase : 0,
  };
  return { rows, kpis };
}

export function detectPlaceOfServiceErrors(month: string, office?: OfficeId): ClaimError[] {
  return getStore().claims
    .filter(
      (claim) =>
        claim.dateOfService.startsWith(`${month}-`) &&
        (!office || claim.office === office) &&
        (claim.placeOfService === "inpatient" || claim.placeOfService === "observation"),
    )
    .map((claim) => ({
      claim,
      ruleId: "improper_pos",
      message: `CPT ${claim.cptCode} (${claim.description}) billed as ${claim.placeOfService.replace("_", " ")} — outpatient-only service.`,
    }));
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
