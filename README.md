# HPP Patient Check-In

HPP Patient Check-In is a practice control layer demo for patient operations and billing oversight. It records patient visits and cross-checks them against claims data to surface Paid, Pending, Missing, and Phantom outcomes.

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
5. Open **Claims** and walk through the four reconciliation views: **Paid**, **Pending**, **Missing**, and **Phantom**.
6. Open **Feed Claims Data**. Download a sample CSV or XLSX from the app, then re-upload it to watch Missing decrease and Paid increase.
7. Open **Reports** to show the Power BI Reports integration placeholder.

Use **Reset demo data** in the application header to restore the seeded state between presentations.

## Data

The demo uses an in-memory store seeded from `src/data/seed/*.json`. To regenerate the seed files, run:

```bash
node scripts/generate-seed.mjs
```

On Vercel, a serverless cold start reverts the in-memory store to its seeded state. This is intentional and acceptable for the demo; the app is not designed for persistent production data.

## Deploy

Deploy with Vercel by connecting the GitHub repository. Vercel will auto-detect the Next.js framework and configure the build settings.
