import { MapPin } from "lucide-react";

const examples = [
  {
    kind: "Freelancer" as const,
    title: "Maya Sutanto",
    subtitle: "Portrait & small events",
    location: "Menteng, Jakarta",
    distance: "~6 km",
    price: "From Rp 2.4M / half-day"
  },
  {
    kind: "Job" as const,
    title: "Half-day brand shoot",
    subtitle: "Client needs on-site · 4h",
    location: "Kelapa Gading",
    distance: "~12 km",
    price: "Budget Rp 4.5–7M"
  },
  {
    kind: "Freelancer" as const,
    title: "Rama Wijaya",
    subtitle: "Interview cuts & captions",
    location: "Remote",
    distance: "—",
    price: "From Rp 650k / day"
  }
] as const;

export function LandingProductPreview() {
  return (
    <section className="mx-auto max-w-3xl px-4 pb-4 pt-2 sm:px-6 sm:pb-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">What you might see</h2>
        <p className="text-[11px] text-slate-400">Illustrative examples — browse live listings next.</p>
      </div>

      <ul className="mt-5 divide-y divide-slate-200/90 border-t border-slate-200/90">
        {examples.map((row) => (
          <li key={row.title} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-5">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span
                  className={
                    row.kind === "Job"
                      ? "rounded bg-amber-100/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900"
                      : "rounded bg-indigo-100/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-900"
                  }
                >
                  {row.kind}
                </span>
                <span className="font-semibold text-slate-900">{row.title}</span>
              </div>
              <p className="text-sm text-slate-600">{row.subtitle}</p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end sm:text-right">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50/90 px-2 py-1 text-xs font-medium text-indigo-950 ring-1 ring-indigo-100">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-600" aria-hidden />
                {row.location}
                {row.distance !== "—" ? (
                  <span className="font-normal text-indigo-700/70">· {row.distance}</span>
                ) : null}
              </span>
              <span className="text-sm font-medium tabular-nums text-slate-800">{row.price}</span>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400 sm:text-left">
        <span className="font-medium text-slate-500">No spam bids</span>
        <span className="mx-2 text-slate-300">·</span>
        <span className="font-medium text-slate-500">Simple hiring</span>
        <span className="mx-2 text-slate-300">·</span>
        <span className="font-medium text-slate-500">Built for real work</span>
      </p>
    </section>
  );
}
