"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SubNavTabs({ items }: { items: Array<{ label: string; href: string }> }) {
  const pathname = usePathname();
  return (
    <nav className="mt-6 border-b border-mist-200" aria-label="Report sections">
      <div className="flex flex-wrap gap-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
            className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${active ? "border-teal-500 bg-mist-100 text-teal-700" : "border-transparent text-slate-500 hover:border-teal-300 hover:text-navy"}`}>
            {item.label}
          </Link>;
        })}
      </div>
    </nav>
  );
}
