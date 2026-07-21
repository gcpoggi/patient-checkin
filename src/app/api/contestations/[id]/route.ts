import { NextResponse } from "next/server";
import { getStore, updateContestation } from "@/lib/store";
import type { ContestationStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

interface RouteContext { params: Promise<{ id: string }> }
const statuses: ContestationStatus[] = ["draft", "submitted", "won", "lost"];

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const contestation = getStore().contestations.find((item) => item.id === id);
  return contestation
    ? NextResponse.json({ contestation })
    : NextResponse.json({ error: "Contestation not found." }, { status: 404 });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const source = body as Record<string, unknown>;
  if (source.status !== undefined && (typeof source.status !== "string" || !statuses.includes(source.status as ContestationStatus))) {
    return NextResponse.json({ error: "Invalid contestation status." }, { status: 400 });
  }
  if (source.amountRecovered !== undefined && (!Number.isFinite(Number(source.amountRecovered)) || Number(source.amountRecovered) < 0)) {
    return NextResponse.json({ error: "Amount recovered must be zero or greater." }, { status: 400 });
  }
  const patch = {
    ...(typeof source.status === "string" ? { status: source.status as ContestationStatus } : {}),
    ...(source.amountRecovered !== undefined ? { amountRecovered: Number(source.amountRecovered) } : {}),
    ...(typeof source.notes === "string" ? { notes: source.notes } : {}),
    ...(typeof source.letterBody === "string" ? { letterBody: source.letterBody } : {}),
  };
  const contestation = updateContestation(id, patch);
  return contestation
    ? NextResponse.json({ ok: true, contestation })
    : NextResponse.json({ error: "Contestation not found." }, { status: 404 });
}
