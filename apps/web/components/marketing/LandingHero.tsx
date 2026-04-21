import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Search, Sparkles } from "lucide-react";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { MarketplacePulse, type MarketplacePulseStats } from "@/components/marketing/MarketplacePulse";
import { popularFreelancerSearchSuggestions } from "@/features/public/lib/popular-search-suggestions";
import type { Translator } from "@/lib/i18n/create-translator";

const trendingSearchKeys: { labelKey: string; href: Route }[] = [
  { labelKey: "hero.trending.weddingPhotographer", href: "/freelancers?keyword=wedding+photographer" },
  { labelKey: "hero.trending.videoEditor", href: "/freelancers?keyword=video+editor" },
  { labelKey: "hero.trending.socialMedia", href: "/freelancers?keyword=social+media" },
  { labelKey: "hero.trending.tutorMath", href: "/freelancers?keyword=tutor+math" },
  { labelKey: "hero.trending.brandDesign", href: "/freelancers?keyword=brand+design" }
];

export function LandingHero({ pulse, t }: { pulse: MarketplacePulseStats; t: Translator }) {
  return (
    <section className="nw-hero-stage">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-10">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:px-6 sm:py-6">
          <div className="grid gap-7 lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="flex flex-col justify-center lg:col-span-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t("hero.liveDirectory")}</p>
            <div className="mt-1.5">
              <MarketplacePulse pulse={pulse} t={t} />
            </div>
            <h1 className="mt-3 text-[2.35rem] font-bold leading-[1.02] tracking-tight text-slate-950 sm:text-5xl sm:leading-[1.03] lg:text-[3.05rem]">
              {t("hero.title")}
            </h1>
            <p className="mt-3 max-w-2xl text-lg font-medium leading-snug text-slate-800">{t("hero.subtitle")}</p>
            <p className="mt-3 flex items-start gap-2 text-sm font-medium text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#3525cd]" aria-hidden />
              <span>{t("hero.supportingLine")}</span>
            </p>
          </div>

          <aside className="flex flex-col gap-4 border border-slate-200 bg-slate-50/90 p-4 sm:p-[1.125rem] lg:col-span-4 lg:border-l-[3px] lg:border-l-[#3525cd]">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#3525cd]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {t("hero.howTitle")}
              </p>
              <ol className="mt-3.5 space-y-2.5 text-sm font-semibold leading-snug text-slate-900">
                <li className="flex items-start gap-2">
                  <span className="inline-flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-full border border-[#3525cd]/30 bg-white font-mono text-[10px] font-bold text-[#3525cd]">1</span>
                  <span>{t("hero.howStep1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-full border border-[#3525cd]/30 bg-white font-mono text-[10px] font-bold text-[#3525cd]">2</span>
                  <span>{t("hero.howStep2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-full border border-[#3525cd]/30 bg-white font-mono text-[10px] font-bold text-[#3525cd]">3</span>
                  <span>{t("hero.howStep3")}</span>
                </li>
              </ol>
            </div>
            <p className="border-t border-slate-300/80 pt-3 text-[11px] font-medium leading-relaxed text-slate-600">
              {t("hero.howFootnote")}
            </p>
          </aside>
        </div>
        </div>

        <div className="mt-6 rounded-2xl border-2 border-slate-300 bg-slate-50/60 p-3 shadow-[0_10px_22px_rgba(15,23,42,0.08)] sm:p-4">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <p className="text-base font-bold text-slate-950">{t("hero.searchTitle")}</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{t("hero.searchSubtitle")}</p>
            </div>
          </div>
          <form
            action="/freelancers"
            method="get"
            className="flex w-full flex-col gap-2.5 lg:flex-row lg:items-stretch"
          >
            <datalist id="landing-kw-suggestions">
              {popularFreelancerSearchSuggestions.map((term) => (
                <option key={term} value={term} />
              ))}
            </datalist>
            <label className="flex min-h-[3.9rem] flex-1 cursor-text items-center gap-3 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 shadow-[0_2px_4px_rgba(15,23,42,0.06)] transition focus-within:border-[#3525cd] focus-within:ring-2 focus-within:ring-[#3525cd]/20 lg:flex-[1.25]">
              <span className="sr-only">{t("hero.searchLabel")}</span>
              <Search className="h-6 w-6 shrink-0 text-[#3525cd]" aria-hidden />
              <input
                name="keyword"
                type="search"
                list="landing-kw-suggestions"
                placeholder={t("hero.keywordPlaceholder")}
                className="min-w-0 flex-1 border-0 bg-transparent text-left text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:text-lg"
                autoComplete="off"
              />
            </label>
            <label className="flex min-h-[3.9rem] flex-1 cursor-text items-center gap-3 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 shadow-[0_2px_4px_rgba(15,23,42,0.06)] transition focus-within:border-[#3525cd] focus-within:ring-2 focus-within:ring-[#3525cd]/20">
              <span className="sr-only">{t("hero.cityLabel")}</span>
              <MapPin className="h-6 w-6 shrink-0 text-[#3525cd]" aria-hidden />
              <input
                name="city"
                type="text"
                placeholder={t("hero.cityPlaceholder")}
                className="min-w-0 flex-1 border-0 bg-transparent text-left text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:text-lg"
                autoComplete="address-level2"
              />
            </label>
            <button type="submit" className="nw-cta-primary shrink-0 rounded-xl px-8 py-4 text-base font-bold lg:px-10">
              {t("hero.searchButton")}
            </button>
          </form>

          <div className="mt-4 border-t border-slate-200/90 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{t("hero.popularSearches")}</p>
            <div className="mt-2.5 flex flex-wrap gap-2 sm:gap-2.5">
              {trendingSearchKeys.map(({ labelKey, href }) => (
                <Link
                  key={labelKey}
                  href={href}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition hover:border-[#3525cd]/40 hover:text-[#3525cd]"
                >
                  {t(labelKey)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-xs font-medium text-slate-600 sm:text-left sm:text-sm">{t("hero.cityHint")}</p>

        <div className="mt-7 flex flex-col gap-2.5 border-t border-slate-200 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2.5">
          <AuthAwareCtaLink
            href={"/client/jobs/new" as Route}
            intent="post-job"
            unauthenticatedTo="register"
            registerRoleHint="client"
            className="nw-cta-primary inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold sm:ml-0"
          >
            {t("hero.postAJob")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </AuthAwareCtaLink>
          <Link
            href="/freelancers"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#3525cd] bg-white px-6 py-3 text-sm font-bold text-[#3525cd] transition hover:bg-[#3525cd]/[0.06]"
          >
            {t("hero.openDirectory")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
          >
            {t("hero.openJobBoard")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
