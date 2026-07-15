"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Patient } from "@/lib/types";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-mist-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-sky-hpp focus:ring-2 focus:ring-sky-hpp/20";

export interface NewPatientFormProps {
  initial: { name: string; dob: string; phone: string };
}

export function NewPatientForm({ initial }: NewPatientFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const body = {
      fullName: String(form.get("fullName") ?? "").trim(),
      dob: String(form.get("dob") ?? ""),
      phone: String(form.get("phone") ?? "").trim(),
      office: String(form.get("office") ?? ""),
    };
    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Unable to register the patient.");
      const result = (await response.json()) as { ok: true; patient: Patient };
      router.push(`/check-in/visit?patientId=${encodeURIComponent(result.patient.id)}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to register the patient.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 rounded-xl border border-mist-200 bg-white p-6 shadow-sm">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2 text-sm font-medium text-navy">Full Name
          <input className={inputClass} name="fullName" type="text" autoComplete="name" defaultValue={initial.name} required />
        </label>
        <label className="text-sm font-medium text-navy">Date of Birth
          <input className={inputClass} name="dob" type="date" autoComplete="bday" defaultValue={initial.dob} required />
        </label>
        <label className="text-sm font-medium text-navy">Phone Number
          <input className={inputClass} name="phone" type="tel" autoComplete="tel" defaultValue={initial.phone} required />
        </label>
        <label className="text-sm font-medium text-navy">Home office
          <select className={inputClass} name="office" defaultValue="kendall">
            <option value="kendall">Kendall</option>
            <option value="ponce">Ponce</option>
          </select>
        </label>
      </div>
      {error ? <p className="mt-4 text-sm text-missing" role="alert">{error}</p> : null}
      <button type="submit" disabled={submitting} className="mt-6 rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-wait disabled:opacity-60">
        {submitting ? "Registering…" : "Register Patient & Continue"}
      </button>
    </form>
  );
}
