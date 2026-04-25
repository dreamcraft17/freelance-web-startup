import type { Route } from "next";
import Link from "next/link";
import { Compass, LocateFixed, Radar, Zap } from "lucide-react";
import type { Translator } from "@/lib/i18n/create-translator";
import type { LandingIntent } from "@/components/marketing/LandingPage";

const trendLanes: { labelKey: string; href: string }[] = [
  { labelKey: "landing.activity.lanes.design", href: "/freelancers?keyword=design" },
  { labelKey: "landing.activity.lanes.video", href: "/freelancers?keyword=video" },
  { labelKey: "landing.activity.lanes.tutor", href: "/freelancers?keyword=tutor" }
];

const quickFilters: { labelKey: string; href: string }[] = [
  { labelKey: "landing.activity.filters.nearby", href: "/search/nearby" },
  { labelKey: "landing.activity.filters.remote", href: "/freelancers?workMode=REMOTE" }
];

function withIntent(href: string, intent: LandingIntent): Route {
  const [pathname, query = ""] = href.split("?");
  const params = new URLSearchParams(query);
  params.set("intent", intent);
  return `${pathname}?${params.toString()}` as Route;
}

export function LandingActivityStrip({ t, intent }: { t: Translator; intent: LandingIntent }) {
  return (
    <section className="border-b border-slate-200 bg-slate-50/80">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1.5 text-slate-700">
            <Radar className="h-3.5 w-3.5 text-[#3525cd]" aria-hidden />
            {t("landing.activity.liveNow")}
          </span>
          <Link href={withIntent("/jobs", intent)} className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-slate-700 hover:border-[#3525cd]/45 hover:text-[#3525cd]">
            {t("landing.activity.activeNow")}
          </Link>
          <Link href={withIntent("/freelancers", intent)} className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-slate-700 hover:border-[#3525cd]/45 hover:text-[#3525cd]">
            {t("landing.activity.newToday")}
          </Link>
          <span className="mx-1 text-slate-300">|</span>
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <Compass className="h-3.5 w-3.5" aria-hidden />
            {t("landing.activity.trending")}
          </span>
          {trendLanes.map(({ labelKey, href }) => (
            <Link
              key={labelKey}
              href={withIntent(href, intent)}
              className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-slate-700 transition hover:border-[#3525cd]/45 hover:text-[#3525cd]"
            >
              {t(labelKey)}
            </Link>
          ))}
          <span className="mx-1 text-slate-300">|</span>
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <Zap className="h-3.5 w-3.5" aria-hidden />
            {t("landing.activity.quickFilters")}
          </span>
          {quickFilters.map(({ labelKey, href }) => (
            <Link
              key={labelKey}
              href={withIntent(href, intent)}
              className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-slate-700 transition hover:border-[#3525cd]/45 hover:text-[#3525cd]"
            >
              {t(labelKey)}
            </Link>
          ))}
          <Link
            href={withIntent("/jobs", intent)}
            className="inline-flex items-center gap-1 rounded-md border border-[#3525cd]/35 bg-[#3525cd]/[0.07] px-2 py-0.5 text-[#3525cd] transition hover:border-[#3525cd]/60"
          >
            <LocateFixed className="h-3.5 w-3.5" aria-hidden />
            {t("landing.activity.activeBriefs")}
          </Link>
        </div>
      </div>
    </section>
  );
}
