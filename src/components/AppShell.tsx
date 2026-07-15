import Link from "next/link";

const navigation = [
  { label: "Dashboard", href: "/" },
  { label: "Check-In", href: "/check-in" },
  { label: "Attendance", href: "/attendance" },
  { label: "Claims", href: "/claims" },
  { label: "Reports", href: "/reports" },
] as const;

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-mist-50">
      <header className="bg-navy text-mist-100 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="HPP Patient Check-In home">
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-teal-400" aria-hidden="true">
              <circle cx="10" cy="10" r="10" fill="currentColor" />
              <circle cx="10" cy="10" r="4" className="text-sky-hpp" fill="currentColor" />
            </svg>
            <span className="leading-none">
              <span className="block text-xl font-bold tracking-wider text-white">HPP</span>
              <span className="block text-[9px] tracking-wide text-mist-100">Management Corp.</span>
            </span>
          </Link>

          <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto lg:order-none lg:w-auto" aria-label="Main navigation">
            {navigation.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  index === 0
                    ? "bg-teal-600 text-white"
                    : "text-mist-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <span className="hidden rounded-full border border-teal-400/40 bg-teal-700/40 px-3 py-1 text-xs font-semibold tracking-wide text-teal-300 xl:inline-flex">
            Practice Control Layer
          </span>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full bg-white/10 px-3 py-1.5 text-xs text-mist-100 sm:inline-flex">
              pesilverio@hppcorp.com
            </span>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="rounded-lg border border-mist-200/30 px-3 py-1.5 text-xs font-semibold text-mist-100 transition-colors hover:border-teal-300 hover:text-teal-300"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
