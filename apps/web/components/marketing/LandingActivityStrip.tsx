import type { Route } from "next";
import Link from "next/link";
import { Compass, LocateFixed, Radar, Zap } from "lucide-react";
import type { Translator } from "@/lib/i18n/create-translator";
import type { MarketplacePulseStats } from "@/components/marketing/MarketplacePulse";

const trendLanes: { labelKey: string; href: Route }[] = [
  { labelKey: "landing.activity.lanes.design", href: "/freelancers?keyword=design" },
  { labelKey: "landing.activity.lanes.video", href: "/freelancers?keyword=video" },
  { labelKey: "landing.activity.lanes.tutor", href: "/freelancers?keyword=tutor" }
];

const quickFilters: { labelKey: string; href: Route }[] = [
  { labelKey: "landing.activity.filters.nearby", href: "/search/nearby" },
  { labelKey: "landing.activity.filters.remote", href: "/freelancers?workMode=REMOTE" }
];

export function LandingActivityStrip({ t, pulse }: { t: Translator; pulse: MarketplacePulseStats }) {
  return (
    <section className="border-b border-slate-200 bg-slate-50/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
          <span className="inline-flex items-center gap-1.5 text-slate-700">
            <Radar className="h-3.5 w-3.5 text-[#3525cd]" aria-hidden />
            {t("landing.activity.liveNow")}
          </span>
          <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-slate-700">
            {t("landing.activity.openJobs", { count: pulse.openPublicJobs })}
          </span>
          <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-slate-700">
            {t("landing.activity.newProposals", { count: pulse.bidsLast24h })}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              <Compass className="h-3.5 w-3.5 text-slate-500" aria-hidden />
              {t("landing.activity.trending")}
            </span>
            {trendLanes.map(({ labelKey, href }) => (
              <Link
                key={labelKey}
                href={href}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 transition hover:border-[#3525cd]/45 hover:text-[#3525cd]"
              >
                {t(labelKey)}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              <Zap className="h-3.5 w-3.5 text-slate-500" aria-hidden />
              {t("landing.activity.quickFilters")}
            </span>
            {quickFilters.map(({ labelKey, href }) => (
              <Link
                key={labelKey}
                href={href}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 transition hover:border-[#3525cd]/45 hover:text-[#3525cd]"
              >
                {t(labelKey)}
              </Link>
            ))}
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1 rounded-md border border-[#3525cd]/35 bg-[#3525cd]/[0.07] px-2.5 py-1 text-xs font-bold text-[#3525cd] transition hover:border-[#3525cd]/60"
            >
              <LocateFixed className="h-3.5 w-3.5" aria-hidden />
              {t("landing.activity.activeBriefs")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
