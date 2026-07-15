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

export interface Claim {
  id: string;
  patientName: string;
  patientDob: string;
  patientPhone: string;
  office: OfficeId;
  dateOfService: string;
  cptCode: string;
  description: string;
  billedAmount: number;
  paidAmount: number;
  payer: string;
  fileStatus: ClaimFileStatus;
  paidDate: string | null;
  source: string;
}

export type ReconStatus = "paid" | "pending" | "missing" | "phantom";

export interface ReconciledRow {
  id: string;
  status: ReconStatus;
  patient: Patient | null;
  visit: Visit | null;
  claim: Claim | null;
}

export interface ClaimsKpis {
  paid: number;
  pending: number;
  missing: number;
  phantom: number;
  totalBilled: number;
  totalPaid: number;
  outstanding: number;
}

export interface SlotDayCell {
  attended: number;
  evals: number;
  scheduled: number;
  noShows: number;
}

export interface AttendanceMonth {
  office: OfficeId;
  month: string;
  slots: TimeSlot[];
  dates: string[];
  grid: Record<TimeSlot, Record<string, SlotDayCell>>;
  dayTotals: Record<string, SlotDayCell>;
  monthTotals: SlotDayCell & { ptFu: number };
  yearToDate: SlotDayCell & { ptFu: number };
}
