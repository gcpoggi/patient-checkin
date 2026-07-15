import { NextResponse } from "next/server";
import { addPatient } from "@/lib/store";
import type { OfficeId } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  const { fullName, dob, phone, office } = body as Record<string, unknown>;
  if (
    typeof fullName !== "string" || !fullName.trim() ||
    typeof dob !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dob) ||
    typeof phone !== "string" || !phone.trim() ||
    (office !== "kendall" && office !== "ponce")
  ) return NextResponse.json({ error: "Valid patient details are required." }, { status: 400 });

  const patient = addPatient({ fullName: fullName.trim(), dob, phone, office: office as OfficeId });
  return NextResponse.json({ ok: true, patient }, { status: 201 });
}
