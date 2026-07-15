"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ToastProvider, useToast } from "@/components/Toast";
import type { EventType, OfficeId, Patient, TimeSlot } from "@/lib/types";

const eventTypes: Array<{ value: EventType; label: string }> = [
  { value: "therapy", label: "Therapy — PT service" },
  { value: "doctor", label: "Service with Doctor" },
  { value: "evaluation", label: "Evaluation (Atención)" },
  { value: "followup", label: "Follow-up" },
  { value: "account_only", label: "Account-only (billing/no clinical service)" },
];

const timeSlots: TimeSlot[] = [
  "07:00", "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-mist-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-sky-hpp focus:ring-2 focus:ring-sky-hpp/20";

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "").slice(-10);
  return digits.length === 10 ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : phone;
}

function VisitFormContent({ patient }: { patient: Patient }) {
  const { show } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [recorded, setRecorded] = useState<{ office: OfficeId; slot: TimeSlot; month: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const office = String(form.get("office")) as OfficeId;
    const date = String(form.get("date"));
    const slot = String(form.get("slot")) as TimeSlot;
    const eventType = String(form.get("eventType")) as EventType;

    try {
      const response = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id, office, date, slot, eventType }),
      });
      if (!response.ok) throw new Error("Unable to record the visit.");
      setRecorded({ office, slot, month: date.slice(0, 7) });
      show(`Visit recorded — ${office} · ${slot}`, "success");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to record the visit.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8 space-y-5">
      <section className="rounded-xl border border-mist-200 bg-white p-5 shadow-sm" aria-labelledby="patient-summary">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">Patient</p>
        <h2 id="patient-summary" className="mt-1 font-display text-2xl font-semibold text-navy">{patient.fullName}</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
          <div><dt className="text-slate-500">Date of birth</dt><dd className="font-mono tabular-nums text-ink">{patient.dob}</dd></div>
          <div><dt className="text-slate-500">Phone</dt><dd className="font-mono tabular-nums text-ink">{formatPhone(patient.phone)}</dd></div>
          <div><dt className="text-slate-500">Home office</dt><dd className="capitalize text-ink">{patient.office}</dd></div>
        </dl>
      </section>

      <form onSubmit={handleSubmit} className="rounded-xl border border-mist-200 bg-white p-6 shadow-sm">
        <fieldset>
          <legend className="text-sm font-semibold text-navy">Service route</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {eventTypes.map((type, index) => (
              <label key={type.value} className="flex cursor-pointer items-start gap-3 rounded-xl border border-mist-200 p-4 text-sm text-slate-700 transition hover:border-teal-300 has-checked:border-teal-500 has-checked:bg-mist-50">
                <input className="mt-0.5 accent-teal-600" type="radio" name="eventType" value={type.value} defaultChecked={index === 0} required />
                <span className="font-medium text-navy">{type.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <label className="text-sm font-medium text-navy">Office
            <select className={fieldClass} name="office" defaultValue={patient.office}>
              <option value="kendall">Kendall</option><option value="ponce">Ponce</option>
            </select>
          </label>
          <label className="text-sm font-medium text-navy">Date
            <input className={fieldClass} name="date" type="date" defaultValue="2026-01-15" required />
          </label>
          <label className="text-sm font-medium text-navy">Time slot
            <select className={`${fieldClass} font-mono tabular-nums`} name="slot" defaultValue="09:00">
              {timeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
            </select>
          </label>
        </div>
        {error ? <p className="mt-4 text-sm text-missing" role="alert">{error}</p> : null}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={submitting} className="rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-wait disabled:opacity-60">
            {submitting ? "Recording…" : "Record Visit"}
          </button>
          {recorded ? (
            <Link className="rounded-lg border border-teal-500 px-5 py-2.5 text-sm font-semibold text-teal-700 hover:bg-mist-50" href={`/attendance?office=${recorded.office}&month=${recorded.month}`}>
              View in Attendance
            </Link>
          ) : null}
        </div>
      </form>
    </div>
  );
}

export function VisitForm({ patient }: { patient: Patient }) {
  return <ToastProvider><VisitFormContent patient={patient} /></ToastProvider>;
}
