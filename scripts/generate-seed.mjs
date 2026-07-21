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
const writeJson = (name, value) =>
  fs.writeFileSync(path.join(seedDir, name), `${JSON.stringify(value, null, 2)}\n`);

const offices = [
  { id: "kendall", name: "Kendall", city: "Miami, FL" },
  { id: "ponce", name: "Ponce", city: "Coral Gables, FL" },
];

const physicians = [
  { id: "dr_01", name: "Dr. Ricardo Fuentes, MD", specialty: "Orthopedic Surgery" },
  { id: "dr_02", name: "Dr. Elena Marquez, MD", specialty: "Orthopedic Surgery" },
  { id: "dr_03", name: "Dr. Andres Villalobos, MD", specialty: "Sports Medicine" },
  { id: "dr_04", name: "Dr. Patricia Nunez, MD", specialty: "Orthopedic Surgery" },
  { id: "dr_05", name: "Dr. Miguel Contreras, DO", specialty: "Physical Medicine & Rehabilitation" },
  { id: "dr_06", name: "Dr. Sofia Delgado, MD", specialty: "Orthopedic Surgery" },
];

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
const physicianForPatient = new Map(patients.map((p) => [p.id, pick(physicians).name]));

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

function claimForVisit(visit, id, fileStatus) {
  const patient = patientById.get(visit.patientId);
  const serviceType = visit.eventType === "doctor" ? "physician" : "pt";
  const cptCode = serviceType === "physician"
    ? pick(["99203", "99204", "99213", "99214"])
    : (visit.eventType === "evaluation" ? pick(["97161", "97162", "97163"]) : pick(["97110", "97140", "97530"]));
  const fee = feeSchedule.cptTable[cptCode];
  const billedAmount = fee.billedAmount;
  const description = fee.description;
  const payer = pick(payers);
  const payerCategory = feeSchedule.payerCategories[payer];
  const allowed = payerCategory === "workers_comp" ? fee.wcAllowed : fee.medicareAllowed;
  const paidAmount = fileStatus === "paid"
    ? (random() < 0.35 ? Math.round(allowed * (0.55 + random() * 0.25)) : allowed)
    : 0;
  return {
    id,
    patientName: patient.fullName,
    patientDob: patient.dob,
    patientPhone: patient.phone,
    office: visit.office,
    dateOfService: visit.date,
    cptCode,
    description,
    billedAmount,
    paidAmount,
    payer,
    payerCategory,
    provider: physicianForPatient.get(visit.patientId) ?? "",
    serviceType,
    placeOfService: "office",
    denialReason: fileStatus === "denied" ? pick(DENIAL_REASONS) : null,
    fileStatus,
    paidDate: fileStatus === "paid" ? "2026-02-10" : null,
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
claims.push(
  {
    id: "clm-9101", patientName: phantomPatient.fullName, patientDob: phantomPatient.dob,
    patientPhone: phantomPatient.phone, office: "kendall", dateOfService: "2026-01-05", cptCode: "97110",
    description: "Therapeutic exercise", billedAmount: 150, paidAmount: 32, payer: "Medicare",
    payerCategory: "medicare", provider: physicianForPatient.get(phantomPatient.id) ?? "", serviceType: "pt",
    placeOfService: "office", denialReason: null,
    fileStatus: "paid", paidDate: "2026-02-08", source: "seed",
  },
  {
    id: "clm-9102", patientName: "Maria Rodriguez", patientDob: "1958-03-14", patientPhone: "3055550147",
    office: "kendall", dateOfService: "2026-01-18", cptCode: "97530", description: "Therapeutic activities",
    billedAmount: 150, paidAmount: 34, payer: "BCBS FL", payerCategory: "commercial",
    provider: physicianForPatient.get("pt_0001") ?? "", serviceType: "pt", placeOfService: "office", denialReason: null,
    fileStatus: "paid", paidDate: "2026-02-09", source: "seed",
  },
  {
    id: "clm-9103", patientName: "Ana Ferrer", patientDob: "1980-06-12", patientPhone: "3055550199",
    office: "kendall", dateOfService: "2026-01-22", cptCode: "97140", description: "Manual therapy",
    billedAmount: 150, paidAmount: 0, payer: "Aetna", payerCategory: "commercial",
    provider: physicians[2].name, serviceType: "pt", placeOfService: "office", denialReason: null,
    fileStatus: "submitted", paidDate: null, source: "seed",
  },
);

const errorClaimSpecs = [
  { id: "clm-9301", patient: patients[2], office: "kendall", dateOfService: "2026-01-08", cptCode: "97110", payer: "Medicare", placeOfService: "inpatient", fileStatus: "paid" },
  { id: "clm-9302", patient: patients[0], office: "kendall", dateOfService: "2026-01-15", cptCode: "99214", payer: "BCBS FL", placeOfService: "observation", fileStatus: "paid" },
  { id: "clm-9303", patient: patients[1], office: "ponce", dateOfService: "2026-01-16", cptCode: "97140", payer: "Aetna", placeOfService: "inpatient", fileStatus: "submitted" },
];
for (const spec of errorClaimSpecs) {
  const fee = feeSchedule.cptTable[spec.cptCode];
  const payerCategory = feeSchedule.payerCategories[spec.payer];
  const allowed = payerCategory === "workers_comp" ? fee.wcAllowed : fee.medicareAllowed;
  claims.push({
    id: spec.id, patientName: spec.patient.fullName, patientDob: spec.patient.dob, patientPhone: spec.patient.phone,
    office: spec.office, dateOfService: spec.dateOfService, cptCode: spec.cptCode, description: fee.description,
    billedAmount: fee.billedAmount, paidAmount: spec.fileStatus === "paid" ? allowed : 0, payer: spec.payer,
    payerCategory, provider: physicianForPatient.get(spec.patient.id) ?? physicians[0].name,
    serviceType: fee.serviceType, placeOfService: spec.placeOfService, denialReason: null,
    fileStatus: spec.fileStatus, paidDate: spec.fileStatus === "paid" ? "2026-02-10" : null, source: "seed",
  });
}

const uploadVisits = [mariaVisit("2026-01-20"), ...otherMissing.slice(0, 5)].filter(Boolean);
const uploadRows = uploadVisits.map((visit, index) => {
  const patient = patientById.get(visit.patientId);
  const paid = index < 4;
  return {
    claim_id: `upload-${String(index + 1).padStart(3, "0")}`, patient_name: patient.fullName, dob: patient.dob,
    phone: patient.phone, office: visit.office, date_of_service: visit.date, cpt_code: "97110",
    description: "Physical therapy treatment", billed_amount: 150, paid_amount: paid ? 95 : 0,
    payer: pick(payers), provider: physicianForPatient.get(visit.patientId) ?? "", place_of_service: "office",
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
