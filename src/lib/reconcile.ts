import { TIME_SLOTS, workdaysInMonth } from "@/lib/dates";
import { getStore } from "@/lib/store";
import { normalizeName, normalizePhone } from "@/lib/normalize";
import type { AttendanceMonth, AttendanceTotals, Claim, ClaimError, ClaimsFinancialKpis, MonthlySummary, OfficeId, Patient, PhysicianSummary, ReconciledClaimRow, ServiceTransaction, SlotDayCell, TimeSlot, Visit } from "@/lib/types";

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
    const visit = matchVisitForClaim(claim, visits, store.patients, matchedVisitIds);
    const status = claim.fileStatus === "denied"
      ? "denied"
      : !visit
        ? "phantom"
        : claim.paidAmount === 0
          ? "unpaid"
          : claim.paidAmount < claim.medicareTotal
            ? "underpayment"
            : "paid_full";
    rows.push({
      status,
      claim,
      visit,
      patientName: claim.patientName,
      office: claim.office,
      dateOfService: claim.dateOfService,
      dateProcessed: claim.dateProcessed,
      totalDays: claim.totalDays,
      visitedProvider: claim.visitedProvider,
      billedAmount: claim.billedAmount,
      allowedAmount: claim.allowedAmount,
      paidAmount: claim.paidAmount,
      medicareTotal: claim.medicareTotal,
      underpayment: claim.underpayment,
      collectionPct: claim.medicareTotal ? claim.paidAmount / claim.medicareTotal : 0,
    });
  }

  const counts = (status: ReconciledClaimRow["status"]) => rows.filter((row) => row.status === status).length;
  const collectibleRows = rows.filter((row) => row.status === "paid_full" || row.status === "underpayment" || row.status === "unpaid");
  const collectionBase = collectibleRows.reduce((sum, row) => sum + row.medicareTotal, 0);
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
    medicareTotal: rows.reduce((sum, row) => sum + row.medicareTotal, 0),
    underpaymentTotal: collectibleRows.reduce((sum, row) => sum + row.underpayment, 0),
    unpaidAmount: rows.filter((row) => row.status === "unpaid").reduce((sum, row) => sum + row.medicareTotal, 0),
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

export function buildServiceTransactions(office: OfficeId, month: string): ServiceTransaction[] {
  const store = getStore();
  const claims = store.claims.filter(
    (claim) => claim.office === office && claim.dateOfService.startsWith(`${month}-`),
  );
  const matchedClaimIds = new Set<string>();
  const rows: ServiceTransaction[] = [];

  for (const visit of store.visits) {
    if (visit.office !== office || !visit.date.startsWith(`${month}-`) || visit.eventType === "account_only") continue;
    const patient = store.patients.find((candidate) => candidate.id === visit.patientId);
    if (!patient) continue;

    const serviceType = visit.eventType === "doctor" ? "physician" : "pt";
    const claim = claims.find(
      (candidate) =>
        !matchedClaimIds.has(candidate.id) &&
        candidate.dateOfService === visit.date &&
        candidate.serviceType === serviceType &&
        normalizeName(candidate.patientName) === normalizeName(patient.fullName) &&
        (candidate.patientDob === patient.dob || normalizePhone(candidate.patientPhone) === normalizePhone(patient.phone)),
    );
    if (claim) matchedClaimIds.add(claim.id);
    const allowedAmount = claim?.allowedAmount ?? null;

    rows.push({
      visitId: visit.id, patientId: patient.id, patientName: patient.fullName, dob: patient.dob,
      phone: patient.phone, office: visit.office, date: visit.date, slot: visit.slot,
      eventType: visit.eventType, serviceType, provider: claim?.provider || "Unassigned",
      cptCode: claim?.cptCode ?? null, payer: claim?.payer ?? null,
      payerCategory: claim?.payerCategory ?? null, billedAmount: claim?.billedAmount ?? null,
      paidAmount: claim?.paidAmount ?? null, allowedAmount,
      reduction: claim && allowedAmount !== null ? allowedAmount - claim.paidAmount : null,
      billingStatus: !claim ? "not_billed" : claim.fileStatus === "denied" ? "denied"
        : claim.paidAmount === 0 ? "unpaid" : claim.paidAmount < allowedAmount! ? "underpayment" : "paid_full",
    });
  }

  return rows.sort((left, right) => left.date.localeCompare(right.date) || left.patientName.localeCompare(right.patientName));
}

export function buildProviderAttendance(
  office: OfficeId,
  month: string,
): { physicians: PhysicianSummary[]; transactions: ServiceTransaction[] } {
  const store = getStore();
  const transactions = buildServiceTransactions(office, month);
  const byProvider = new Map<string, ServiceTransaction[]>();

  for (const transaction of transactions) {
    const group = byProvider.get(transaction.provider) ?? [];
    group.push(transaction);
    byProvider.set(transaction.provider, group);
  }

  const physicians = [...byProvider.entries()].map(([provider, rows]): PhysicianSummary => ({
    provider,
    specialty: store.physicians.find(
      (physician) => normalizeName(physician.name) === normalizeName(provider),
    )?.specialty ?? null,
    patients: new Set(rows.map((row) => row.patientId)).size,
    doctorVisits: rows.filter((row) => row.serviceType === "physician").length,
    ptVisits: rows.filter((row) => row.serviceType === "pt" && row.eventType !== "evaluation").length,
    evals: rows.filter((row) => row.eventType === "evaluation").length,
    billedTotal: rows.reduce((sum, row) => sum + (row.billedAmount ?? 0), 0),
    allowedTotal: rows.reduce((sum, row) => sum + (row.allowedAmount ?? 0), 0),
    paidTotal: rows.reduce((sum, row) => sum + (row.paidAmount ?? 0), 0),
  }));

  physicians.sort(
    (left, right) => right.patients - left.patients || left.provider.localeCompare(right.provider),
  );

  return { physicians, transactions };
}

export function buildMonthlySummary(office: OfficeId, month: string): MonthlySummary {
  const { physicians, transactions } = buildProviderAttendance(office, month);

  return {
    office,
    month,
    combined: {
      patients: new Set(transactions.map((transaction) => transaction.patientId)).size,
      doctorVisits: physicians.reduce((sum, physician) => sum + physician.doctorVisits, 0),
      ptVisits: physicians.reduce((sum, physician) => sum + physician.ptVisits, 0),
      evals: physicians.reduce((sum, physician) => sum + physician.evals, 0),
    },
    byProvider: physicians.map((physician) => ({
      provider: physician.provider,
      patients: physician.patients,
      doctorVisits: physician.doctorVisits,
      ptVisits: physician.ptVisits,
      evals: physician.evals,
    })),
  };
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
