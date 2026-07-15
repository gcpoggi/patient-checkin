import { NextResponse } from "next/server";
import { lookupPatient } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const { fullName, dob, phone } = body as Record<string, unknown>;
  if (typeof fullName !== "string" || typeof dob !== "string" || typeof phone !== "string") {
    return NextResponse.json({ error: "Full name, date of birth, and phone are required." }, { status: 400 });
  }
  const result = lookupPatient({ fullName, dob, phone });
  return NextResponse.json(
    result.found
      ? { found: true, patient: result.patient }
      : { found: false, nearMiss: result.nearMiss },
  );
}
