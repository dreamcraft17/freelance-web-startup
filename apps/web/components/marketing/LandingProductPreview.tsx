import Link from "next/link";
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
    <section className="mx-auto max-w-6xl px-4 pb-6 pt-4 sm:px-6 sm:pb-8">
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="nw-section-title">Preview</p>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">What a listing feels like</h2>
        </div>
        <p className="text-xs font-medium text-slate-500">Examples only — jump to live data below.</p>
      </div>

      <ul className="mt-5 divide-y divide-slate-200 overflow-hidden border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
        {examples.map((row) => (
          <li
            key={row.title}
            className="flex flex-col gap-2 px-4 py-4 transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5 sm:py-5"
          >
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span
                  className={
                    row.kind === "Job"
                      ? "rounded border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950"
                      : "rounded border border-[#3525cd]/25 bg-[#3525cd]/[0.08] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#3525cd]"
                  }
                >
                  {row.kind}
                </span>
                <span className="text-base font-bold text-slate-950">{row.title}</span>
              </div>
              <p className="text-sm font-medium text-slate-600">{row.subtitle}</p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end sm:text-right">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#3525cd]" aria-hidden />
                {row.location}
                {row.distance !== "—" ? (
                  <span className="font-medium text-slate-500">· {row.distance}</span>
                ) : null}
              </span>
              <span className="text-sm font-bold tabular-nums text-slate-900">{row.price}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          <span className="text-slate-800">No spam bids</span>
          <span className="mx-2 font-normal text-slate-300">·</span>
          <span className="text-slate-800">Clear briefs</span>
          <span className="mx-2 font-normal text-slate-300">·</span>
          <span className="text-slate-800">Real work</span>
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold">
          <Link href="/freelancers" className="text-[#3525cd] transition hover:underline">
            Live freelancers →
          </Link>
          <Link href="/jobs" className="text-[#3525cd] transition hover:underline">
            Live jobs →
          </Link>
        </div>
      </div>
    </section>
  );
}
