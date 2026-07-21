"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Contestation } from "@/lib/types";

export function ContestationActions({ contestation }: { contestation: Contestation }) {
  const router = useRouter();
  const [notes, setNotes] = useState(contestation.notes);
  const [letterBody, setLetterBody] = useState(contestation.letterBody);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function patch(body: Record<string, unknown>) {
    setPending(true); setMessage("");
    const response = await fetch(`/api/contestations/${contestation.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json() as { error?: string };
    setPending(false);
    if (!response.ok) { setMessage(result.error ?? "Unable to update contestation."); return; }
    setMessage("Saved."); router.refresh();
  }

  function markWon() {
    const value = window.prompt("Amount recovered", String(contestation.amountRecovered || contestation.amountDemanded));
    if (value === null) return;
    const amountRecovered = Number(value);
    if (!Number.isFinite(amountRecovered) || amountRecovered < 0) { setMessage("Enter a valid recovered amount."); return; }
    void patch({ status: "won", amountRecovered });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-mist-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">Status actions</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button disabled={pending || contestation.status !== "draft"} onClick={() => void patch({ status: "submitted" })} className="rounded-lg bg-contest-submitted px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Mark submitted</button>
          <button disabled={pending || contestation.status === "draft"} onClick={markWon} className="rounded-lg bg-contest-won px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Mark won</button>
          <button disabled={pending || contestation.status === "draft"} onClick={() => void patch({ status: "lost", amountRecovered: 0 })} className="rounded-lg bg-contest-lost px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Mark lost</button>
        </div>
        {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
      </section>
      <section className="rounded-xl border border-mist-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">Appeal record</p>
        <label className="mt-4 block text-sm font-semibold text-navy">Letter body<textarea value={letterBody} onChange={(event) => setLetterBody(event.target.value)} rows={10} className="mt-1 w-full rounded-lg border border-mist-200 p-3 font-normal outline-none focus:border-sky-hpp" /></label>
        <label className="mt-4 block text-sm font-semibold text-navy">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-mist-200 p-3 font-normal outline-none focus:border-sky-hpp" /></label>
        <button disabled={pending} onClick={() => void patch({ notes, letterBody })} className="mt-4 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-60">Save appeal record</button>
      </section>
    </div>
  );
}
