"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { DemoHintCard } from "@/components/DemoHintCard";
import type { Patient } from "@/lib/types";

type LookupResponse =
  | { found: true; patient: Patient; nearMiss?: false }
  | { found: false; nearMiss?: boolean };

const inputClass =
  "mt-1.5 w-full rounded-lg border border-mist-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-sky-hpp focus:ring-2 focus:ring-sky-hpp/20";

export function CheckInForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nearMiss, setNearMiss] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNearMiss(false);

    const form = new FormData(event.currentTarget);
    const fullName = [
      String(form.get("firstName") ?? "").trim(),
      String(form.get("middleInitial") ?? "").trim(),
      String(form.get("lastName") ?? "").trim(),
    ].filter(Boolean).join(" ");
    const input = {
      fullName,
      dob: String(form.get("dob") ?? ""),
      phone: String(form.get("phone") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/patients/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error("Unable to check the patient file.");
      const result = (await response.json()) as LookupResponse;
      if (result.found) {
        router.push(`/check-in/visit?patientId=${encodeURIComponent(result.patient.id)}`);
        return;
      }
      if (result.nearMiss) setNearMiss(true);
      const params = new URLSearchParams({ name: input.fullName, dob: input.dob, phone: input.phone });
      router.push(`/check-in/new?${params.toString()}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to check the patient file.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
      <form onSubmit={handleSubmit} className="rounded-xl border border-mist-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-5 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)]">
            <label className="text-sm font-medium text-navy">
              First Name
              <input className={inputClass} name="firstName" type="text" autoComplete="given-name" required />
            </label>
            <label className="text-sm font-medium text-navy">
              Middle Initial
              <input className={inputClass} name="middleInitial" type="text" autoComplete="additional-name" maxLength={1} />
            </label>
            <label className="text-sm font-medium text-navy">
              Last Name
              <input className={inputClass} name="lastName" type="text" autoComplete="family-name" required />
            </label>
          </div>
          <label className="text-sm font-medium text-navy">
            Date of Birth
            <input className={inputClass} name="dob" type="date" autoComplete="bday" required />
          </label>
          <label className="text-sm font-medium text-navy">
            Phone Number
            <input className={inputClass} name="phone" type="tel" autoComplete="tel" placeholder="(305) 555-0147" required />
          </label>
        </div>
        {nearMiss ? <p className="mt-4 text-sm text-pending">A similar name exists - verify DOB/phone.</p> : null}
        {error ? <p className="mt-4 text-sm text-missing" role="alert">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 inline-flex min-w-36 justify-center rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? "Checking file…" : "Continue"}
        </button>
      </form>
      <DemoHintCard />
    </div>
  );
}
