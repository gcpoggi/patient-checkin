import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  key: keyof T;
  header: string;
  align?: "left" | "center" | "right";
  render?: (value: T[keyof T], row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  empty?: string;
}

export function DataTable<T>({ columns, rows, empty = "No records found." }: DataTableProps<T>) {
  const alignment = {
    left: "text-left",
    center: "text-center",
    right: "text-right tabular-nums",
  } as const;

  return (
    <div className="max-w-full overflow-x-auto rounded-xl border border-mist-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-mist-100 text-navy">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                scope="col"
                className={`border-b border-mist-200 px-4 py-3 text-xs font-semibold uppercase tracking-wider ${alignment[column.align ?? "left"]}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-mist-200">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="odd:bg-white even:bg-mist-50 hover:bg-mist-100/70">
                {columns.map((column) => {
                  const value = row[column.key];
                  return (
                    <td
                      key={String(column.key)}
                      className={`whitespace-nowrap px-4 py-3 text-slate-700 ${alignment[column.align ?? "left"]}`}
                    >
                      {column.render ? column.render(value, row) : String(value ?? "")}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
