"use client";

import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Grid2X2, MapPin, Search, ShieldCheck, Sparkles, Zap } from "lucide-react";
import type { LandingIntent } from "@/components/marketing/LandingPage";
import { useI18n } from "@/features/i18n/I18nProvider";

type ModeContent = {
  headline: string;
  subHeadline: string;
  primaryCtaLabel: string;
  primaryCtaHref: Route;
  secondaryCtaLabel: string;
  secondaryCtaHref: Route;
  searchAction: Route;
  searchPlaceholder: string;
  ctaBandLabel: string;
};

const DEMO_ROWS = [
  { name: "Siska Putri", role: "UI/UX Designer", rating: "4.9", hue: "bg-[#fed7d7]" },
  { name: "Rama Wijaya", role: "Video Editor", rating: "4.8", hue: "bg-[#bfdbfe]" },
  { name: "Daffa Pratama", role: "Web Developer", rating: "4.9", hue: "bg-[#fde68a]" }
] as const;

export function LandingHero({
  intent,
  homePath
}: {
  intent: LandingIntent;
  homePath: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentIntent, setCurrentIntent] = useState<LandingIntent>(intent);

  const modeContent: ModeContent = useMemo(() => {
    if (currentIntent === "hire") {
      return {
        headline: `${t("landing.hero.hire.headlineLine1")}\n${t("landing.hero.hire.headlineBeforeEmphasis")}${t("landing.hero.hire.headlineEmphasis")}${t("landing.hero.hire.headlineAfterEmphasis")}`,
        subHeadline: t("landing.hero.hire.subHeadline"),
        primaryCtaLabel: t("landing.hero.hire.primaryCta"),
        primaryCtaHref: "/freelancers" as Route,
        secondaryCtaLabel: t("landing.hero.hire.secondaryCta"),
        secondaryCtaHref: "/client/jobs/new" as Route,
        searchAction: "/freelancers" as Route,
        searchPlaceholder: t("landing.hero.hire.searchPlaceholder"),
        ctaBandLabel: t("landing.hero.hire.ctaBand")
      };
    }
    if (currentIntent === "work") {
      return {
        headline: t("landing.hero.work.headline"),
        subHeadline: t("landing.hero.work.subHeadline"),
        primaryCtaLabel: t("landing.hero.work.primaryCta"),
        primaryCtaHref: "/jobs" as Route,
        secondaryCtaLabel: t("landing.hero.work.secondaryCta"),
        secondaryCtaHref: "/freelancer/profile" as Route,
        searchAction: "/jobs" as Route,
        searchPlaceholder: t("landing.hero.work.searchPlaceholder"),
        ctaBandLabel: t("landing.hero.work.ctaBand")
      };
    }
    return {
      headline: t("landing.hero.neutral.headline"),
      subHeadline: t("landing.hero.neutral.subHeadline"),
      primaryCtaLabel: t("landing.hero.neutral.primaryCta"),
      primaryCtaHref: "/freelancers" as Route,
      secondaryCtaLabel: t("landing.hero.neutral.secondaryCta"),
      secondaryCtaHref: "/jobs" as Route,
      searchAction: "/freelancers" as Route,
      searchPlaceholder: t("landing.hero.neutral.searchPlaceholder"),
      ctaBandLabel: t("landing.hero.neutral.ctaBand")
    };
  }, [currentIntent, t]);

  const toggleIntent = currentIntent === "neutral" ? "hire" : currentIntent;
  const onIntentChange = (next: Exclude<LandingIntent, "neutral">) => {
    setCurrentIntent(next);
    startTransition(() => {
      router.replace(`${homePath}?intent=${next}` as Route, { scroll: false });
    });
  };

  const popularTags = [
    t("landing.hero.popularLogoDesign"),
    t("landing.hero.popularVideoEditing"),
    t("landing.hero.popularWebsite"),
    t("landing.hero.popularCopywriting"),
    t("landing.hero.popularSeo"),
    t("landing.hero.popularUiUx")
  ];

  return (
    <section className="bg-[#f3f4fa]">
      <div className="mx-auto max-w-[1180px] px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-10">
        <div className="px-2 sm:px-4">
          <div className="grid items-start gap-6 lg:grid-cols-12">
            <div className="lg:col-span-9">
              <div className="flex justify-center lg:justify-start">
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => onIntentChange("hire")}
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition ${toggleIntent === "hire" ? "bg-[#4f35e8] text-white" : "text-slate-700 hover:bg-slate-100"}`}
                  >
                    {t("landing.hero.intentHire")}
                  </button>
                  <button
                    type="button"
                    onClick={() => onIntentChange("work")}
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition ${toggleIntent === "work" ? "bg-[#4f35e8] text-white" : "text-slate-700 hover:bg-slate-100"}`}
                  >
                    {t("landing.hero.intentWork")}
                  </button>
                </div>
              </div>

              <div className={`mt-6 text-center transition-opacity duration-200 ease-in-out ${isPending ? "opacity-70" : "opacity-100"}`}>
                <h1 className="mx-auto max-w-4xl whitespace-pre-line text-[2.7rem] font-bold leading-[1.08] tracking-tight text-[#071027] sm:text-[3.45rem]">
                  {toggleIntent === "hire" ? (
                    <>
                      {t("landing.hero.hire.headlineLine1")}
                      {"\n"}
                      {t("landing.hero.hire.headlineBeforeEmphasis")}
                      <span className="text-[#4f35e8]">{t("landing.hero.hire.headlineEmphasis")}</span>
                      {t("landing.hero.hire.headlineAfterEmphasis")}
                    </>
                  ) : (
                    modeContent.headline
                  )}
                </h1>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">{modeContent.subHeadline}</p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                  <Link
                    href={modeContent.primaryCtaHref}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#4f35e8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4326d9]"
                  >
                    {modeContent.primaryCtaLabel}
                  </Link>
                  <Link
                    href={modeContent.secondaryCtaHref}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {modeContent.secondaryCtaLabel}
                  </Link>
                </div>
              </div>
            </div>

            <aside className="hidden lg:col-span-3 lg:block">
              <div className="relative mt-4 min-h-[260px] rounded-[2rem] bg-[#e8e4fb] p-4 before:absolute before:inset-4 before:-z-0 before:rounded-[1.5rem] before:bg-[#ddd7fb] before:content-['']">
                <div className="space-y-2.5">
                  {DEMO_ROWS.map((row) => (
                    <div
                      key={row.name}
                      className="relative z-10 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-slate-700 ${row.hue}`}
                        >
                          {row.name
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-semibold text-slate-900">{row.name}</p>
                          <p className="line-clamp-1 text-xs text-slate-600">{row.role}</p>
                          <p className="mt-0.5 text-[11px] font-semibold text-emerald-700">
                            {t("landing.hero.demoRatingLine", { rating: row.rating })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_1px_0_rgba(15,23,42,0.03)] sm:p-4">
            <form
              action={modeContent.searchAction}
              method="get"
              className="grid gap-2.5 lg:grid-cols-[minmax(0,1.8fr),minmax(0,1fr),minmax(0,1fr),auto]"
            >
              <label className="flex min-h-[3.2rem] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3">
                <Search className="h-4 w-4 text-[#4f35e8]" aria-hidden />
                <input
                  name="keyword"
                  type="search"
                  placeholder={modeContent.searchPlaceholder}
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                />
              </label>
              <label className="flex min-h-[3.2rem] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3">
                <MapPin className="h-4 w-4 text-[#4f35e8]" aria-hidden />
                <input
                  name="city"
                  type="text"
                  placeholder={t("landing.hero.cityPlaceholder")}
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                />
              </label>
              <label className="flex min-h-[3.2rem] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3">
                <Grid2X2 className="h-4 w-4 text-[#4f35e8]" aria-hidden />
                <select name="categoryId" className="w-full border-0 bg-transparent text-sm text-slate-900 focus:outline-none focus:ring-0">
                  <option value="">{t("landing.hero.categoryAll")}</option>
                  <option value="design">{t("landing.hero.categoryDesign")}</option>
                  <option value="video">{t("landing.hero.categoryVideo")}</option>
                  <option value="web">{t("landing.hero.categoryWeb")}</option>
                </select>
              </label>
              <button
                type="submit"
                className="inline-flex min-h-[3.2rem] items-center justify-center rounded-lg bg-[#4f35e8] px-6 text-sm font-semibold text-white hover:bg-[#4326d9]"
              >
                {t("landing.hero.searchSubmit")}
              </button>
            </form>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500">{t("landing.hero.popularLabel")}</span>
              {popularTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700"
                >
                  {tag}
                </span>
              ))}
              <Link
                href={modeContent.searchAction}
                className="inline-flex items-center gap-1 px-1 text-[11px] font-semibold text-[#4f35e8] hover:underline"
              >
                {t("landing.hero.seeAll")}
                <Sparkles className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3.5">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f1edff] text-[#4f35e8]">
                  <Zap className="h-4 w-4" />
                </span>
                {t("landing.hero.valueFastTitle")}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{t("landing.hero.valueFastBody")}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3.5">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f1edff] text-[#4f35e8]">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                {t("landing.hero.valueSafeTitle")}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{t("landing.hero.valueSafeBody")}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3.5">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f1edff] text-[#4f35e8]">
                  <Briefcase className="h-4 w-4" />
                </span>
                {t("landing.hero.valueFlexTitle")}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{t("landing.hero.valueFlexBody")}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-[#eceaf9] p-4 sm:px-5">
            <p className="text-2xl font-bold tracking-tight text-[#071027]">{t("landing.hero.bottomStripTitle")}</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2.5">
              <p className="text-sm text-slate-600">{t("landing.hero.bottomStripBody")}</p>
              <Link
                href={modeContent.secondaryCtaHref}
                className="inline-flex items-center justify-center rounded-lg bg-[#4f35e8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4326d9]"
              >
                {modeContent.ctaBandLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
