import { NextResponse, type NextRequest } from "next/server";
import { buildAttendanceMonth } from "@/lib/reconcile";
import type { OfficeId } from "@/lib/types";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const officeParam = request.nextUrl.searchParams.get("office");
  const office: OfficeId = officeParam === "ponce" ? "ponce" : "kendall";
  const monthParam = request.nextUrl.searchParams.get("month");
  const month = monthParam && /^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam) ? monthParam : "2026-01";
  return NextResponse.json(buildAttendanceMonth(office, month));
}
