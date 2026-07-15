"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      if (!response.ok) {
        setError("Invalid credentials. Please try again.");
        return;
      }

      const result: { ok: boolean } = await response.json();
      if (!result.ok) {
        setError("Invalid credentials. Please try again.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-mist-200 bg-white px-3.5 py-3 text-sm text-ink outline-none transition focus:border-sky-hpp focus:ring-3 focus:ring-sky-hpp/20"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-mist-200 bg-white px-3.5 py-3 text-sm text-ink outline-none transition focus:border-sky-hpp focus:ring-3 focus:ring-sky-hpp/20"
          placeholder="Enter your password"
        />
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-missing-bg px-3.5 py-3 text-sm font-medium text-missing">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-teal-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-65"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
