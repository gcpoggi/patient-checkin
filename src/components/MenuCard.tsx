import Link from "next/link";

export interface MenuCardProps {
  href: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  accent?: string;
}

export function MenuCard({ href, title, description, icon, accent = "bg-teal-500" }: MenuCardProps) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border border-mist-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-hpp"
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${accent}`} aria-hidden="true" />
      {icon ? <div className="mb-5 text-teal-500">{icon}</div> : null}
      <h2 className="font-display text-xl font-semibold text-navy group-hover:text-teal-700">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <span className="mt-5 inline-flex text-sm font-semibold text-teal-600" aria-hidden="true">Open →</span>
    </Link>
  );
}
