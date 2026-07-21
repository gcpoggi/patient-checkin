import feeScheduleJson from "@/data/fee-schedule.json";
import type { Claim, FeeScheduleEntry, PayerCategory, ProcedureLine, ServiceType } from "@/lib/types";

export const FEE_SCHEDULE: Record<string, FeeScheduleEntry> = Object.fromEntries(
  Object.entries(feeScheduleJson.cptTable).map(([cptCode, entry]) => [cptCode, { cptCode, ...entry }]),
) as Record<string, FeeScheduleEntry>;

export const PAYER_CATEGORY_MAP: Record<string, PayerCategory> = feeScheduleJson.payerCategories as Record<
  string,
  PayerCategory
>;

export function classifyServiceType(cptCode: string): ServiceType {
  return FEE_SCHEDULE[cptCode]?.serviceType ?? (cptCode.startsWith("99") ? "physician" : "pt");
}

export function payerCategoryFor(payer: string): PayerCategory {
  return PAYER_CATEGORY_MAP[payer] ?? "commercial";
}

export function allowedAmountFor(cptCode: string, payerCategory: PayerCategory): number {
  const entry = FEE_SCHEDULE[cptCode];
  if (!entry) return 0;
  return payerCategory === "workers_comp" ? entry.wcAllowed : entry.medicareAllowed;
}

export function allowedAmountForClaim(claim: Claim): number {
  return allowedAmountFor(claim.cptCode, claim.payerCategory);
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function medicarePriceFor(cptCode: string): number {
  return FEE_SCHEDULE[cptCode]?.medicarePrice ?? 0;
}

export function buildProcedureLine(
  cptCode: string,
  rank: number,
  isTraditionalMedicare: boolean,
  rng: () => number = Math.random,
): ProcedureLine {
  const entry = FEE_SCHEDULE[cptCode];
  const medicarePrice = entry?.medicarePrice ?? 0;
  const allowedFactor = isTraditionalMedicare
    ? rank === 0
      ? 0.99 + rng() * 0.04
      : 0.94 + rng() * 0.05
    : rank === 0
      ? 0.94 + rng() * 0.05
      : 0.45 + rng() * 0.10;
  const allowedAmount = round2(medicarePrice * allowedFactor);
  const planPaid = round2(allowedAmount * (0.96 + rng() * 0.03));
  const billedAmount = round2(allowedAmount * (10 + rng() * 6));
  return {
    cptCode,
    description: entry?.description ?? "",
    billedAmount,
    allowedAmount,
    planPaid,
    medicarePrice,
  };
}

export function aggregateClaimAmounts(procedures: ProcedureLine[]): {
  billedAmount: number;
  allowedAmount: number;
  paidAmount: number;
  medicareTotal: number;
  underpayment: number;
} {
  const billedAmount = round2(procedures.reduce((sum, procedure) => sum + procedure.billedAmount, 0));
  const allowedAmount = round2(procedures.reduce((sum, procedure) => sum + procedure.allowedAmount, 0));
  const paidAmount = round2(procedures.reduce((sum, procedure) => sum + procedure.planPaid, 0));
  const medicareTotal = round2(procedures.reduce((sum, procedure) => sum + procedure.medicarePrice, 0));
  const underpayment = round2(Math.max(0, medicareTotal - paidAmount));
  return { billedAmount, allowedAmount, paidAmount, medicareTotal, underpayment };
}
