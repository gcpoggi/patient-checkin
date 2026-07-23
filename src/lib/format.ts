import type { ClaimFileStatus } from "@/lib/types";

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(-10);
  return digits.length === 10
    ? `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6)}`
    : value;
}

export function formatPatientId(id: string | null | undefined): string {
  if (!id) return "N/A";
  const m = /^pt_?0*([0-9]+)$/i.exec(id);
  return m ? `P-${m[1].padStart(4, "0")}` : id;
}

export const CLAIM_FILE_STATUS_LABELS: Record<ClaimFileStatus, string> = {
  paid: "Approved",
  submitted: "Under review",
  denied: "Denied",
};

export const DOCTOR_VISIT_TYPE_LABELS: Record<"doctor" | "followup", string> = {
  doctor: "Initial visit",
  followup: "Follow-up",
};
