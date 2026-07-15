import { AppShell } from "@/components/AppShell";
import { MenuCard } from "@/components/MenuCard";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";

const menuItems = [
  {
    href: "/check-in",
    title: "Register Check-In",
    description: "Document patient arrivals and keep the daily visit record complete.",
  },
  {
    href: "/attendance",
    title: "Attendance",
    description: "Review scheduled visits, evaluations, attendance, and no-shows.",
  },
  {
    href: "/claims",
    title: "Claims",
    description: "Cross-check services against billing data and resolve exceptions.",
  },
  {
    href: "/reports",
    title: "Power BI Reports",
    description: "Open financial and operational reporting for practice oversight.",
  },
] as const;

export default function Home() {
  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        subtitle="Practice control layer for patient operations & billing oversight"
      />

      <section className="mt-8">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-teal-600">Practice operations</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {menuItems.map((item) => <MenuCard key={item.href} {...item} />)}
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="Monthly highlights">
        <StatCard label="Visits MTD" value={465} sub="Across all offices" />
        <StatCard label="Attendance rate" value="94%" sub="Month to date" variant="navy" />
        <StatCard label="Claims at risk" value="$4,120" sub="Missing and pending" />
      </section>
    </AppShell>
  );
}
