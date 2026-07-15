import { NextResponse, type NextRequest } from "next/server";
import { reconcileClaims } from "@/lib/reconcile";
import type { OfficeId, ReconStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const statuses: ReconStatus[] = ["paid", "pending", "missing", "phantom"];

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const requestedMonth = params.get("month");
  const month = requestedMonth && /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth) ? requestedMonth : "2026-01";
  const requestedOffice = params.get("office");
  const office: OfficeId | undefined = requestedOffice === "kendall" || requestedOffice === "ponce" ? requestedOffice : undefined;
  const requestedStatus = params.get("status") as ReconStatus | null;
  const status = requestedStatus && statuses.includes(requestedStatus) ? requestedStatus : undefined;
  const result = reconcileClaims(month, office);
  return NextResponse.json({ rows: status ? result.rows.filter((row) => row.status === status) : result.rows, kpis: result.kpis });
}
