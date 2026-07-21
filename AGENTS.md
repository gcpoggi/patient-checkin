<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# HPP Patient Check-In — Project Context for Codex

You are building a **demo web app** for HPP Management Corp. Read this file fully before each task.

## What HPP Patient Check-In is
A "Practice Control Layer" for patient operations + billing oversight. It does NOT create clinical/billing systems — it **documents** every patient visit (Full Name, DOB, Phone) and at month-end **verifies** by cross-checking the visit log against billing/claims data (which comes from a third-party Practice Management App). Every visit/claim resolves to one of four statuses:
- **Paid** — Billed & paid (service fully processed)
- **Pending** — Billed, payment pending (awaiting collection)
- **Missing** — Service not billed (service performed, no charge)
- **Phantom** — Phantom charge (billed but no service logged)

## Stack & versions (IMPORTANT — newer than your training data)
- **Next.js 16.2.10** (App Router). Middleware is RENAMED to **`proxy.ts`**. Because this project uses a `src/` dir, the file MUST live at **`src/proxy.ts`** (same level as `src/app`) — NOT the repo root, or it won't run. Use `export function proxy(request: NextRequest)`. Read `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` and `.../02-guides/authentication.md`.
- **React 19.2**
- **TypeScript** (strict), path alias `@/*` → `src/*`
- **Tailwind CSS v4** — configured via `@import "tailwindcss";` and `@theme { ... }` in `src/app/globals.css`. NO `tailwind.config.js`. Define custom colors/fonts as CSS vars inside `@theme`.
- **Recharts v3.9** (NOTE: v3, not v2 — `"use client"` components, `<ResponsiveContainer>`).
- **xlsx (SheetJS) 0.18.5** for parsing CSV/XLSX uploads.
- Route handlers: add `export const dynamic = "force-dynamic";` so store reads/writes are never cached.

## Deploy target
Vercel (serverless). Data lives in an in-memory singleton on `globalThis` — a cold start reverts to seed. All client components read/write via `fetch` to `/api/*` route handlers (never read the store from a Server Component) so one warm lambda serves a whole demo session.

## Brand design system (follow strictly)
Colors from the HPP mark (define in `@theme` in `globals.css`):
- `--color-navy: #0D1B2A` (dark surfaces, top nav, CTA bands)
- `--color-ink: #0A0F16` (near-black text)
- HPP Teal scale, primary `--color-teal-500: #1B7EA6` (+ 300 #7CC5DE, 400 #3FA0C4, 600 #166A8C, 700 #115672)
- `--color-sky-hpp: #4FB4E6` (accent, focus rings, chart series 2)
- Mist scale (light info panels): `--color-mist-50:#F4F8FB`, `-100:#E8F1F7`, `-200:#DCE9F2`
- Status: paid `#0E9F6E`/bg `#E3F5EE`; pending `#D97706`/bg `#FCF1E1`; missing `#DC2626`/bg `#FBE9E9`; phantom `#7C3AED`/bg `#F0EAFB`
Typography (load via `next/font/google` in root layout):
- Display/headings: **Fraunces** (serif) → `--font-display`
- Body/labels/data: **Inter** → `--font-sans`
- Tabular numbers in grids/tables: **JetBrains Mono** → `--font-mono`
Conventions: h1 = serif navy, tracking-tight; section labels = xs uppercase tracking-widest teal-600; numeric cells `tabular-nums`; page bg `mist-50`; cards white, rounded-xl, border `mist-200`, subtle shadow; primary button teal-500 → hover teal-600; navy CTA bands with mist-100 text + sky accents.

## Brand copy (use verbatim where relevant)
- Title: **HPP Patient Check-In** · Subtitle: *"Practice control layer for patient operations & billing oversight"*
- Company: **HPP Management Corp.** — *"Reimbursement Solutions for Independent Practitioners · Risk Management HMO Agreements Specialists"*
- Pitch: *"Real-time visibility into patient activity and financial outcomes — improve accuracy, reduce billing errors, strengthen collections."*
- Footer tagline: *"Secure. Compliant. Efficient. Built for today's healthcare."* · contact `info@hppcorp.com`

## Demo login (hardcoded, demo only)
`pesilverio@hppcorp.com` / `1234`

## Data model (src/lib/types.ts)
- `OfficeId = "kendall" | "ponce"`; `Office { id, name, city }`
- `EventType = "therapy" | "doctor" | "evaluation" | "followup" | "account_only"` (therapy=PT service; doctor=service with doctor; evaluation feeds EVAL sub-rows; account_only=billing/account matter, no clinical service — logged as encounter but EXCLUDED from PT attendance clinical totals)
- `TimeSlot = "07:00".."11:00","13:00".."17:00"` (no 12:00 — lunch)
- `Patient { id, fullName, dob (ISO), phone (normalized digits), office, createdAt, isSeed }`
- `Appointment { id, patientId, office, date, slot, type }` (the SCHEDULE)
- `Visit { id, patientId, appointmentId|null, office, date, slot, eventType, checkedInAt, source }` (an actual attended check-in)
- `Claim { id, patientName, patientDob, patientPhone, office, dateOfService, cptCode, description, billedAmount, paidAmount, payer, fileStatus: "paid"|"submitted"|"denied", paidDate|null, source }`
- Derived (never stored): `ReconStatus = "paid"|"pending"|"missing"|"phantom"`; `ReconciledRow`; `ClaimsKpis`; `AttendanceMonth` (grid[slot][date]{attended,evals,scheduled,noShows}, dayTotals, monthTotals, yearToDate)
- Excel semantics: `ptFu = attended − evals`; `noShows (faltaron) = max(0, scheduled − attended)`

## Store & reconcile
- `src/lib/store.ts`: singleton on `globalThis.__hppStore`, seeded from static-imported `src/data/seed/*.json`. APIs: `getStore`, `resetStore`, `addPatient`, `addVisit`, `mergeClaims` (upsert by id), `lookupPatient`.
- `src/lib/normalize.ts`: `normalizeName` (lowercase, trim, collapse ws, strip diacritics via NFD), `normalizePhone` (digits, last 10), `isSameDate`.
- Patient match: `normalizeName` equal AND (`dob` equal OR `phone` equal); name-only → `{found:false, nearMiss:true}`.
- `src/lib/reconcile.ts` (pure, recompute per GET):
  - Claims: for each claim find patient + a same day/office visit (one visit per claim). With visit → PAID (fileStatus paid & paidAmount>0) else PENDING; no visit → PHANTOM. Visits with no claim → MISSING.
  - Attendance: `buildAttendanceMonth(office, month)` aggregates appointments (scheduled) + visits (attended, evals) into grid + totals + yearToDate.

## Financial reporting extension (data model + reports)
- `Claim` also includes `payerCategory`, `provider`, `serviceType`, `placeOfService`, and nullable `denialReason`.
- The fee schedule is stored in `src/data/fee-schedule.json` and exposed by `src/lib/feeSchedule.ts`; use `allowedAmountForClaim` to derive a claim's allowed amount.
- `ClaimStatus = "paid_full" | "unpaid" | "underpayment" | "phantom" | "denied"`. `reconcileClaims` derives status from patient/visit matching, file status, paid amount, and allowed amount.
- `buildServiceTransactions`, `buildProviderAttendance`, `buildMonthlySummary`, and `detectPlaceOfServiceErrors` provide the reporting datasets in `src/lib/reconcile.ts`.
- `src/components/ExcelTable.tsx` is the shared sortable, filterable, horizontally scrollable, XLSX-exportable report table.
- Report routes: `/attendance/transactions`, `/attendance/physicians`, `/attendance/summary`, `/claims/errors`, `/reports/reimbursement-analysis`, `/reports/claims-analysis`, and `/contestations`; contestation subroutes are `/contestations/new` and `/contestations/[id]`, backed by `/api/contestations` and `/api/contestations/[id]`.
- `Contestation` records insurer, claims, reason, demanded/recovered amounts, lifecycle status/timestamps, letter, notes, and creator. The in-memory store exposes `addContestation` and `updateContestation`.

## Working rules
- After changes, `npm run build` MUST pass. Fix type/lint errors you introduce.
- Keep components small and typed. Prefer server components for static shell, `"use client"` only where interactivity/charts are needed.
- Do NOT delete unrelated files. Do NOT run `git push` or deploy (the human handles git/deploy).
- Do NOT invent new dependencies without need; recharts + xlsx are already installed.
