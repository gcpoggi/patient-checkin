"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { ContestationReason, OfficeId } from "@/lib/types";

interface ContestationFormProps { insurer: string; claimIds: string; reason: ContestationReason; amount: string }

const template = "To the Appeals Department:\n\nHPP Management Corp. requests reconsideration and reimbursement for the referenced claim(s). The services were medically necessary, properly documented, and billed according to the applicable requirements. Please review the enclosed support and remit the amount demanded.\n\nSincerely,\nHPP Management Corp.";
const field = "mt-1 w-full rounded-lg border border-mist-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-hpp focus:ring-2 focus:ring-sky-hpp/20";

export function ContestationForm(props: ContestationFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/contestations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const result = await response.json() as { error?: string; contestation?: { id: string } };
    if (!response.ok || !result.contestation) { setError(result.error ?? "Unable to create contestation."); setPending(false); return; }
    router.push(`/contestations/${result.contestation.id}`);
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-5 rounded-xl border border-mist-200 bg-white p-6 shadow-sm sm:grid-cols-2">
      <label className="text-sm font-semibold text-navy">Office<select name="office" required defaultValue={"kendall" satisfies OfficeId} className={field}><option value="kendall">Kendall</option><option value="ponce">Ponce</option></select></label>
      <label className="text-sm font-semibold text-navy">Insurer<input name="insurer" required defaultValue={props.insurer} className={field} /></label>
      <label className="text-sm font-semibold text-navy">Claim IDs<input name="claimIds" required defaultValue={props.claimIds} placeholder="clm-0001, clm-0002" className={field} /></label>
      <label className="text-sm font-semibold text-navy">Reason<select name="reason" defaultValue={props.reason} className={field}><option value="underpayment">Underpayment</option><option value="denied">Denied</option></select></label>
      <label className="text-sm font-semibold text-navy">Amount demanded<input name="amountDemanded" type="number" min="0.01" step="0.01" required defaultValue={props.amount} className={field} /></label>
      <label className="text-sm font-semibold text-navy sm:col-span-2">Letter body<textarea name="letterBody" rows={9} defaultValue={template} className={field} /></label>
      <label className="text-sm font-semibold text-navy sm:col-span-2">Notes<textarea name="notes" rows={3} className={field} /></label>
      {error ? <p className="text-sm font-medium text-denied sm:col-span-2">{error}</p> : null}
      <div className="sm:col-span-2"><button disabled={pending} className="rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-60">{pending ? "Creating..." : "Create contestation"}</button></div>
    </form>
  );
}
