import feeScheduleJson from "@/data/fee-schedule.json";
import type { Claim, FeeScheduleEntry, PayerCategory, ServiceType } from "@/lib/types";

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
