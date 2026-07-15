"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="rounded-lg border border-mist-200/30 px-3 py-1.5 text-xs font-semibold text-mist-100 transition-colors hover:border-teal-300 hover:text-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Logging out…" : "Logout"}
    </button>
  );
}
