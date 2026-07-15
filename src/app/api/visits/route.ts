import { NextResponse } from "next/server";
import { addVisit, getStore } from "@/lib/store";
import type { EventType, OfficeId, TimeSlot } from "@/lib/types";

export const dynamic = "force-dynamic";

const offices: OfficeId[] = ["kendall", "ponce"];
const eventTypes: EventType[] = ["therapy", "doctor", "evaluation", "followup", "account_only"];
const slots: TimeSlot[] = ["07:00", "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  const { patientId, office, date, slot, eventType } = body as Record<string, unknown>;
  if (
    typeof patientId !== "string" || !getStore().patients.some((patient) => patient.id === patientId) ||
    typeof office !== "string" || !offices.includes(office as OfficeId) ||
    typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    typeof slot !== "string" || !slots.includes(slot as TimeSlot) ||
    typeof eventType !== "string" || !eventTypes.includes(eventType as EventType)
  ) return NextResponse.json({ error: "Invalid visit details." }, { status: 400 });

  const visit = addVisit({ patientId, office: office as OfficeId, date, slot: slot as TimeSlot, eventType: eventType as EventType, appointmentId: null });
  return NextResponse.json({ ok: true, visit }, { status: 201 });
}
