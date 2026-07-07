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
    <section className="nw-card-trust overflow-hidden px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 max-w-xl space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-slate-500">{trustLine}</p>
          <h1 className="text-balance text-[1.45rem] font-semibold tracking-tight text-slate-950 md:text-[1.65rem] md:leading-[1.2] xl:text-[1.75rem]">
            {welcomeTitle}
          </h1>
          <p className="max-w-lg text-[14px] leading-[1.5] text-slate-600">{subtitle}</p>
          <p className="text-[13px] leading-relaxed text-slate-500">{motivation}</p>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {trustPills.map((pill) => (
              <span key={pill} className="nw-chip nw-chip-muted text-[10px] font-semibold tracking-wide">
                {pill}
              </span>
            ))}
          </div>
          <div className="pt-2">
            <Link
              href={browseJobsHref}
              className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-nw-brand px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#2b1da8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nw-brand/35 focus-visible:ring-offset-2"
            >
              <Compass className="h-5 w-5" aria-hidden />
              {browseJobsCta}
              <ArrowRight className="h-4 w-4 opacity-80" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-2 gap-2.5 sm:gap-3 lg:max-w-xl xl:max-w-md">
          {stats.map((s) => (
            <div
              key={s.label}
              className={cn(
                "flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50 p-3.5"
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">{s.label}</p>
              <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-slate-900 md:text-[1.35rem]">
                {s.value}
              </p>
              {s.hint ? <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{s.hint}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
