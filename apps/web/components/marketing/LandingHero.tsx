"use client";

import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Grid2X2,
  Handshake,
  Inbox,
  MapPin,
  MessageSquare,
  Search,
  Sparkles
} from "lucide-react";
import type { LandingIntent } from "@/components/marketing/LandingPage";
import { useI18n } from "@/features/i18n/I18nProvider";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import { withWorkspaceLocale } from "@/lib/i18n/workspace-path";

type ModeContent = {
  headline: string;
  subHeadline: string;
  flowLine: string;
  primaryCtaLabel: string;
  primaryCtaHref: Route;
  secondaryCtaLabel: string;
  secondaryCtaHref: Route;
  searchAction: Route;
  searchPlaceholder: string;
  ctaBandLabel: string;
  ctaBandHref: Route;
};

const PROCESS_KEYS = ["post", "proposals", "chat", "hire"] as const;

export type LandingCategoryOption = { id: string; name: string };

export function LandingHero({
  intent,
  homePath,
  categories
}: {
  intent: LandingIntent;
  homePath: string;
  categories: LandingCategoryOption[];
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentIntent, setCurrentIntent] = useState<LandingIntent>(intent);

  const modeContent: ModeContent = useMemo(() => {
    const jobsPath = withPublicLocale(locale, "/jobs") as Route;
    const freelancersPath = withPublicLocale(locale, "/freelancers") as Route;
    const postJobPath = withWorkspaceLocale(locale, "/client/jobs/new") as Route;
    const profilePath = withWorkspaceLocale(locale, "/freelancer/profile") as Route;

    const headlineJoin = (a: string, b: string) => [a, b].filter((line) => line.trim().length > 0).join("\n");

    if (currentIntent === "hire") {
      return {
        headline: headlineJoin(t("landing.hero.hire.headlineLine1"), t("landing.hero.hire.headlineLine2")),
        subHeadline: t("landing.hero.hire.subHeadline"),
        flowLine: t("landing.hero.hire.flowLine"),
        primaryCtaLabel: t("landing.hero.hire.primaryCta"),
        primaryCtaHref: postJobPath,
        secondaryCtaLabel: t("landing.hero.hire.secondaryCta"),
        secondaryCtaHref: freelancersPath,
        searchAction: freelancersPath,
        searchPlaceholder: t("landing.hero.hire.searchPlaceholder"),
        ctaBandLabel: t("landing.hero.hire.ctaBand"),
        ctaBandHref: postJobPath
      };
    }
    if (currentIntent === "work") {
      return {
        headline: headlineJoin(t("landing.hero.work.headlineLine1"), t("landing.hero.work.headlineLine2")),
        subHeadline: t("landing.hero.work.subHeadline"),
        flowLine: t("landing.hero.work.flowLine"),
        primaryCtaLabel: t("landing.hero.work.primaryCta"),
        primaryCtaHref: jobsPath,
        secondaryCtaLabel: t("landing.hero.work.secondaryCta"),
        secondaryCtaHref: profilePath,
        searchAction: jobsPath,
        searchPlaceholder: t("landing.hero.work.searchPlaceholder"),
        ctaBandLabel: t("landing.hero.work.ctaBand"),
        ctaBandHref: jobsPath
      };
    }
    return {
      headline: headlineJoin(t("landing.hero.neutral.headlineLine1"), t("landing.hero.neutral.headlineLine2")),
      subHeadline: t("landing.hero.neutral.subHeadline"),
      flowLine: t("landing.hero.neutral.flowLine"),
      primaryCtaLabel: t("landing.hero.neutral.primaryCta"),
      primaryCtaHref: postJobPath,
      secondaryCtaLabel: t("landing.hero.neutral.secondaryCta"),
      secondaryCtaHref: jobsPath,
      searchAction: freelancersPath,
      searchPlaceholder: t("landing.hero.neutral.searchPlaceholder"),
      ctaBandLabel: t("landing.hero.neutral.ctaBand"),
      ctaBandHref: postJobPath
    };
  }, [currentIntent, locale, t]);

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

  const processIcons = [ClipboardList, Inbox, MessageSquare, Handshake];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f4f2fb] via-[#faf9fc] to-[#f0eef9]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(53,37,205,0.14),transparent)]" aria-hidden />
      <div className="relative mx-auto max-w-[1180px] px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14">
        <div className="px-1 sm:px-3">
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-8">
              <div className="flex justify-center lg:justify-start">
                <div className="inline-flex rounded-xl border border-slate-200/90 bg-white/90 p-1 shadow-sm backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => onIntentChange("hire")}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${toggleIntent === "hire" ? "bg-[#3525cd] text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"}`}
                  >
                    {t("landing.hero.intentHire")}
                  </button>
                  <button
                    type="button"
                    onClick={() => onIntentChange("work")}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${toggleIntent === "work" ? "bg-[#3525cd] text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"}`}
                  >
                    {t("landing.hero.intentWork")}
                  </button>
                </div>
              </div>

              <div className={`mt-8 text-center transition-opacity duration-200 ease-in-out lg:text-left ${isPending ? "opacity-70" : "opacity-100"}`}>
                <h1 className="mx-auto max-w-3xl whitespace-pre-line text-[2.45rem] font-bold leading-[1.06] tracking-tight text-[#071027] sm:text-[3.25rem] lg:mx-0 lg:max-w-none">
                  {modeContent.headline}
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg lg:mx-0">{modeContent.subHeadline}</p>
                <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-snug text-[#3525cd] lg:mx-0">{modeContent.flowLine}</p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <Link
                    href={modeContent.primaryCtaHref}
                    className="inline-flex min-h-11 min-w-[10rem] items-center justify-center rounded-xl bg-[#3525cd] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_40px_-16px_rgba(53,37,205,0.65)] transition hover:bg-[#2b1da8]"
                  >
                    {modeContent.primaryCtaLabel}
                  </Link>
                  <Link
                    href={modeContent.secondaryCtaHref}
                    className="inline-flex min-h-11 min-w-[10rem] items-center justify-center rounded-xl border border-slate-300/90 bg-white/90 px-6 py-2.5 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-sm transition hover:bg-white"
                  >
                    {modeContent.secondaryCtaLabel}
                  </Link>
                </div>
              </div>
            </div>

            <aside className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-24 rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_28px_90px_-48px_rgba(53,37,205,0.55)] backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3525cd]">{t("landing.hero.process.kicker")}</p>
                <p className="mt-2 text-base font-bold text-[#071027]">{t("landing.hero.process.title")}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{t("landing.hero.process.subtitle")}</p>
                <ul className="mt-5 space-y-3">
                  {PROCESS_KEYS.map((key, i) => {
                    const Icon = processIcons[i]!;
                    return (
                      <li
                        key={key}
                        className="flex gap-3 rounded-xl border border-slate-200/70 bg-gradient-to-br from-white to-[#f8f7fd] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#3525cd]/10 text-[#3525cd]">
                          <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#071027]">{t(`landing.hero.process.steps.${key}.title`)}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{t(`landing.hero.process.steps.${key}.body`)}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          </div>

          <div className="mt-8 lg:hidden">
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3525cd]">{t("landing.hero.process.kicker")}</p>
              <p className="mt-1 text-sm font-bold text-[#071027]">{t("landing.hero.process.title")}</p>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {PROCESS_KEYS.map((key, i) => {
                  const Icon = processIcons[i]!;
                  return (
                    <li key={key} className="flex gap-2.5 rounded-xl border border-slate-100 bg-[#f8f7fd]/80 px-3 py-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3525cd]/10 text-[#3525cd]">
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#071027]">{t(`landing.hero.process.steps.${key}.title`)}</p>
                        <p className="mt-0.5 text-[11px] leading-snug text-slate-600">{t(`landing.hero.process.steps.${key}.body`)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="mt-10 rounded-[1.35rem] border border-slate-200/80 bg-white/90 p-4 shadow-[0_20px_70px_-50px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-5">
            <form action={modeContent.searchAction} method="get" className="flex flex-col gap-3">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-12 lg:gap-3 lg:[&>*]:min-h-[3.15rem]">
                <label className="flex min-h-[3.15rem] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 lg:col-span-4">
                  <Search className="h-4 w-4 shrink-0 text-[#3525cd]" aria-hidden />
                  <input
                    name="keyword"
                    type="search"
                    placeholder={modeContent.searchPlaceholder}
                    className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                  />
                </label>
                <label className="flex min-h-[3.15rem] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 lg:col-span-3">
                  <MapPin className="h-4 w-4 shrink-0 text-[#3525cd]" aria-hidden />
                  <input
                    name="city"
                    type="text"
                    placeholder={t("landing.hero.cityPlaceholder")}
                    className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                  />
                </label>
                <label className="flex min-h-[3.15rem] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 lg:col-span-3">
                  <Grid2X2 className="h-4 w-4 shrink-0 text-[#3525cd]" aria-hidden />
                  <select name="categoryId" className="w-full border-0 bg-transparent text-sm text-slate-900 focus:outline-none focus:ring-0">
                    <option value="">{t("landing.hero.categoryAll")}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex min-h-[3.15rem] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 lg:col-span-2">
                  <select
                    name="workMode"
                    aria-label={t("landing.hero.workModeAria")}
                    className="w-full border-0 bg-transparent text-sm text-slate-900 focus:outline-none focus:ring-0"
                  >
                    <option value="">{t("landing.hero.workModeAny")}</option>
                    <option value="REMOTE">{t("public.filters.workModeRemote")}</option>
                    <option value="HYBRID">{t("public.filters.workModeHybrid")}</option>
                    <option value="ONSITE">{t("public.filters.workModeOnSite")}</option>
                  </select>
                </label>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  className="inline-flex min-h-[3.15rem] w-full items-center justify-center rounded-xl bg-[#3525cd] px-6 text-sm font-semibold text-white transition hover:bg-[#2b1da8] sm:w-auto sm:min-w-[9rem]"
                >
                  {t("landing.hero.searchSubmit")}
                </button>
                <p className="text-center text-[11px] text-slate-500 sm:text-left lg:max-w-xs">{t("landing.hero.searchHint")}</p>
              </div>
            </form>
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
              <span className="text-[11px] font-semibold text-slate-500">{t("landing.hero.popularLabel")}</span>
              {popularTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-slate-200/90 bg-slate-50/90 px-2 py-1 text-[11px] font-medium text-slate-700"
                >
                  {tag}
                </span>
              ))}
              <Link
                href={modeContent.searchAction}
                className="inline-flex items-center gap-1 px-1 text-[11px] font-semibold text-[#3525cd] hover:underline"
              >
                {t("landing.hero.seeAll")}
                <Sparkles className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="mt-8 rounded-[1.35rem] border border-[#3525cd]/20 bg-gradient-to-br from-[#ebe8fb] via-white to-[#f5f3fc] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
            <div>
              <p className="text-xl font-bold tracking-tight text-[#071027] sm:text-2xl">{t("landing.hero.bottomStripTitle")}</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">{t("landing.hero.bottomStripBody")}</p>
            </div>
            <Link
              href={modeContent.ctaBandHref}
              className="mt-4 inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl bg-[#3525cd] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2b1da8] sm:mt-0 sm:w-auto"
            >
              {modeContent.ctaBandLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
