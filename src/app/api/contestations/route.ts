import { NextResponse, type NextRequest } from "next/server";
import { computeContestationSummary } from "@/lib/contestations";
import { addContestation, getStore } from "@/lib/store";
import type { ContestationReason, ContestationStatus, OfficeId } from "@/lib/types";

export const dynamic = "force-dynamic";

const statuses: ContestationStatus[] = ["draft", "submitted", "won", "lost"];

export function GET(request: NextRequest) {
  const office = request.nextUrl.searchParams.get("office");
  const status = request.nextUrl.searchParams.get("status");
  const contestations = getStore().contestations.filter(
    (item) =>
      (!office || item.office === office) &&
      (!status || (statuses.includes(status as ContestationStatus) && item.status === status)),
  );
  return NextResponse.json({ contestations, summary: computeContestationSummary(contestations) });
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const { office, insurer, claimIds, reason, amountDemanded, letterBody, notes } = body as Record<string, unknown>;
  const parsedClaimIds = Array.isArray(claimIds)
    ? claimIds.filter((id): id is string => typeof id === "string" && Boolean(id.trim())).map((id) => id.trim())
    : typeof claimIds === "string"
      ? claimIds.split(",").map((id) => id.trim()).filter(Boolean)
      : [];
  const parsedAmount = typeof amountDemanded === "number" ? amountDemanded : Number(amountDemanded);
  if (
    (office !== "kendall" && office !== "ponce") ||
    typeof insurer !== "string" || !insurer.trim() ||
    parsedClaimIds.length === 0 ||
    (reason !== "underpayment" && reason !== "denied") ||
    !Number.isFinite(parsedAmount) || parsedAmount <= 0
  ) {
    return NextResponse.json({ error: "Office, insurer, claims, reason, and a positive amount are required." }, { status: 400 });
  }
  const contestation = addContestation({
    office: office as OfficeId,
    insurer: insurer.trim(),
    claimIds: parsedClaimIds,
    reason: reason as ContestationReason,
    amountDemanded: parsedAmount,
    letterBody: typeof letterBody === "string" ? letterBody : "",
    notes: typeof notes === "string" ? notes : "",
    createdBy: "pesilverio@hppcorp.com",
  });
  return NextResponse.json({ ok: true, contestation }, { status: 201 });
}
