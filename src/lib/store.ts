import appointmentsSeed from "@/data/seed/appointments.json";
import claimsSeed from "@/data/seed/claims.json";
import officesSeed from "@/data/seed/offices.json";
import patientsSeed from "@/data/seed/patients.json";
import visitsSeed from "@/data/seed/visits.json";
import { isSameDate, normalizeName, normalizePhone } from "@/lib/normalize";
import type { Appointment, Claim, Office, Patient, Visit } from "@/lib/types";

export interface HppStore {
  offices: Office[];
  patients: Patient[];
  appointments: Appointment[];
  visits: Visit[];
  claims: Claim[];
  seededAt: string;
}

type PatientInput = Omit<Patient, "id" | "createdAt" | "isSeed">;
type VisitInput = Omit<Visit, "id" | "checkedInAt" | "source">;
type LookupInput = Pick<Patient, "fullName"> & Partial<Pick<Patient, "dob" | "phone">>;

export type PatientLookupResult =
  | { found: true; nearMiss: false; patient: Patient }
  | { found: false; nearMiss: boolean; patient: null };

declare global {
  // eslint-disable-next-line no-var
  var __hppStore: HppStore | undefined;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export function seedStore(): HppStore {
  return {
    offices: clone(officesSeed) as Office[],
    patients: clone(patientsSeed) as Patient[],
    appointments: clone(appointmentsSeed) as Appointment[],
    visits: clone(visitsSeed) as Visit[],
    claims: clone(claimsSeed) as Claim[],
    seededAt: new Date().toISOString(),
  };
}

export function getStore(): HppStore {
  globalThis.__hppStore ??= seedStore();
  return globalThis.__hppStore;
}

export function resetStore(): HppStore {
  globalThis.__hppStore = seedStore();
  return globalThis.__hppStore;
}

function nextId(prefix: string, values: Array<{ id: string }>, width: number): string {
  const maximum = values.reduce((max, item) => {
    const match = item.id.match(new RegExp(`^${prefix}_(\\d+)$`));
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}_${String(maximum + 1).padStart(width, "0")}`;
}

export function addPatient(input: PatientInput): Patient {
  const store = getStore();
  const patient: Patient = {
    ...input,
    phone: normalizePhone(input.phone),
    id: nextId("pt", store.patients, 4),
    createdAt: new Date().toISOString(),
    isSeed: false,
  };
  store.patients.push(patient);
  return patient;
}

export function addVisit(input: VisitInput): Visit {
  const store = getStore();
  const visit: Visit = {
    ...input,
    id: nextId("vs", store.visits, 5),
    checkedInAt: new Date().toISOString(),
    source: "checkin",
  };
  store.visits.push(visit);
  return visit;
}

export function mergeClaims(rows: Claim[]): { added: number; replaced: number } {
  const store = getStore();
  let added = 0;
  let replaced = 0;

  for (const row of rows) {
    const index = store.claims.findIndex((claim) => claim.id === row.id);
    if (index === -1) {
      store.claims.push(row);
      added += 1;
    } else {
      store.claims[index] = row;
      replaced += 1;
    }
  }
  return { added, replaced };
}

export function lookupPatient(input: LookupInput): PatientLookupResult {
  const nameMatches = getStore().patients.filter(
    (patient) => normalizeName(patient.fullName) === normalizeName(input.fullName),
  );
  const patient = nameMatches.find(
    (candidate) =>
      (Boolean(input.dob) && isSameDate(candidate.dob, input.dob ?? "")) ||
      (Boolean(input.phone) && normalizePhone(candidate.phone) === normalizePhone(input.phone ?? "")),
  );

  return patient
    ? { found: true, nearMiss: false, patient }
    : { found: false, nearMiss: nameMatches.length > 0, patient: null };
}
