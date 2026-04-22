import type { Route } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { popularFreelancerSearchSuggestions } from "@/features/public/lib/popular-search-suggestions";
import type { Translator } from "@/lib/i18n/create-translator";

const trendingSearchKeys: { labelKey: string; href: Route }[] = [
  { labelKey: "hero.trending.weddingPhotographer", href: "/freelancers?keyword=wedding+photographer" },
  { labelKey: "hero.trending.videoEditor", href: "/freelancers?keyword=video+editor" },
  { labelKey: "hero.trending.socialMedia", href: "/freelancers?keyword=social+media" },
  { labelKey: "hero.trending.tutorMath", href: "/freelancers?keyword=tutor+math" },
  { labelKey: "hero.trending.brandDesign", href: "/freelancers?keyword=brand+design" }
];

export function LandingHero({ t }: { t: Translator }) {
  const trustCues = [
    { icon: ShieldCheck, label: t("hero.trust.verifiedAccounts") },
    { icon: CheckCircle2, label: t("hero.trust.structuredProposals") },
    { icon: CheckCircle2, label: t("hero.trust.hiringThread") }
  ];

  return (
    <section className="nw-hero-stage">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-10">
        <div className="grid gap-7 lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t("hero.liveDirectory")}</p>
            <h1 className="mt-3 text-[2.35rem] font-bold leading-[1.02] tracking-tight text-slate-950 sm:text-5xl sm:leading-[1.03] lg:text-[3.05rem]">
              {t("hero.title")}
            </h1>
            <p className="mt-3 max-w-2xl text-lg font-medium leading-snug text-slate-800">{t("hero.subtitle")}</p>
            <p className="mt-3 flex items-start gap-2 text-sm font-medium text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#3525cd]" aria-hidden />
              <span>{t("hero.supportingLine")}</span>
            </p>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{t("hero.liveUrgencyLine")}</p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {trustCues.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
                >
                  <Icon className="h-3.5 w-3.5 text-[#3525cd]" aria-hidden />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <aside className="grid gap-3 lg:col-span-5">
            <div className="flex flex-col gap-4 border border-slate-200 bg-slate-50/90 p-4 sm:p-[1.125rem] lg:border-l-[3px] lg:border-l-[#3525cd]">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#3525cd]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {t("hero.howTitle")}
              </p>
              <ol className="space-y-2.5 text-sm font-semibold leading-snug text-slate-900">
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
              <p className="border-t border-slate-300/80 pt-3 text-[11px] font-medium leading-relaxed text-slate-600">
                {t("hero.howFootnote")}
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-8 border-y-2 border-slate-300 bg-white p-3 sm:p-4">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <p className="text-base font-bold text-slate-950">{t("hero.searchTitle")}</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{t("hero.searchSubtitle")}</p>
              <p className="mt-1 text-xs font-semibold text-slate-600">{t("hero.searchTrustLine")}</p>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[#3525cd] hover:underline"
            >
              {t("hero.quickBrowse")}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
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
            <label className="flex min-h-[3.9rem] flex-1 cursor-pointer items-center gap-3 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 shadow-[0_2px_4px_rgba(15,23,42,0.06)] transition focus-within:border-[#3525cd] focus-within:ring-2 focus-within:ring-[#3525cd]/20 lg:max-w-[13rem]">
              <span className="sr-only">{t("hero.budgetLabel")}</span>
              <select
                name="budget"
                defaultValue=""
                className="w-full border-0 bg-transparent text-left text-sm font-semibold text-slate-900 focus:outline-none focus:ring-0 sm:text-base"
              >
                <option value="">{t("hero.budgetAny")}</option>
                <option value="under-1m">{t("hero.budgetUnder1m")}</option>
                <option value="1m-5m">{t("hero.budget1to5m")}</option>
                <option value="5m-plus">{t("hero.budget5mPlus")}</option>
              </select>
            </label>
            <button type="submit" className="nw-cta-primary shrink-0 rounded-xl px-8 py-4 text-base font-bold lg:px-10">
              {t("hero.searchButton")}
            </button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="text-slate-500">{t("hero.quickFiltersLabel")}</span>
            <Link href="/search/nearby" className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:border-[#3525cd]/45 hover:text-[#3525cd]">
              {t("hero.quickFilterNearby")}
            </Link>
            <Link href="/freelancers?workMode=REMOTE" className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:border-[#3525cd]/45 hover:text-[#3525cd]">
              {t("hero.quickFilterRemote")}
            </Link>
            <Link href="/freelancers?budget=1m-5m" className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:border-[#3525cd]/45 hover:text-[#3525cd]">
              {t("hero.quickFilterBudget")}
            </Link>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1">{t("hero.searchTrustOne")}</span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1">{t("hero.searchTrustTwo")}</span>
          </div>

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

        <div className="mt-7 border-t border-slate-200 pt-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{t("hero.modeSwitchLabel")}</p>
          <input id="mode-hire" type="radio" name="landing-mode" className="peer/hire sr-only" defaultChecked />
          <input id="mode-work" type="radio" name="landing-mode" className="peer/work sr-only" />
          <div className="mt-2 inline-flex rounded-lg border border-slate-200 bg-white p-1">
            <label
              htmlFor="mode-hire"
              className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-bold text-slate-600 transition peer-checked/hire:bg-[#3525cd] peer-checked/hire:text-white"
            >
              {t("hero.modeHire")}
            </label>
            <label
              htmlFor="mode-work"
              className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-bold text-slate-600 transition peer-checked/work:bg-[#3525cd] peer-checked/work:text-white"
            >
              {t("hero.modeWork")}
            </label>
          </div>

          <div className="mt-4 hidden flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2.5 peer-checked/hire:flex peer-checked/work:hidden">
            <AuthAwareCtaLink
              href={"/client/jobs/new" as Route}
              intent="post-job"
              unauthenticatedTo="register"
              registerRoleHint="client"
              className="nw-cta-primary inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold sm:ml-0"
            >
              {t("hero.modeHirePrimary")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </AuthAwareCtaLink>
            <Link
              href="/freelancers"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-400"
            >
              {t("hero.modeHireSecondaryOne")}
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-400"
            >
              {t("hero.modeHireSecondaryTwo")}
            </Link>
          </div>

          <div className="mt-4 hidden flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2.5 peer-checked/work:flex peer-checked/hire:hidden">
            <Link
              href="/jobs"
              className="nw-cta-primary inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold sm:ml-0"
            >
              {t("hero.modeWorkPrimary")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/freelancers"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-400"
            >
              {t("hero.modeWorkSecondaryOne")}
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-400"
            >
              {t("hero.modeWorkSecondaryTwo")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
