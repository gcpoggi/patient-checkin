import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { FileDropzone } from "@/components/FileDropzone";
import { PageHeader } from "@/components/PageHeader";

const columns = [
  ["claim_id", "Yes", "Unique text ID"],
  ["patient_name", "Yes", "Full name"],
  ["dob", "Yes", "YYYY-MM-DD or MM/DD/YYYY"],
  ["phone", "No", "Phone number"],
  ["office", "Yes", "kendall or ponce"],
  ["date_of_service", "Yes", "YYYY-MM-DD or MM/DD/YYYY"],
  ["cpt_code", "Yes", "CPT code"],
  ["description", "No", "Service description"],
  ["billed_amount", "Yes", "Number"],
  ["paid_amount", "No", "Number; defaults to 0"],
  ["payer", "No", "Defaults to Unknown"],
  ["provider", "No", "Physician name"],
  ["place_of_service", "No", "office/outpatient/inpatient/observation; defaults to office"],
  ["payer_category", "No", "Auto-derived from payer if omitted"],
  ["claim_status", "Yes", "paid, submitted, or denied"],
  ["paid_date", "No", "YYYY-MM-DD or MM/DD/YYYY"],
] as const;

export default function ClaimsUploadPage() {
  return (
    <AppShell>
      <PageHeader title="Feed Claims Data" subtitle="Upload the practice's claims export - we cross-check it against the visit log" />
      <p className="mt-3 text-sm text-slate-600">Third-party Practice Management App data can arrive via API · file · DB · manual. This file upload supports the file/manual path.</p>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <FileDropzone />
        <aside className="rounded-xl border border-mist-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">File guide</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-navy">Claims export schema</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <Link href="/samples/claims-kendall-jan-2026.csv" download className="rounded-lg border border-teal-500 px-3 py-2 text-center text-sm font-semibold text-teal-700 transition hover:bg-mist-100">Download sample CSV</Link>
            <Link href="/samples/claims-kendall-jan-2026.xlsx" download className="rounded-lg border border-teal-500 px-3 py-2 text-center text-sm font-semibold text-teal-700 transition hover:bg-mist-100">Download sample XLSX</Link>
          </div>

          <div className="mt-5 overflow-x-auto rounded-lg border border-mist-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-mist-100 text-navy"><tr><th className="px-3 py-2 font-semibold">Column</th><th className="px-3 py-2 font-semibold">Required</th><th className="px-3 py-2 font-semibold">Format</th></tr></thead>
              <tbody className="divide-y divide-mist-200">
                {columns.map(([column, required, format]) => <tr key={column}><td className="px-3 py-2 font-mono text-navy">{column}</td><td className="px-3 py-2 text-slate-600">{required}</td><td className="px-3 py-2 text-slate-600">{format}</td></tr>)}
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-lg bg-mist-100 p-3 text-sm leading-6 text-slate-700">
            <p><strong className="text-navy">Upsert:</strong> a duplicate <span className="font-mono text-xs">claim_id</span> replaces the existing claim.</p>
            <p><strong className="text-navy">Validation:</strong> invalid rows are skipped and reported by row number.</p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
