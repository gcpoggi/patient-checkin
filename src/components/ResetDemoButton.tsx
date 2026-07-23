"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResetDemoButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(false);

  async function resetDemo() {
    setIsPending(true);
    setError(false);
    try {
      const response = await fetch("/api/store/reset", { method: "POST" });
      if (!response.ok) throw new Error("Reset failed");
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button type="button" onClick={resetDemo} disabled={isPending}
      title={error ? "Could not reset demo data. Please try again." : undefined}
      className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-medium transition disabled:cursor-wait disabled:opacity-60 ${error ? "text-pending" : "text-mist-100/70 hover:bg-white/10 hover:text-white"}`}>
      {isPending ? "Resetting…" : error ? "Reset failed - retry" : "Reset demo data"}
    </button>
  );
}
