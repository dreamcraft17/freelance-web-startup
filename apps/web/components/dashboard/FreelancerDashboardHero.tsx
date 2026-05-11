import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export type FreelancerHeroStatVm = {
  label: string;
  value: string;
  hint?: string;
};

type FreelancerDashboardHeroProps = {
  welcomeTitle: string;
  subtitle: string;
  motivation: string;
  browseJobsCta: string;
  /** Locale-prefixed public jobs listing (e.g. `/en/jobs`). */
  browseJobsHref: Route;
  stats: FreelancerHeroStatVm[];
  trustLine: string;
  trustPills: string[];
};

export function FreelancerDashboardHero({
  welcomeTitle,
  subtitle,
  motivation,
  browseJobsCta,
  browseJobsHref,
  stats,
  trustLine,
  trustPills
}: FreelancerDashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#3525cd]/25 bg-gradient-to-br from-[#231668] via-[#2f1fa8] to-[#3d2ed4] px-5 py-7 text-white shadow-nw-elevated md:px-9 md:py-9">
      <div className="pointer-events-none absolute -right-28 -top-20 h-[18rem] w-[18rem] rounded-full bg-fuchsia-400/12" aria-hidden />
      <div className="pointer-events-none absolute -bottom-28 -left-16 h-[16rem] w-[16rem] rounded-full bg-cyan-300/10" aria-hidden />
      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 max-w-xl space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-white/62">{trustLine}</p>
          <h1 className="text-balance text-[1.45rem] font-semibold tracking-tight text-white md:text-[1.65rem] md:leading-[1.2] xl:text-[1.75rem]">
            {welcomeTitle}
          </h1>
          <p className="max-w-lg text-[14px] leading-[1.5] text-indigo-100/93">{subtitle}</p>
          <p className="text-[13px] leading-relaxed text-indigo-200/88">{motivation}</p>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {trustPills.map((pill) => (
              <span
                key={pill}
                className="inline-flex rounded-md border border-white/20 bg-white/11 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white/92"
              >
                {pill}
              </span>
            ))}
          </div>
          <div className="pt-2">
            <Link
              href={browseJobsHref}
              className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[13px] font-semibold text-[#2a1daa] shadow-md shadow-black/15 transition-colors duration-200 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2f1fa8]"
            >
              <Compass className="h-5 w-5 transition-transform duration-200 group-hover:rotate-6" aria-hidden />
              {browseJobsCta}
              <ArrowRight className="h-4 w-4 opacity-80" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-2 gap-2.5 sm:gap-2.5 lg:max-w-xl xl:max-w-md">
          {stats.map((s) => (
            <div
              key={s.label}
              className={cn(
                "flex flex-col justify-between rounded-xl border border-white/18 bg-white/10 p-3.5",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-indigo-100/82">{s.label}</p>
              <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-white md:text-[1.35rem]">{s.value}</p>
              {s.hint ? <p className="mt-0.5 text-[10px] leading-snug text-indigo-200/85">{s.hint}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
