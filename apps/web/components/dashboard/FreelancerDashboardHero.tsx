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
  stats: FreelancerHeroStatVm[];
  trustLine: string;
  trustPills: string[];
};

export function FreelancerDashboardHero({
  welcomeTitle,
  subtitle,
  motivation,
  browseJobsCta,
  stats,
  trustLine,
  trustPills
}: FreelancerDashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-indigo-400/35 bg-gradient-to-br from-[#231668] via-[#3220a3] to-[#4030d8] px-6 py-9 text-white shadow-[0_28px_80px_-42px_rgba(53,37,205,0.85)] md:px-11 md:py-11">
      <div className="pointer-events-none absolute -right-32 -top-24 h-[22rem] w-[22rem] rounded-full bg-fuchsia-400/15 blur-[100px]" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-[20rem] w-[20rem] rounded-full bg-cyan-300/14 blur-[90px]" aria-hidden />
      <div className="relative flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 max-w-xl space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">{trustLine}</p>
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-white md:text-[1.85rem] md:leading-snug xl:text-[2rem]">{welcomeTitle}</h1>
          <p className="max-w-lg text-[15px] leading-relaxed text-indigo-100/95">{subtitle}</p>
          <p className="text-sm leading-relaxed text-indigo-200/90">{motivation}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {trustPills.map((pill) => (
              <span
                key={pill}
                className="inline-flex rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[11px] font-medium backdrop-blur-sm"
              >
                {pill}
              </span>
            ))}
          </div>
          <div className="pt-3">
            <Link
              href={"/jobs" as Route}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-[#2a1daa] shadow-lg shadow-black/20 transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#3220a3]"
            >
              <Compass className="h-5 w-5 transition group-hover:rotate-6" aria-hidden />
              {browseJobsCta}
              <ArrowRight className="h-4 w-4 opacity-80" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-2 lg:max-w-xl lg:grid-cols-2 xl:max-w-md">
          {stats.map((s) => (
            <div
              key={s.label}
              className={cn(
                "flex flex-col justify-between rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
              )}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-100/80">{s.label}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-white md:text-[1.65rem]">{s.value}</p>
              {s.hint ? <p className="mt-1 text-[11px] leading-snug text-indigo-200/85">{s.hint}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
