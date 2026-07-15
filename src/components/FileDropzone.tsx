"use client";

import { useRef, useState } from "react";
import { UploadSummary, type UploadResult } from "@/components/UploadSummary";

const acceptedExtensions = [".csv", ".xlsx"];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<UploadResult | null>(null);

  async function upload(selected: File) {
    const extension = selected.name.slice(selected.name.lastIndexOf(".")).toLowerCase();
    setFile(selected);
    setResult(null);
    if (!acceptedExtensions.includes(extension)) {
      setError("Choose a .csv or .xlsx claims file.");
      return;
    }

    setError("");
    setLoading(true);
    const body = new FormData();
    body.append("file", selected);
    try {
      const response = await fetch("/api/claims/upload", { method: "POST", body });
      const data: UploadResult | { message?: string } = await response.json();
      if (!response.ok || !("ok" in data)) throw new Error("message" in data ? data.message : "Upload failed.");
      setResult(data);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload claims CSV or XLSX file"
        onClick={() => !loading && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (!loading && (event.key === "Enter" || event.key === " ")) inputRef.current?.click();
        }}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { event.preventDefault(); setDragging(false); }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const selected = event.dataTransfer.files[0];
          if (selected && !loading) void upload(selected);
        }}
        className={`flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-white p-8 text-center shadow-sm transition focus:outline-none focus:ring-2 focus:ring-sky-hpp/40 ${dragging ? "border-teal-500 bg-mist-100" : "border-mist-200 hover:border-teal-400 hover:bg-mist-50"}`}
      >
        <input ref={inputRef} type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="sr-only" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) void upload(selected); event.target.value = ""; }} />
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mist-100 text-2xl text-teal-600" aria-hidden="true">↑</span>
        <h2 className="mt-4 font-display text-2xl font-semibold text-navy">{loading ? "Uploading claims…" : "Drop your claims export here"}</h2>
        <p className="mt-2 text-sm text-slate-600">or click to choose a CSV or XLSX file</p>
        {file ? <p className="mt-4 rounded-full bg-mist-100 px-4 py-2 text-sm font-medium text-navy"><span className="break-all">{file.name}</span> · {formatBytes(file.size)}</p> : null}
        {loading ? <div className="mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-mist-200"><div className="h-full w-2/3 animate-pulse rounded-full bg-teal-500" /></div> : null}
      </div>
      {error ? <p className="mt-3 rounded-lg border border-[#FBE9E9] bg-[#FBE9E9] p-3 text-sm font-medium text-[#991B1B]" role="alert">{error}</p> : null}
      {result ? <UploadSummary result={result} /> : null}
    </div>
  );
}
