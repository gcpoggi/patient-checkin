import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { ResetDemoButton } from "@/components/ResetDemoButton";

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
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:gap-x-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center" aria-label="HPP Patient Check-In home">
            <Image
              src="/logo-white.png"
              alt="HPP Management Corp."
              width={867}
              height={258}
              priority
              className="h-9 w-auto"
            />
          </Link>

          <nav className="order-3 flex w-full flex-wrap items-center gap-1 border-t border-white/10 pt-2 lg:order-none lg:w-auto lg:border-0 lg:pt-0" aria-label="Main navigation">
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
            <ResetDemoButton />
          </nav>

          <span className="hidden rounded-full border border-teal-400/40 bg-teal-700/40 px-3 py-1 text-xs font-semibold tracking-wide text-teal-300 xl:inline-flex">
            Practice Control Layer
          </span>

          <div className="ml-auto flex min-w-0 items-center gap-2">
            <span className="max-w-28 truncate rounded-full bg-white/10 px-2.5 py-1.5 text-[10px] text-mist-100 sm:max-w-none sm:px-3 sm:text-xs">
              pesilverio@hppcorp.com
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
