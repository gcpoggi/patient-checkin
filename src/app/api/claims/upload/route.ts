import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import {
  aggregateClaimAmounts,
  classifyServiceType,
  medicarePriceFor,
  payerCategoryFor,
} from "@/lib/feeSchedule";
import { mergeClaims } from "@/lib/store";
import type { Claim, ClaimFileStatus, OfficeId, PayerCategory, PlaceOfService } from "@/lib/types";

export const dynamic = "force-dynamic";

type SheetRow = Record<string, unknown>;

const aliases = {
  claimId: ["claimid", "id", "claimnumber", "claimno"],
  patientName: ["patientname", "name", "fullname"],
  dob: ["dob", "dateofbirth", "birthdate"],
  phone: ["phone", "patientphone", "phonenumber", "telephone"],
  office: ["office", "location", "practicelocation", "officename"],
  dateOfService: ["dateofservice", "servicedate", "dos"],
  cptCode: ["cptcode", "cpt", "procedurecode"],
  description: ["description", "servicedescription", "proceduredescription"],
  billedAmount: ["billedamount", "amountbilled", "chargeamount", "charges"],
  paidAmount: ["paidamount", "amountpaid", "paymentamount"],
  payer: ["payer", "insurance", "insurancepayer", "carrier"],
  claimStatus: ["claimstatus", "status", "filestatus"],
  paidDate: ["paiddate", "datepaid", "paymentdate"],
  provider: ["provider"],
  placeOfService: ["placeofservice", "pos"],
  payerCategory: ["payercategory", "category"],
  denialReason: ["denialreason"],
} as const;

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getValue(row: SheetRow, names: readonly string[]): unknown {
  const entry = Object.entries(row).find(([header]) => names.includes(normalizeHeader(header)));
  return entry?.[1];
}

function hasRequiredHeaders(row: SheetRow): boolean {
  const headers = Object.keys(row).map(normalizeHeader);
  return [aliases.claimId, aliases.patientName, aliases.dateOfService, aliases.claimStatus].every((names) =>
    names.some((name) => headers.includes(name)),
  );
}

function textValue(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).trim();
}

function isoDate(value: unknown, field: string): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    // SheetJS (cellDates) yields UTC-midnight Date objects; read them in UTC so a
    // machine in a negative-offset timezone (e.g. UTC-5) doesn't shift the day back.
    return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;
  }

  const raw = textValue(value);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/) ?? raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) throw new Error(`invalid ${field} '${raw}'`);
  const isIso = raw.includes("-");
  const year = Number(isIso ? match[1] : match[3]);
  const month = Number(isIso ? match[2] : match[1]);
  const day = Number(isIso ? match[3] : match[2]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error(`invalid ${field} '${raw}'`);
  }
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function requiredText(row: SheetRow, field: keyof typeof aliases, label: string): string {
  const value = textValue(getValue(row, aliases[field]));
  if (!value) throw new Error(`missing required ${label}`);
  return value;
}

function amount(value: unknown, label: string, defaultValue?: number): number {
  if ((value === null || value === undefined || textValue(value) === "") && defaultValue !== undefined) return defaultValue;
  const parsed = typeof value === "number" ? value : Number(textValue(value).replace(/[$,]/g, ""));
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`invalid ${label} '${textValue(value)}'`);
  return parsed;
}

function officeValue(value: string): OfficeId {
  const normalized = normalizeHeader(value);
  if (normalized === "kendall" || normalized.includes("kendall")) return "kendall";
  if (normalized === "ponce" || normalized.includes("ponce") || normalized.includes("coralgables")) return "ponce";
  throw new Error(`invalid office '${value}'`);
}

const payerCategories: PayerCategory[] = [
  "medicare",
  "medicare_advantage",
  "aca_marketplace",
  "workers_comp",
  "commercial",
];

function payerCategoryValue(value: unknown, payer: string): PayerCategory {
  const normalized = textValue(value).toLowerCase().replace(/[\s-]+/g, "_");
  return payerCategories.includes(normalized as PayerCategory)
    ? (normalized as PayerCategory)
    : payerCategoryFor(payer);
}

function placeOfServiceValue(value: unknown): PlaceOfService {
  const normalized = textValue(value).toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "office" || normalized === "11") return "office";
  if (normalized === "outpatient" || normalized === "outpatient_hospital" || normalized === "22") {
    return "outpatient_hospital";
  }
  if (normalized === "inpatient" || normalized === "21") return "inpatient";
  if (normalized === "observation" || normalized === "22_obs" || normalized === "observation_22") {
    return "observation";
  }
  return "office";
}

function claimFromRow(row: SheetRow): Claim {
  const dobRaw = getValue(row, aliases.dob);
  const serviceDateRaw = getValue(row, aliases.dateOfService);
  const dob = isoDate(dobRaw, "dob");
  if (!dob) throw new Error("missing required dob");
  const dateOfService = isoDate(serviceDateRaw, "date_of_service");
  if (!dateOfService) throw new Error("missing required date_of_service");

  const status = requiredText(row, "claimStatus", "claim_status").toLowerCase();
  if (!(["paid", "submitted", "denied"] as string[]).includes(status)) {
    throw new Error(`invalid claim_status '${status}'`);
  }

  const paidDateRaw = getValue(row, aliases.paidDate);
  const cptCode = requiredText(row, "cptCode", "cpt_code");
  const payer = textValue(getValue(row, aliases.payer)) || "Unknown";
  const claimNumber = requiredText(row, "claimId", "claim_id");
  const description = textValue(getValue(row, aliases.description));
  const billedAmount = amount(getValue(row, aliases.billedAmount), "billed_amount");
  const paidAmount = amount(getValue(row, aliases.paidAmount), "paid_amount", 0);
  const medicarePrice = medicarePriceFor(cptCode);
  const allowedAmount = amount(
    getValue(row, ["allowedamount", "totalcost", "contractedamount"]),
    "allowed_amount",
    paidAmount,
  );
  const procedures = [{ cptCode, description, billedAmount, allowedAmount, planPaid: paidAmount, medicarePrice }];
  const agg = aggregateClaimAmounts(procedures);
  const provider = textValue(getValue(row, aliases.provider));
  const paidDate = isoDate(paidDateRaw, "paid_date");
  return {
    id: claimNumber,
    claimNumber,
    patientName: requiredText(row, "patientName", "patient_name"),
    patientDob: dob,
    patientPhone: textValue(getValue(row, aliases.phone)),
    office: officeValue(requiredText(row, "office", "office")),
    dateOfService,
    dateProcessed: paidDate ?? dateOfService,
    totalDays: 0,
    procedures,
    cptCode,
    description,
    billedAmount: agg.billedAmount,
    allowedAmount: agg.allowedAmount,
    paidAmount: agg.paidAmount,
    medicareTotal: agg.medicareTotal,
    underpayment: agg.underpayment,
    payer,
    payerCategory: payerCategoryValue(getValue(row, aliases.payerCategory), payer),
    provider,
    visitedProvider: provider,
    serviceType: classifyServiceType(cptCode),
    placeOfService: placeOfServiceValue(getValue(row, aliases.placeOfService)),
    denialReason:
      status === "denied"
        ? textValue(getValue(row, aliases.denialReason)) || "Denied on upload"
        : null,
    fileStatus: status as ClaimFileStatus,
    paidDate,
    source: "upload",
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ message: "Choose a non-empty CSV or XLSX file to upload." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) throw new Error("The uploaded workbook contains no worksheets.");
    const rows = XLSX.utils.sheet_to_json<SheetRow>(workbook.Sheets[firstSheetName], { defval: "" });
    if (rows.length === 0) throw new Error("The uploaded file contains no claim rows.");
    if (!hasRequiredHeaders(rows[0])) {
      throw new Error("The file does not contain the required claims column headers.");
    }

    const validClaims: Claim[] = [];
    const rejected: Array<{ row: number; reason: string }> = [];
    rows.forEach((row, index) => {
      try {
        validClaims.push(claimFromRow(row));
      } catch (error) {
        rejected.push({ row: index + 2, reason: error instanceof Error ? error.message : "invalid row" });
      }
    });

    const { added, replaced } = mergeClaims(validClaims);
    return NextResponse.json({
      ok: true,
      parsed: rows.length,
      merged: added + replaced,
      added,
      replaced,
      rejected,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? `Unable to read claims file: ${error.message}` : "Unable to read claims file." },
      { status: 400 },
    );
  }
}
