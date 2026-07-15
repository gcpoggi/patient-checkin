import Image from "next/image";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-mist-50 md:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-navy px-10 py-12 text-mist-100 md:flex md:flex-col lg:px-16 lg:py-16">
        <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full border border-sky-hpp/15" />
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-teal-500/10" />

        <div className="relative" aria-label="HPP Management Corp.">
          <Image
            src="/logo-white.png"
            alt="HPP Management Corp."
            width={867}
            height={258}
            priority
            className="h-12 w-auto lg:h-14"
          />
        </div>

        <div className="relative my-auto max-w-2xl py-16">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-teal-300">
            HPP Patient Check-In
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-white lg:text-6xl">
            Practice control for every patient visit.
          </h1>
          <p className="mt-7 text-sm font-semibold uppercase tracking-[0.18em] text-sky-hpp lg:text-base">
            We Don&apos;t Create · We Document · We Verify
          </p>
          <p className="mt-6 max-w-xl text-base leading-7 text-mist-100/80 lg:text-lg lg:leading-8">
            Real-time visibility into patient activity and financial outcomes — improve accuracy, reduce billing errors, strengthen collections.
          </p>
        </div>

        <footer className="relative border-t border-white/10 pt-6 text-sm text-mist-100/70">
          <p>Secure. Compliant. Efficient. Built for today&apos;s healthcare.</p>
          <p className="mt-1 text-teal-300">info@hppcorp.com</p>
        </footer>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-16">
        <div className="w-full max-w-md rounded-xl border border-mist-200 bg-white p-7 shadow-[0_20px_50px_rgba(13,27,42,0.08)] sm:p-10">
          <div className="md:hidden">
            <Image
              src="/logo-dark.png"
              alt="HPP Management Corp."
              width={867}
              height={258}
              priority
              className="mb-4 h-10 w-auto"
            />
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">HPP Patient Check-In</p>
          </div>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-navy md:mt-0">Sign in</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            Access patient operations and billing oversight.
          </p>

          <LoginForm />

          <aside className="mt-7 rounded-lg border border-mist-200 bg-mist-50 px-4 py-3.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">Demo credentials</p>
            <p className="mt-2 font-mono text-xs text-ink/65">pesilverio@hppcorp.com / 1234</p>
          </aside>
        </div>
      </section>
    </main>
  );
}
