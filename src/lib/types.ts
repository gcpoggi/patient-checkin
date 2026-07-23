export type OfficeId = "kendall" | "ponce";

export interface Office {
  id: OfficeId;
  name: string;
  city: string;
}

export type EventType =
  | "therapy"
  | "doctor"
  | "evaluation"
  | "followup"
  | "account_only";

export type VisitCategory = "pt" | "doctor" | "excluded";

export type TimeSlot =
  | "07:00"
  | "08:00"
  | "09:00"
  | "10:00"
  | "11:00"
  | "13:00"
  | "14:00"
  | "15:00"
  | "16:00"
  | "17:00";

export interface Patient {
  id: string;
  fullName: string;
  dob: string;
  phone: string;
  pcp: string;
  physician: string;
  office: OfficeId;
  createdAt: string;
  isSeed: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  office: OfficeId;
  date: string;
  slot: TimeSlot;
  type: EventType;
}

export interface Visit {
  id: string;
  patientId: string;
  appointmentId: string | null;
  office: OfficeId;
  date: string;
  slot: TimeSlot;
  eventType: EventType;
  checkedInAt: string;
  source: string;
}

export type ClaimFileStatus = "paid" | "submitted" | "denied";

export type ServiceType = "pt" | "physician";

export type PlaceOfService = "office" | "outpatient_hospital" | "inpatient" | "observation";

export type PayerCategory =
  | "medicare"
  | "medicare_advantage"
  | "aca_marketplace"
  | "workers_comp"
  | "commercial";

export interface ProcedureLine {
  cptCode: string;
  description: string;
  billedAmount: number;
  allowedAmount: number;
  planPaid: number;
  medicarePrice: number;
}

export interface Claim {
  id: string;
  claimNumber: string;
  patientName: string;
  patientDob: string;
  patientPhone: string;
  office: OfficeId;
  dateOfService: string;
  dateProcessed: string;
  totalDays: number;
  procedures: ProcedureLine[];
  cptCode: string;
  description: string;
  billedAmount: number;
  allowedAmount: number;
  paidAmount: number;
  medicareTotal: number;
  underpayment: number;
  payer: string;
  payerCategory: PayerCategory;
  provider: string;
  visitedProvider: string;
  serviceType: ServiceType;
  placeOfService: PlaceOfService;
  denialReason: string | null;
  fileStatus: ClaimFileStatus;
  paidDate: string | null;
  source: string;
}

export interface FeeScheduleEntry {
  cptCode: string;
  description: string;
  serviceType: ServiceType;
  billedAmount: number;
  medicareAllowed: number;
  wcAllowed: number;
  medicarePrice: number;
}

export interface Physician {
  id: string;
  name: string;
  specialty: string;
}

export interface PhysicianSummary {
  physician: string;
  specialty: string | null;
  patients: number;
  initialVisits: number;
  followups: number;
  doctorVisits: number;
  ptVisits: number;
  evals: number;
  billedTotal: number;
  allowedTotal: number;
  paidTotal: number;
}

export interface MonthlySummary {
  office: OfficeId;
  month: string;
  combined: { patients: number; doctorVisits: number; ptVisits: number; evals: number };
  byPhysician: Array<{
    physician: string;
    patients: number;
    initialVisits: number;
    followups: number;
    doctorVisits: number;
    ptVisits: number;
    evals: number;
  }>;
}

export type BillingStatus = "paid_full" | "unpaid" | "underpayment" | "denied" | "not_billed";

export interface ServiceTransaction {
  visitId: string;
  patientId: string;
  patientName: string;
  dob: string;
  phone: string;
  office: OfficeId;
  date: string;
  slot: TimeSlot;
  eventType: EventType;
  serviceType: ServiceType;
  pcp: string;
  physician: string;
  cptCode: string | null;
  payer: string | null;
  payerCategory: PayerCategory | null;
  billedAmount: number | null;
  paidAmount: number | null;
  allowedAmount: number | null;
  reduction: number | null;
  billingStatus: BillingStatus;
}

export type ClaimStatus = "paid_full" | "unpaid" | "underpayment" | "phantom" | "denied";

export interface ReconciledClaimRow {
  status: ClaimStatus;
  claim: Claim;
  visit: Visit | null;
  patientName: string;
  office: OfficeId;
  dateOfService: string;
  billedAmount: number;
  allowedAmount: number;
  paidAmount: number;
  medicareTotal: number;
  underpayment: number;
  dateProcessed: string;
  totalDays: number;
  visitedProvider: string;
  collectionPct: number;
}

export interface ClaimsFinancialKpis {
  paidFull: number;
  unpaid: number;
  underpayment: number;
  phantom: number;
  denied: number;
  billedTotal: number;
  allowedTotal: number;
  collectedTotal: number;
  medicareTotal: number;
  underpaymentTotal: number;
  unpaidAmount: number;
  deniedAmount: number;
  phantomAmount: number;
  collectionRate: number;
}

export interface ClaimError {
  claim: Claim;
  ruleId: "improper_pos";
  message: string;
}

export type ContestationStatus = "draft" | "submitted" | "won" | "lost";

export type ContestationReason = "underpayment" | "denied";

export interface Contestation {
  id: string;
  office: OfficeId;
  insurer: string;
  claimIds: string[];
  reason: ContestationReason;
  amountDemanded: number;
  amountRecovered: number;
  status: ContestationStatus;
  createdAt: string;
  submittedAt: string | null;
  resolvedAt: string | null;
  letterBody: string;
  notes: string;
  createdBy: string;
}

export interface ContestationSummary {
  totalDemanded: number;
  totalRecovered: number;
  winRate: number;
  byStatus: Record<ContestationStatus, number>;
}

export interface SlotDayCell {
  attended: number;
  evals: number;
  scheduled: number;
  noShows: number;
}

export interface AttendanceTotals extends SlotDayCell {
  ptFu: number;
}

export interface AttendanceMonth {
  office: OfficeId;
  month: string;
  slots: TimeSlot[];
  dates: string[];
  grid: Record<TimeSlot, Record<string, SlotDayCell>>;
  dayTotals: Record<string, AttendanceTotals>;
  monthTotals: AttendanceTotals & { attendanceRate: number };
  yearToDate: AttendanceTotals;
}
