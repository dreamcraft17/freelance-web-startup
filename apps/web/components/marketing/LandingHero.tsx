import type { Route } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  MapPin,
  Search,
  Users
} from "lucide-react";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { popularFreelancerSearchSuggestions } from "@/features/public/lib/popular-search-suggestions";
import type { Translator } from "@/lib/i18n/create-translator";
import type { LandingIntent } from "@/components/marketing/LandingPage";
import { HeroScenarioSlider } from "@/components/marketing/HeroScenarioSlider";

type LandingPulse = {
  bidsLast24h: number;
  freelancersAvailable: number;
  openPublicJobs: number;
};

function withIntent(href: string, intent: LandingIntent): Route {
  const [pathname, query = ""] = href.split("?");
  const params = new URLSearchParams(query);
  params.set("intent", intent);
  return `${pathname}?${params.toString()}` as Route;
}

function modeHref(homePath: string, intent: LandingIntent): Route {
  return `${homePath}?intent=${intent}` as Route;
}

export function LandingHero({
  t,
  intent,
  homePath,
  pulse
}: {
  t: Translator;
  intent: LandingIntent;
  homePath: string;
  pulse: LandingPulse;
}) {
  const isHireMode = intent === "hire";
  const primaryCtaLabel = isHireMode ? t("hero.modeHirePrimary") : t("hero.modeWorkPrimary");
  const primaryCtaHref = isHireMode ? ("/client/jobs/new" as Route) : withIntent("/jobs", intent);
  const secondaryLabel = isHireMode ? t("hero.modeHireSecondaryOne") : t("hero.modeWorkSecondaryOne");
  const secondaryHref = withIntent("/freelancers", intent);
  const activityLine =
    pulse.freelancersAvailable > 0
      ? t("hero.marketplaceActivityLine", {
          freelancers: pulse.freelancersAvailable
        })
      : t("hero.marketplaceActivityFallback");
  const heroSlides = [
    {
      imageSrc: "/hero-scenes/event-photographer.svg",
      overlay: t("hero.slides.event")
    },
    {
      imageSrc: "/hero-scenes/remote-video-editor.svg",
      overlay: t("hero.slides.video")
    },
    {
      imageSrc: "/hero-scenes/tutor-session.svg",
      overlay: t("hero.slides.tutor")
    },
    {
      imageSrc: "/hero-scenes/design-branding.svg",
      overlay: t("hero.slides.design")
    },
    {
      imageSrc: "/hero-scenes/client-reviewing-proposals.svg",
      overlay: t("hero.slides.proposals")
    }
  ];

  return (
    <section className="nw-hero-stage">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10">
        <div className="grid gap-5 lg:grid-cols-12 lg:items-stretch">
          <div className="flex flex-col lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    {t("hero.modeSwitchLabel")}
                  </p>
                  <div className="mt-1.5 inline-flex rounded-lg border border-slate-200 bg-white p-1">
                    <Link
                      href={modeHref(homePath, "hire")}
                      className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${isHireMode ? "bg-[#3525cd] text-white" : "text-slate-600 hover:bg-slate-100"}`}
                    >
                      {t("hero.modeHire")}
                    </Link>
                    <Link
                      href={modeHref(homePath, "work")}
                      className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${!isHireMode ? "bg-[#3525cd] text-white" : "text-slate-600 hover:bg-slate-100"}`}
                    >
                      {t("hero.modeWork")}
                    </Link>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {isHireMode ? (
                    <AuthAwareCtaLink
                      href={primaryCtaHref}
                      intent="post-job"
                      unauthenticatedTo="register"
                      registerRoleHint="client"
                      className="nw-cta-primary inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold"
                    >
                      {primaryCtaLabel}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </AuthAwareCtaLink>
                  ) : (
                    <Link
                      href={primaryCtaHref}
                      className="nw-cta-primary inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold"
                    >
                      {primaryCtaLabel}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  )}
                  <Link
                    href={secondaryHref}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                  >
                    {secondaryLabel}
                  </Link>
                </div>
              </div>

              <h1 className="mt-5 text-[2rem] font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
                {t("hero.title")}
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-700 sm:text-base">{t("hero.outcomeLine")}</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">{t("hero.searchTrustLine")}</p>
              <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                {activityLine}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">{t("hero.searchTitle")}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
                    <Users className="h-3.5 w-3.5 text-[#3525cd]" aria-hidden />
                    {t("hero.liveFreelancersNow", { count: pulse.freelancersAvailable })}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
                    <Briefcase className="h-3.5 w-3.5 text-[#3525cd]" aria-hidden />
                    {t("hero.liveJobsToday", { count: pulse.openPublicJobs })}
                  </span>
                </div>
              </div>
              <form action="/freelancers" method="get" className="flex w-full flex-col gap-2.5 lg:flex-row lg:items-stretch">
                <input type="hidden" name="intent" value={intent} />
                <datalist id="landing-kw-suggestions">
                  {popularFreelancerSearchSuggestions.map((term) => (
                    <option key={term} value={term} />
                  ))}
                </datalist>
                <label className="flex min-h-[3.8rem] flex-1 cursor-text items-center gap-3 rounded-lg border-2 border-slate-300 bg-white px-4 py-3 transition focus-within:border-[#3525cd] focus-within:ring-2 focus-within:ring-[#3525cd]/20 lg:flex-[1.3]">
                  <span className="sr-only">{t("hero.searchLabel")}</span>
                  <Search className="h-5 w-5 shrink-0 text-[#3525cd]" aria-hidden />
                  <input
                    name="keyword"
                    type="search"
                    list="landing-kw-suggestions"
                    placeholder={t("hero.keywordPlaceholder")}
                    className="min-w-0 flex-1 border-0 bg-transparent text-left text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                    autoComplete="off"
                  />
                </label>
                <label className="flex min-h-[3.8rem] flex-1 cursor-text items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 transition focus-within:border-[#3525cd] focus-within:ring-2 focus-within:ring-[#3525cd]/20">
                  <span className="sr-only">{t("hero.cityLabel")}</span>
                  <MapPin className="h-5 w-5 shrink-0 text-[#3525cd]" aria-hidden />
                  <input
                    name="city"
                    type="text"
                    placeholder={t("hero.cityPlaceholder")}
                    className="min-w-0 flex-1 border-0 bg-transparent text-left text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                    autoComplete="address-level2"
                  />
                </label>
                <button type="submit" className="nw-cta-primary shrink-0 rounded-lg px-7 py-3.5 text-sm font-bold sm:text-base">
                  {t("hero.searchButton")}
                </button>
              </form>
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
                <Link href={withIntent("/search/nearby", intent)} className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 hover:border-[#3525cd]/45 hover:text-[#3525cd]">
                  {t("hero.quickFilterNearby")}
                </Link>
                <Link href={withIntent("/freelancers?workMode=REMOTE", intent)} className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 hover:border-[#3525cd]/45 hover:text-[#3525cd]">
                  {t("hero.quickFilterRemote")}
                </Link>
                <Link href={withIntent("/jobs?minBudget=1000000", intent)} className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 hover:border-[#3525cd]/45 hover:text-[#3525cd]">
                  {t("hero.quickFilterBudget")}
                </Link>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5">
            <HeroScenarioSlider slides={heroSlides} ariaLabel={t("hero.sliderAriaLabel")} />
          </div>
        </div>
      </div>
    </section>
  );
}
