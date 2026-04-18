import type { Route } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";

type PreviewRow = {
  kind: "Freelancer" | "Job";
  title: string;
  subtitle: string;
  location: string;
  distance: string;
  price: string;
  initials: string;
  meta: string;
};

const examples: PreviewRow[] = [
  {
    kind: "Freelancer",
    title: "Maya Sutanto",
    subtitle: "Portrait & small events",
    location: "Menteng, Jakarta",
    distance: "~6 km",
    price: "From Rp 2.4M / half-day",
    initials: "MS",
    meta: "Responds same day"
  },
  {
    kind: "Job",
    title: "Half-day brand shoot",
    subtitle: "Client needs on-site · 4h",
    location: "Kelapa Gading",
    distance: "~12 km",
    price: "Budget Rp 4.5–7M",
    initials: "JB",
    meta: "3 bids · open"
  },
  {
    kind: "Freelancer",
    title: "Rama Wijaya",
    subtitle: "Interview cuts & captions",
    location: "Remote",
    distance: "—",
    price: "From Rp 650k / day",
    initials: "RW",
    meta: "Top rated in category"
  }
];

function ListingAvatar({ initials, kind }: { initials: string; kind: PreviewRow["kind"] }) {
  const ring = kind === "Job" ? "ring-amber-200/80" : "ring-[#3525cd]/25";
  return (
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-sm font-bold tracking-tight text-slate-800 ring-2 ${ring}`}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function LandingProductPreview() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-12">
      <div className="flex flex-col gap-2 border-b-2 border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="nw-section-title">Live-style layout</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">What you will see in results</h2>
        </div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Illustrative rows · not real users</p>
      </div>

      <ul className="mt-6 overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-sm">
        {examples.map((row, i) => (
          <li
            key={row.title}
            className={`border-b border-slate-200/90 last:border-b-0 ${i % 2 === 1 ? "bg-slate-50/70" : "bg-white"}`}
          >
            <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5">
              <div className="flex shrink-0 items-start gap-4">
                <ListingAvatar initials={row.initials} kind={row.kind} />
                <div className="min-w-0 sm:hidden">
                  <span
                    className={
                      row.kind === "Job"
                        ? "inline-block rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950"
                        : "inline-block rounded border border-[#3525cd]/30 bg-[#3525cd]/[0.08] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#3525cd]"
                    }
                  >
                    {row.kind}
                  </span>
                  <p className="mt-1 text-lg font-bold text-slate-950">{row.title}</p>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="hidden items-center gap-2 sm:flex">
                  <span
                    className={
                      row.kind === "Job"
                        ? "rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950"
                        : "rounded border border-[#3525cd]/30 bg-[#3525cd]/[0.08] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#3525cd]"
                    }
                  >
                    {row.kind}
                  </span>
                  <span className="text-lg font-bold tracking-tight text-slate-950">{row.title}</span>
                </div>
                <p className="mt-0.5 text-sm font-bold text-slate-700 sm:mt-1">{row.subtitle}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-slate-700">{row.meta}</span>
                </p>
              </div>

              <div className="flex w-full shrink-0 flex-col gap-2 border-t border-slate-200/80 pt-3 sm:w-52 sm:border-t-0 sm:pt-0 sm:text-right">
                <span className="inline-flex items-center justify-start gap-1.5 text-xs font-bold text-slate-800 sm:justify-end">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#3525cd]" aria-hidden />
                  <span>
                    {row.location}
                    {row.distance !== "—" ? (
                      <span className="font-semibold text-slate-500"> · {row.distance}</span>
                    ) : null}
                  </span>
                </span>
                <span className="text-base font-bold tabular-nums text-slate-950">{row.price}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
          <span className="text-slate-900">Bids in context</span>
          <span className="mx-2 font-normal text-slate-300">·</span>
          <span className="text-slate-900">Profiles with proof</span>
          <span className="mx-2 font-normal text-slate-300">·</span>
          <span className="text-slate-900">One thread per job</span>
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold">
          <Link href={"/freelancers" as Route} className="text-[#3525cd] transition hover:underline">
            Go to live freelancers →
          </Link>
          <Link href={"/jobs" as Route} className="text-[#3525cd] transition hover:underline">
            Go to live jobs →
          </Link>
        </div>
      </div>
    </section>
  );
}
