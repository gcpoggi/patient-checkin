import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedDir = path.join(root, "src", "data", "seed");
const samplesDir = path.join(root, "public", "samples");
const feeSchedule = JSON.parse(fs.readFileSync(path.join(root, "src", "data", "fee-schedule.json"), "utf8"));
fs.mkdirSync(seedDir, { recursive: true });
fs.mkdirSync(samplesDir, { recursive: true });

function mulberry32(seed) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20260101);
const pick = (items) => items[Math.floor(random() * items.length)];
const shuffle = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
const round2 = (n) => Math.round(n * 100) / 100;
function buildProcedureLineJs(cptCode, rank, isTraditionalMedicare) {
  const entry = feeSchedule.cptTable[cptCode];
  const medicarePrice = entry.medicarePrice;
  const allowedFactor = isTraditionalMedicare
    ? (rank === 0 ? 0.99 + random() * 0.04 : 0.94 + random() * 0.05)
    : (rank === 0 ? 0.94 + random() * 0.05 : 0.45 + random() * 0.10);
  const allowedAmount = round2(medicarePrice * allowedFactor);
  const billedAmount = round2(allowedAmount * (10 + random() * 6));
  return { cptCode, description: entry.description, billedAmount, allowedAmount, medicarePrice };
}
function aggregateClaimAmountsJs(procedures) {
  const sum = (k) => round2(procedures.reduce((s, p) => s + p[k], 0));
  const billedAmount = sum("billedAmount"), allowedAmount = sum("allowedAmount"),
    paidAmount = sum("planPaid"), medicareTotal = sum("medicarePrice");
  return { billedAmount, allowedAmount, paidAmount, medicareTotal, underpayment: round2(Math.max(0, medicareTotal - paidAmount)) };
}
function addDaysIso(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
const daysBetweenIso = (a, b) => Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / 86400000);
let claimNumberSeq = 66000001;
const nextClaimNumber = () => String(claimNumberSeq++).padStart(9, "0");
const writeJson = (name, value) =>
  fs.writeFileSync(path.join(seedDir, name), `${JSON.stringify(value, null, 2)}\n`);

const offices = [
  { id: "kendall", name: "Kendall", city: "Miami, FL" },
  { id: "ponce", name: "Ponce", city: "Coral Gables, FL" },
];

const physicians = [
  { id: "dr_01", name: "Arturo Corces, MD", specialty: "Knee and Hip Replacement" },
  { id: "dr_02", name: "Mauricio Herrera, MD", specialty: "Sports Medicine and Arthroscopic Surgery" },
  { id: "dr_03", name: "David Font-Rodriguez, MD", specialty: "Upper Extremity Surgery" },
  { id: "dr_04", name: "Liam McCarthy, MD", specialty: "Physical Medicine and Rehabilitation" },
  { id: "dr_05", name: "Amar D. Rajadhyaksha, MD", specialty: "Orthopedic Spinal Surgery" },
];
const pcpNames = ["Dr. Ricardo Fuentes, MD", "Dr. Elena Marquez, MD", "Dr. Andres Villalobos, MD", "Dr. Patricia Nunez, MD", "Dr. Miguel Contreras, DO", "Dr. Sofia Delgado, MD"];

const firstNames = [
  "Sofia", "Luis", "Elena", "Jorge", "Isabel", "Miguel", "Camila", "Rafael", "Lucia",
  "Andres", "Teresa", "Manuel", "Rosa", "Diego", "Patricia", "Fernando", "Carmen", "Ricardo",
];
const lastNames = [
  "Garcia", "Martinez", "Lopez", "Hernandez", "Gonzalez", "Perez", "Sanchez", "Torres", "Rivera",
  "Diaz", "Morales", "Vega", "Castillo", "Navarro", "Ramos", "Suarez", "Ortega", "Delgado",
];

const patients = [
  {
    id: "pt_0001", fullName: "Maria Rodriguez", dob: "1958-03-14", phone: "3055550147",
    office: "kendall", createdAt: "2025-12-01T14:00:00.000Z", isSeed: true,
  },
  {
    id: "pt_0002", fullName: "Jose Alvarez", dob: "1964-11-23", phone: "7865550102",
    office: "ponce", createdAt: "2025-12-01T14:01:00.000Z", isSeed: true,
  },
];

for (let number = 3; number <= 38; number += 1) {
  const index = number - 3;
  const year = 1945 + Math.floor(random() * 50);
  const month = String(1 + Math.floor(random() * 12)).padStart(2, "0");
  const day = String(1 + Math.floor(random() * 27)).padStart(2, "0");
  patients.push({
    id: `pt_${String(number).padStart(4, "0")}`,
    fullName: `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / 2) % lastNames.length]}`,
    dob: `${year}-${month}-${day}`,
    phone: `${index % 2 ? "786" : "305"}555${String(110 + index).padStart(4, "0")}`,
    office: index % 2 ? "ponce" : "kendall",
    createdAt: `2025-12-${String(2 + (index % 28)).padStart(2, "0")}T14:00:00.000Z`,
    isSeed: true,
  });
}

const slots = ["07:00", "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const workdays = (start, end) => {
  const dates = [];
  for (let cursor = new Date(`${start}T00:00:00Z`); cursor <= new Date(`${end}T00:00:00Z`); cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    if (cursor.getUTCDay() > 0 && cursor.getUTCDay() < 6) dates.push(cursor.toISOString().slice(0, 10));
  }
  return dates;
};

const appointments = [];
const visits = [];
let appointmentNumber = 1;
let visitNumber = 1;
const patientFor = (office, offset) => {
  const roster = patients.filter((patient) => patient.office === office && patient.id !== "pt_0001");
  return roster[offset % roster.length];
};

function addAppointment(patientId, office, date, slot, type, attended = true) {
  const appointment = {
    id: `ap_${String(appointmentNumber++).padStart(5, "0")}`,
    patientId, office, date, slot, type,
  };
  appointments.push(appointment);
  if (attended) {
    visits.push({
      id: `vs_${String(visitNumber++).padStart(5, "0")}`,
      patientId,
      appointmentId: appointment.id,
      office,
      date,
      slot,
      eventType: type,
      checkedInAt: `${date}T${slot}:00.000-05:00`,
      source: "seed",
    });
  }
}

const mariaDates = ["2026-01-06", "2026-01-13", "2026-01-20", "2026-01-27"];
for (const date of mariaDates) addAppointment("pt_0001", "kendall", date, "10:00", "therapy", true);
addAppointment("pt_0001", "kendall", "2026-01-29", "10:00", "therapy", false);

function generatePeriod(office, dates, scheduledTarget, attendedTarget, evaluationTarget) {
  const existingScheduled = appointments.filter((item) => item.office === office && dates.includes(item.date)).length;
  const existingAttended = visits.filter((item) => item.office === office && dates.includes(item.date)).length;
  const cells = shuffle(dates.flatMap((date) => slots.map((slot) => ({ date, slot }))));
  const additions = scheduledTarget - existingScheduled;
  const attendedAdditions = attendedTarget - existingAttended;
  const types = shuffle([
    ...Array(evaluationTarget).fill("evaluation"),
    ...Array(Math.min(20, Math.max(0, attendedAdditions - evaluationTarget))).fill("doctor"),
    ...Array(Math.min(18, Math.max(0, attendedAdditions - evaluationTarget - 20))).fill("followup"),
    ...Array(Math.max(0, attendedAdditions - evaluationTarget - 38)).fill("therapy"),
  ]);
  for (let index = 0; index < additions; index += 1) {
    const cell = cells[index % cells.length];
    const attended = index < attendedAdditions;
    const type = attended ? types[index] : "therapy";
    addAppointment(patientFor(office, index + dates.indexOf(cell.date)).id, office, cell.date, cell.slot, type, attended);
  }
}

const january = workdays("2026-01-02", "2026-01-30");
generatePeriod("kendall", january, 492, 465, 71);
generatePeriod("ponce", january, 295, 271, 43);
generatePeriod("kendall", workdays("2026-02-02", "2026-02-06"), 110, 101, 15);

const patientById = new Map(patients.map((patient) => [patient.id, patient]));
const kendallJanuaryVisits = visits.filter((visit) => visit.office === "kendall" && visit.date.startsWith("2026-01"));
const mariaVisit = (date) => kendallJanuaryVisits.find((visit) => visit.patientId === "pt_0001" && visit.date === date);
const mandatoryMissing = [mariaVisit("2026-01-20"), mariaVisit("2026-01-27")];
const otherMissing = shuffle(kendallJanuaryVisits.filter((visit) => visit.patientId !== "pt_0001")).slice(0, 7);
const missingVisits = [...mandatoryMissing, ...otherMissing].filter(Boolean);
const missingIds = new Set(missingVisits.map((visit) => visit.id));
const pcpForPatient = new Map(patients.map((p) => [p.id, pick(pcpNames)]));
const physicianForPatient = new Map(patients.map((p) => [p.id, pick(physicians).name]));
physicianForPatient.set("pt_0001", physicians[0].name);
for (const patient of patients) {
  patient.pcp = pcpForPatient.get(patient.id);
  patient.physician = physicianForPatient.get(patient.id);
}

// Every billable visit (all offices/months) becomes a claim EXCEPT the deliberate
// missing set and non-clinical account-only encounters. Kendall January keeps exactly 9 "missing".
const paidMandatory = mariaVisit("2026-01-06");
const pendingMandatory = mariaVisit("2026-01-13");
const paidMandatoryId = paidMandatory ? paidMandatory.id : null;
const pendingMandatoryId = pendingMandatory ? pendingMandatory.id : null;
const billedVisits = visits.filter(
  (visit) => visit.eventType !== "account_only" && !missingIds.has(visit.id),
);
const payers = [
  "Medicare",
  "Medicare Advantage (Humana)",
  "Medicare Advantage (UnitedHealthcare)",
  "BCBS FL",
  "BCBS FL Marketplace",
  "Ambetter (ACA Marketplace)",
  "Aetna",
  "Cigna",
  "AmTrust Workers Comp",
  "Zenith Insurance (Workers Comp)",
];
const DENIAL_REASONS = [
  "Prior authorization missing",
  "Timely filing limit exceeded",
  "Non-covered service for plan",
  "Duplicate claim",
  "Medical necessity not established",
];

function proceduresForVisit(visit, serviceType, payer) {
  const isTraditionalMedicare = payer === "Medicare";
  let codes;
  if (serviceType === "physician") codes = [pick(["99203", "99204", "99213", "99214"])];
  else if (visit.eventType === "evaluation") codes = [pick(["97161", "97162", "97163"])];
  else {
    const r = random();
    const count = r < 0.20 ? 1 : r < 0.65 ? 2 : 3;
    codes = shuffle(["97110", "97112", "97140", "97530"]).slice(0, count);
  }
  return codes.map((cptCode, rank) => buildProcedureLineJs(cptCode, rank, isTraditionalMedicare));
}

function claimForVisit(visit, id, fileStatus) {
  const patient = patientById.get(visit.patientId);
  const serviceType = visit.eventType === "doctor" ? "physician" : "pt";
  const payer = pick(payers);
  const procs = proceduresForVisit(visit, serviceType, payer).map((p) => ({
    ...p,
    planPaid: fileStatus === "paid" ? round2(p.allowedAmount * (0.96 + random() * 0.03)) : 0,
  }));
  const agg = aggregateClaimAmountsJs(procs);
  const dateProcessed = addDaysIso(visit.date, 8 + Math.floor(random() * 15));
  return {
    id, claimNumber: nextClaimNumber(),
    patientName: patient.fullName,
    patientDob: patient.dob,
    patientPhone: patient.phone,
    office: visit.office,
    dateOfService: visit.date,
    dateProcessed, totalDays: daysBetweenIso(visit.date, dateProcessed),
    procedures: procs, billedAmount: agg.billedAmount, allowedAmount: agg.allowedAmount,
    paidAmount: agg.paidAmount, medicareTotal: agg.medicareTotal, underpayment: agg.underpayment,
    cptCode: procs[0].cptCode, description: procs[0].description,
    payer, payerCategory: feeSchedule.payerCategories[payer],
    provider: patient.physician, visitedProvider: patient.physician,
    serviceType,
    placeOfService: "office",
    denialReason: fileStatus === "denied" ? pick(DENIAL_REASONS) : null,
    fileStatus,
    paidDate: fileStatus === "paid" ? dateProcessed : null,
    source: "seed",
  };
}

let claimSeq = 0;
const claims = billedVisits.map((visit) => {
  claimSeq += 1;
  let fileStatus;
  if (visit.id === paidMandatoryId) fileStatus = "paid";
  else if (visit.id === pendingMandatoryId) fileStatus = "submitted";
  else {
    const r = random();
    fileStatus = r < 0.70 ? "paid" : r < 0.92 ? "submitted" : "denied";
  }
  return claimForVisit(visit, `clm-${String(claimSeq).padStart(4, "0")}`, fileStatus);
});

const phantomPatient = patientById.get("pt_0003");
function buildManualClaim({ id, patient, patientName, patientDob, patientPhone, office, dateOfService, cptCode, payer, provider, serviceType, placeOfService, fileStatus }) {
  const procedure = buildProcedureLineJs(cptCode, 0, payer === "Medicare");
  const procedures = [{ ...procedure, planPaid: fileStatus === "paid" ? round2(procedure.allowedAmount * (0.96 + random() * 0.03)) : 0 }];
  const agg = aggregateClaimAmountsJs(procedures);
  const dateProcessed = addDaysIso(dateOfService, 14);
  return {
    id, claimNumber: nextClaimNumber(), patientName: patientName ?? patient.fullName,
    patientDob: patientDob ?? patient.dob, patientPhone: patientPhone ?? patient.phone,
    office, dateOfService, dateProcessed, totalDays: daysBetweenIso(dateOfService, dateProcessed),
    cptCode, description: procedure.description, procedures, ...agg, payer,
    payerCategory: feeSchedule.payerCategories[payer], provider, visitedProvider: provider,
    serviceType, placeOfService, denialReason: null, fileStatus,
    paidDate: fileStatus === "paid" ? dateProcessed : null, source: "seed",
  };
}
claims.push(
  buildManualClaim({ id: "clm-9101", patient: phantomPatient, office: "kendall", dateOfService: "2026-01-05", cptCode: "97110", payer: "Medicare", provider: phantomPatient.physician, serviceType: "pt", placeOfService: "office", fileStatus: "paid" }),
  buildManualClaim({ id: "clm-9102", patient: patients[0], office: "kendall", dateOfService: "2026-01-18", cptCode: "97530", payer: "BCBS FL", provider: patients[0].physician, serviceType: "pt", placeOfService: "office", fileStatus: "paid" }),
  buildManualClaim({ id: "clm-9103", patientName: "Ana Ferrer", patientDob: "1980-06-12", patientPhone: "3055550199", office: "kendall", dateOfService: "2026-01-22", cptCode: "97140", payer: "Aetna", provider: physicians[2].name, serviceType: "pt", placeOfService: "office", fileStatus: "submitted" }),
);

const errorClaimSpecs = [
  { id: "clm-9301", patient: patients[2], office: "kendall", dateOfService: "2026-01-08", cptCode: "97110", payer: "Medicare", placeOfService: "inpatient", fileStatus: "paid" },
  { id: "clm-9302", patient: patients[0], office: "kendall", dateOfService: "2026-01-15", cptCode: "99214", payer: "BCBS FL", placeOfService: "observation", fileStatus: "paid" },
  { id: "clm-9303", patient: patients[1], office: "ponce", dateOfService: "2026-01-16", cptCode: "97140", payer: "Aetna", placeOfService: "inpatient", fileStatus: "submitted" },
];
for (const spec of errorClaimSpecs) {
  const fee = feeSchedule.cptTable[spec.cptCode];
  claims.push(buildManualClaim({ ...spec, provider: spec.patient.physician, serviceType: fee.serviceType }));
}

const showcasePatient = {
  id: "pt_0039", fullName: "Pablo Silverio", dob: "1953-02-11", phone: "3055550199",
  office: "kendall", createdAt: "2025-12-03T14:00:00.000Z", isSeed: true,
  pcp: pick(pcpNames), physician: "Arturo Corces, MD",
};
patients.push(showcasePatient);
patientById.set("pt_0039", showcasePatient);
visits.push({
  id: `vs_${String(visitNumber++).padStart(5, "0")}`, patientId: "pt_0039", appointmentId: null,
  office: "kendall", date: "2026-01-05", slot: "10:00", eventType: "therapy",
  checkedInAt: "2026-01-05T10:00:00.000-05:00", source: "seed",
});
claims.push({
  id: "clm-showcase-066052423", claimNumber: "066052423", patientName: "Pablo Silverio",
  patientDob: "1953-02-11", patientPhone: "3055550199", office: "kendall",
  dateOfService: "2026-01-05", dateProcessed: "2026-01-21", totalDays: 16,
  cptCode: "97110", description: "Therapeutic exercise",
  procedures: [
    { cptCode: "97110", description: "Therapeutic exercise", billedAmount: 482.08, allowedAmount: 29.48, planPaid: 28.90, medicarePrice: 30.04 },
    { cptCode: "97112", description: "Neuromuscular re-education", billedAmount: 271.12, allowedAmount: 16.49, planPaid: 16.17, medicarePrice: 33.79 },
    { cptCode: "97530", description: "Therapeutic activities", billedAmount: 291.20, allowedAmount: 29.12, planPaid: 28.54, medicarePrice: 36.32 },
  ],
  billedAmount: 1044.40, allowedAmount: 75.09, paidAmount: 73.61, medicareTotal: 100.14, underpayment: 26.53,
  payer: "Medicare Advantage (UnitedHealthcare)", payerCategory: "medicare_advantage",
  provider: "Arturo Corces, MD", visitedProvider: "Arturo Corces, MD", serviceType: "pt",
  placeOfService: "office", denialReason: null, fileStatus: "submitted", paidDate: null, source: "seed",
});

const uploadVisits = [mariaVisit("2026-01-20"), ...otherMissing.slice(0, 5)].filter(Boolean);
const uploadRows = uploadVisits.map((visit, index) => {
  const patient = patientById.get(visit.patientId);
  const paid = index < 4;
  return {
    claim_id: `upload-${String(index + 1).padStart(3, "0")}`, patient_name: patient.fullName, dob: patient.dob,
    phone: patient.phone, office: visit.office, date_of_service: visit.date, cpt_code: "97110",
    description: "Physical therapy treatment", billed_amount: 150, paid_amount: paid ? 95 : 0,
    payer: pick(payers), provider: patient.physician, place_of_service: "office",
    claim_status: paid ? "paid" : "submitted", paid_date: paid ? "2026-02-20" : "",
  };
});
uploadRows.push(
  {
    claim_id: "upload-007", patient_name: "Victor Salas", dob: "1977-04-09", phone: "3055550188",
    office: "kendall", date_of_service: "2026-01-24", cpt_code: "97140", description: "Manual therapy",
    billed_amount: 150, paid_amount: 90, payer: "Cigna", provider: physicians[0].name,
    place_of_service: "office", claim_status: "paid", paid_date: "2026-02-21",
  },
  {
    claim_id: "upload-invalid", patient_name: "Invalid Example", dob: "1960-01-01", phone: "3055550100",
    office: "kendall", date_of_service: "13/45/2026", cpt_code: "97110", description: "Invalid date demonstration",
    billed_amount: 150, paid_amount: 0, payer: "Aetna", provider: physicians[1].name,
    place_of_service: "", claim_status: "submitted", paid_date: "",
  },
);
for (let index = 9; index <= 12; index += 1) {
  const base = claims[index];
  uploadRows.push({
    claim_id: base.id, patient_name: base.patientName, dob: base.patientDob, phone: base.patientPhone,
    office: base.office, date_of_service: base.dateOfService, cpt_code: base.cptCode, description: base.description,
    billed_amount: base.billedAmount, paid_amount: base.paidAmount, payer: base.payer,
    provider: base.provider, place_of_service: base.placeOfService,
    claim_status: base.fileStatus, paid_date: base.paidDate ?? "",
  });
}

writeJson("offices.json", offices);
writeJson("patients.json", patients);
writeJson("appointments.json", appointments);
writeJson("visits.json", visits);
writeJson("claims.json", claims);
writeJson("physicians.json", physicians);

const headers = Object.keys(uploadRows[0]);
const escapeCsv = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const csv = [headers.join(","), ...uploadRows.map((row) => headers.map((header) => escapeCsv(row[header])).join(","))].join("\n");
fs.writeFileSync(path.join(samplesDir, "claims-kendall-jan-2026.csv"), `${csv}\n`);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(uploadRows), "Claims");
XLSX.writeFile(workbook, path.join(samplesDir, "claims-kendall-jan-2026.xlsx"));

console.log(JSON.stringify({
  patients: patients.length,
  appointments: appointments.length,
  visits: visits.length,
  claims: claims.length,
  kendallJanuary: {
    scheduled: appointments.filter((item) => item.office === "kendall" && item.date.startsWith("2026-01")).length,
    attended: kendallJanuaryVisits.length,
    evals: kendallJanuaryVisits.filter((item) => item.eventType === "evaluation").length,
    missingWithoutClaims: missingVisits.length,
  },
  sampleRows: uploadRows.length,
}, null, 2));
