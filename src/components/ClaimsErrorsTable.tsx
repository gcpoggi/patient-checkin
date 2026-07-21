"use client";

import { ExcelTable, type ExcelColumn } from "@/components/ExcelTable";
import type { OfficeId, PlaceOfService } from "@/lib/types";

export interface ClaimsErrorTableRow {
  claimId: string;
  patient: string;
  provider: string;
  office: OfficeId;
  dateOfService: string;
  cptCode: string;
  description: string;
  placeOfService: PlaceOfService;
  payer: string;
  billedAmount: number;
}

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const placeOfServiceLabels: Record<PlaceOfService, string> = {
  office: "Office",
  outpatient_hospital: "Outpatient Hospital",
  inpatient: "Inpatient",
  observation: "Observation",
};

const columns: ExcelColumn<ClaimsErrorTableRow>[] = [
  { key: "claimId", header: "Claim ID", width: 110 },
  { key: "patient", header: "Patient", width: 180 },
  { key: "provider", header: "Provider", filter: "select", width: 170 },
  { key: "office", header: "Office", filter: "select" },
  { key: "dateOfService", header: "Date of Service", width: 115 },
  { key: "cptCode", header: "CPT" },
  { key: "description", header: "Description", width: 220 },
  {
    key: "placeOfService",
    header: "Place of Service",
    filter: "select",
    render: (_, row) => (
      <span className="inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
        {placeOfServiceLabels[row.placeOfService]}
      </span>
    ),
    exportValue: (row) => placeOfServiceLabels[row.placeOfService],
  },
  { key: "payer", header: "Payer", filter: "select", width: 160 },
  { key: "billedAmount", header: "Billed", align: "right", render: (value) => currency.format(Number(value)) },
];

export function ClaimsErrorsTable({ rows, exportFilename }: { rows: ClaimsErrorTableRow[]; exportFilename: string }) {
  return (
    <ExcelTable columns={columns} rows={rows} rowKey={(row) => row.claimId} dense stickyFirstColumn
      exportFilename={exportFilename} title="Place-of-service errors"
      empty="No place-of-service errors found for this period." />
  );
}
