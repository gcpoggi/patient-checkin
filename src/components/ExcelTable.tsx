"use client";

import { useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";

import { exportRowsToXlsx } from "@/lib/exportRows";

export interface ExcelColumn<T> {
  key: keyof T;
  header: string;
  width?: number;
  align?: "left" | "right" | "center";
  filter?: "text" | "select" | "none";
  filterOptions?: string[];
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  exportValue?: (row: T) => string | number;
}

export interface ExcelTableProps<T> {
  columns: ExcelColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  dense?: boolean;
  stickyFirstColumn?: boolean;
  exportFilename?: string;
  empty?: string;
  title?: string;
  caption?: string;
}

type SortDirection = "asc" | "desc";

function rawText(value: unknown): string {
  return value == null ? "" : String(value);
}

function filterText<T>(column: ExcelColumn<T>, row: T): string {
  const rawValue = row[column.key];
  if (!column.render) return rawText(rawValue);

  const rendered = column.render(rawValue, row);
  return typeof rendered === "string" || typeof rendered === "number"
    ? String(rendered)
    : rawText(rawValue);
}

function compareValues(left: unknown, right: unknown): number {
  if (typeof left === "number" && typeof right === "number") return left - right;
  return rawText(left).localeCompare(rawText(right), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function ExcelTable<T>({
  columns,
  rows,
  rowKey,
  dense = true,
  stickyFirstColumn = false,
  exportFilename,
  empty = "No records found.",
  title,
  caption,
}: ExcelTableProps<T>): ReactElement {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: keyof T | null; dir: SortDirection }>({
    key: null,
    dir: "asc",
  });

  const selectOptions = useMemo(() => {
    const options = new Map<string, string[]>();
    for (const column of columns) {
      if ((column.filter ?? "text") !== "select") continue;
      const values = column.filterOptions ?? rows.map((row) => rawText(row[column.key]));
      options.set(
        String(column.key),
        [...new Set(values.filter(Boolean))].sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
        ),
      );
    }
    return options;
  }, [columns, rows]);

  const visibleRows = useMemo(() => {
    const filtered = rows.filter((row) =>
      columns.every((column) => {
        const query = filters[String(column.key)] ?? "";
        if (!query || (column.filter ?? "text") === "none") return true;
        const filterType = column.filter ?? "text";
        const value = filterType === "select" ? rawText(row[column.key]) : filterText(column, row);
        return filterType === "select"
          ? value === query
          : value.toLocaleLowerCase().includes(query.toLocaleLowerCase());
      }),
    );

    if (sort.key === null) return filtered;
    const column = columns.find((candidate) => candidate.key === sort.key);
    if (!column) return filtered;

    return filtered
      .map((row, index) => ({ row, index }))
      .sort((left, right) => {
        const leftValue = column.sortValue?.(left.row) ?? left.row[column.key];
        const rightValue = column.sortValue?.(right.row) ?? right.row[column.key];
        const comparison = compareValues(leftValue, rightValue);
        return comparison === 0
          ? left.index - right.index
          : comparison * (sort.dir === "asc" ? 1 : -1);
      })
      .map(({ row }) => row);
  }, [columns, filters, rows, sort]);

  const numericColumns = useMemo(
    () =>
      new Set(
        columns
          .filter((column) => rows.some((row) => typeof row[column.key] === "number"))
          .map((column) => String(column.key)),
      ),
    [columns, rows],
  );

  const hasFilters = Object.values(filters).some(Boolean);
  const padding = dense ? "px-2 py-1" : "px-4 py-3";
  const textSize = dense ? "text-xs" : "text-sm";

  function alignment(column: ExcelColumn<T>): string {
    const align = column.align ?? (numericColumns.has(String(column.key)) ? "right" : "left");
    return align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  }

  function headerJustification(column: ExcelColumn<T>): string {
    const align = column.align ?? (numericColumns.has(String(column.key)) ? "right" : "left");
    return align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
  }

  function cycleSort(column: ExcelColumn<T>): void {
    if (column.sortable === false) return;
    setSort((current) => {
      if (current.key !== column.key) return { key: column.key, dir: "asc" };
      if (current.dir === "asc") return { key: column.key, dir: "desc" };
      return { key: null, dir: "asc" };
    });
  }

  function handleExport(): void {
    if (!exportFilename || visibleRows.length === 0) return;
    const exportRows = visibleRows.map((row) =>
      Object.fromEntries(
        columns.map((column) => [
          String(column.key),
          column.exportValue?.(row) ?? row[column.key],
        ]),
      ),
    );
    const exportColumns = columns.map((column) => ({
      key: String(column.key),
      header: column.header,
    }));
    exportRowsToXlsx(exportRows, exportColumns, exportFilename);
  }

  return (
    <div className="max-w-full overflow-hidden rounded-xl border border-mist-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-mist-200 px-3 py-2 text-sm">
        {title || caption ? (
          <div className="mr-auto">
            {title ? <h2 className="font-semibold text-navy">{title}</h2> : null}
            {caption ? <p className="mt-0.5 text-[11px] text-slate-500">{caption}</p> : null}
          </div>
        ) : <span className="mr-auto" />}
        <span className="text-slate-500">
          {visibleRows.length} of {rows.length} rows
        </span>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => setFilters({})}
            className="rounded-md border border-mist-200 px-2 py-1 text-xs font-medium text-navy hover:bg-mist-100"
          >
            Clear filters
          </button>
        ) : null}
        {exportFilename ? (
          <button
            type="button"
            onClick={handleExport}
            disabled={visibleRows.length === 0}
            className="rounded-md bg-teal-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export XLSX
          </button>
        ) : null}
      </div>

      <div className="max-h-[70vh] overflow-auto">
        <table className={`min-w-max border-collapse ${textSize}`}>
          <thead className="bg-mist-100 text-navy">
            <tr>
              {columns.map((column, columnIndex) => {
                const activeSort = sort.key === column.key ? sort.dir : null;
                return (
                  <th
                    key={String(column.key)}
                    scope="col"
                    style={column.width ? { minWidth: column.width, width: column.width } : undefined}
                    className={`sticky top-0 z-30 border-b border-mist-200 bg-mist-100 font-semibold uppercase tracking-wider ${padding} ${alignment(column)} ${
                      stickyFirstColumn && columnIndex === 0 ? "left-0 z-40" : ""
                    }`}
                  >
                    <button
                      type="button"
                      disabled={column.sortable === false}
                      onClick={() => cycleSort(column)}
                      className={`inline-flex w-full items-center gap-1 disabled:cursor-default ${headerJustification(column)}`}
                    >
                      {column.header}
                      {activeSort ? <span aria-hidden="true">{activeSort === "asc" ? "▲" : "▼"}</span> : null}
                    </button>
                  </th>
                );
              })}
            </tr>
            <tr>
              {columns.map((column, columnIndex) => {
                const filter = column.filter ?? "text";
                const key = String(column.key);
                const controlClass = "w-full rounded border border-mist-200 bg-white px-1.5 py-1 text-xs font-normal text-ink outline-none focus:border-sky-hpp focus:ring-1 focus:ring-sky-hpp";
                return (
                  <th
                    key={key}
                    className={`sticky top-[25px] z-20 border-b border-mist-200 bg-mist-100 ${padding} ${
                      stickyFirstColumn && columnIndex === 0 ? "left-0 z-30" : ""
                    }`}
                  >
                    {filter === "text" ? (
                      <input
                        type="search"
                        value={filters[key] ?? ""}
                        onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))}
                        placeholder={`Filter ${column.header}`}
                        aria-label={`Filter ${column.header}`}
                        className={controlClass}
                      />
                    ) : filter === "select" ? (
                      <select
                        value={filters[key] ?? ""}
                        onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))}
                        aria-label={`Filter ${column.header}`}
                        className={controlClass}
                      >
                        <option value="">All</option>
                        {(selectOptions.get(key) ?? []).map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : null}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-mist-200">
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                  {empty}
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => (
                <tr key={rowKey(row)} className="odd:bg-white even:bg-mist-50 hover:bg-mist-100/70">
                  {columns.map((column, columnIndex) => {
                    const value = row[column.key];
                    const numeric = typeof value === "number";
                    return (
                      <td
                        key={String(column.key)}
                        className={`whitespace-nowrap text-slate-700 ${padding} ${alignment(column)} ${
                          numeric ? "tabular-nums" : ""
                        } ${stickyFirstColumn && columnIndex === 0 ? "sticky left-0 z-10 bg-inherit" : ""}`}
                      >
                        {column.render ? column.render(value, row) : rawText(value)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
