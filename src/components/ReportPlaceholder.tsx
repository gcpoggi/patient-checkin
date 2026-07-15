export interface ReportPlaceholderProps { title: string; description: string; }

export function ReportPlaceholder({ title, description }: ReportPlaceholderProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-mist-200 bg-mist-50 shadow-sm" aria-label={`${title} preview`}>
      <header className="flex flex-wrap items-center justify-between gap-2 bg-navy px-5 py-4 text-white">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <span className="rounded-full border border-sky-hpp/30 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-teal-300">Microsoft Power BI</span>
      </header>
      <div className="relative p-4 sm:p-5">
        <div className="grid animate-pulse grid-cols-3 gap-3" aria-hidden="true">
          {["w-2/3", "w-1/2", "w-3/4"].map((width, index) => <div key={index} className="rounded-lg border border-mist-200 bg-white p-3"><div className={`h-2 rounded bg-mist-200 ${width}`} /><div className="mt-3 h-6 w-1/2 rounded bg-teal-300/60" /></div>)}
          <div className="col-span-2 flex h-36 items-end gap-2 rounded-lg border border-mist-200 bg-white p-4">
            {["h-10", "h-20", "h-14", "h-24", "h-16", "h-28", "h-20"].map((height, index) => <span key={index} className={`flex-1 rounded-t bg-teal-400/50 ${height}`} />)}
          </div>
          <div className="flex h-36 items-center justify-center rounded-lg border border-mist-200 bg-white p-4"><div className="h-24 w-24 rounded-full border-[14px] border-mist-200 border-r-teal-400 border-t-sky-hpp" /></div>
          <div className="col-span-3 h-24 rounded-lg border border-mist-200 bg-white p-4"><svg viewBox="0 0 400 70" className="h-full w-full" preserveAspectRatio="none"><path d="M0 55 L55 42 L110 47 L165 22 L220 35 L275 15 L330 25 L400 8" fill="none" stroke="#7CC5DE" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
        </div>
        <div className="absolute inset-4 flex items-center justify-center sm:inset-5"><div className="max-w-sm rounded-xl border border-white/80 bg-white/90 px-5 py-4 text-center shadow-lg backdrop-blur-sm"><p className="text-xs font-bold uppercase tracking-widest text-teal-600">Power BI embed — coming soon</p><p className="mt-2 text-sm leading-5 text-slate-600">{description}</p></div></div>
      </div>
    </section>
  );
}
