# HPP Patient Check-In

HPP Patient Check-In is a practice control layer demo for patient operations and billing oversight. It records patient visits and cross-checks them against claims data to surface financial claim outcomes: Paid in Full, Unpaid, Underpayment, Phantom, and Denied.

## Features

- Patient check-in, attendance tracking, and claim-file reconciliation
- PT transactions, Physicians report, and Monthly summary
- Reimbursement Analysis and Claims Analysis with realistic allowed-amount scenarios
- Place-of-service Errors report and Contestations workflow for denied and underpaid claims
- Sortable, filterable report tables with XLSX export

## Tech stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Recharts
- SheetJS (`xlsx`)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo login:

- Email: `pesilverio@hppcorp.com`
- Password: `1234`

## Demo script

1. Log in with the demo credentials.
2. Open **Check-In** and look up **Maria Rodriguez**, an existing patient. Record a therapy visit.
3. Open **Attendance** to see the visit reflected in the monthly attendance view.
4. Return to **Check-In** and look up **Carlos Mendez**, who is not in the patient file. Register him as a new patient, then continue the check-in flow.
5. Open **Claims** and walk through the financial views: **Paid in Full**, **Unpaid**, **Underpayment**, **Phantom**, and **Denied**. Point out the realistic fee-schedule allowed amounts and collection reductions.
6. Open **Feed Claims Data**. Download a sample CSV or XLSX from the app, then re-upload it to update the financial reconciliation.
7. Under **Attendance**, show **PT Transactions**, the **Physicians** report, and the **Monthly Summary**.
8. Open **Reports** to review **Reimbursement Analysis** and **Claims Analysis**, then open the **Errors** report for place-of-service issues.
9. Open **Contestations** to show how denied and underpaid claims move from draft through resolution.

Use **Reset demo data** in the application header to restore the seeded state between presentations.

## Data

The demo uses an in-memory store seeded from `src/data/seed/*.json`. To regenerate the seed files, run:

```bash
node scripts/generate-seed.mjs
```

On Vercel, a serverless cold start reverts the in-memory store to its seeded state. This is intentional and acceptable for the demo; the app is not designed for persistent production data.

## Deploy

Deploy with Vercel by connecting the GitHub repository. Vercel will auto-detect the Next.js framework and configure the build settings.
