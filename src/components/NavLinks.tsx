"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Dashboard", href: "/" },
  { label: "Check-In", href: "/check-in" },
  { label: "Attendance", href: "/attendance" },
  { label: "Claims", href: "/claims" },
  { label: "Reports", href: "/reports" },
  { label: "Contestations", href: "/contestations" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return navigation.map((item) => {
    const isActive = item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "bg-teal-600 text-white"
            : "text-mist-100 hover:bg-white/10 hover:text-white"
        }`}
      >
        {item.label}
      </Link>
    );
  });
}
