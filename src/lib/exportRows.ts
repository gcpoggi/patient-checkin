import * as XLSX from "xlsx";

function primitiveValue(value: unknown): string | number | boolean {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return String(value);
}

export function exportRowsToXlsx<T>(
  rows: T[],
  columns: { key: keyof T; header: string }[],
  filename: string,
): void {
  if (rows.length === 0) return;

  const exportRows = rows.map((row) =>
    Object.fromEntries(
      columns.map((column) => [column.header, primitiveValue(row[column.key])]),
    ),
  );
  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  XLSX.writeFile(workbook, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}
