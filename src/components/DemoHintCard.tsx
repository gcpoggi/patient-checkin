const demoPatients = [
  {
    name: "Maria Rodriguez",
    dob: "1958-03-14",
    phone: "(305) 555-0147",
    result: "Exists - attendance",
  },
  {
    name: "Carlos Mendez",
    dob: "1971-09-02",
    phone: "(786) 555-0193",
    result: "Not in file - register new",
  },
] as const;

export function DemoHintCard() {
  return (
    <aside className="rounded-xl border border-mist-200 bg-mist-50 p-4" aria-labelledby="demo-patients-title">
      <p id="demo-patients-title" className="text-xs font-semibold uppercase tracking-widest text-teal-600">
        Demo patients
      </p>
      <ul className="mt-3 space-y-3 text-sm text-slate-700">
        {demoPatients.map((patient) => (
          <li key={patient.name}>
            <span className="font-semibold text-navy">{patient.name}</span>
            <span className="block font-mono text-xs tabular-nums text-slate-600">
              {patient.dob} · {patient.phone}
            </span>
            <span className="text-xs text-teal-700">{patient.result}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
