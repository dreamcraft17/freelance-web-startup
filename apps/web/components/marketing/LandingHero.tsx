import type { Route } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CircleDot,
  MessageCircle,
  MapPin,
  SearchCheck,
  Search,
  Sparkles,
  Users
} from "lucide-react";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { popularFreelancerSearchSuggestions } from "@/features/public/lib/popular-search-suggestions";
import type { Translator } from "@/lib/i18n/create-translator";
import type { LandingIntent } from "@/components/marketing/LandingPage";

type LandingPulse = {
  bidsLast24h: number;
  freelancersAvailable: number;
  openPublicJobs: number;
};

type HeroPanelActivity = {
  freelancerRows: Array<{
    title: string;
    specialty: string | null;
    location: string | null;
    workMode: string;
    availability: string;
  }>;
  jobRows: Array<{
    title: string;
    location: string | null;
    workMode: string;
  }>;
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

function workModeLabel(t: Translator, workMode: string): string {
  if (workMode === "ONSITE") return t("public.filters.workModeOnSite");
  if (workMode === "HYBRID") return t("public.filters.workModeHybrid");
  return t("public.filters.workModeRemote");
}

function availabilityLabel(t: Translator, availability: string): string {
  if (availability === "LIMITED") return t("public.freelancerProfile.availability.limited");
  if (availability === "UNAVAILABLE") return t("public.freelancerProfile.availability.unavailable");
  if (availability === "ON_LEAVE") return t("public.freelancerProfile.availability.on_leave");
  return t("public.freelancerProfile.availability.available");
}

export function LandingHero({
  t,
  intent,
  homePath,
  pulse,
  panelActivity
}: {
  t: Translator;
  intent: LandingIntent;
  homePath: string;
  pulse: LandingPulse;
  panelActivity: HeroPanelActivity;
}) {
  const isHireMode = intent === "hire";
  const primaryCtaHref = isHireMode ? ("/client/jobs/new" as Route) : withIntent("/jobs", intent);
  const secondaryHref = withIntent("/freelancers", intent);
  const activityLine =
    pulse.freelancersAvailable > 0
      ? t("hero.marketplaceActivityLine", {
          freelancers: pulse.freelancersAvailable
        })
      : t("hero.marketplaceActivityFallback");
  const liveRows = [
    ...panelActivity.freelancerRows.map((row) => ({
      title: row.title,
      detail: row.specialty || workModeLabel(t, row.workMode),
      context: row.location || workModeLabel(t, row.workMode),
      signal: availabilityLabel(t, row.availability)
    })),
    ...panelActivity.jobRows.map((row) => ({
      title: row.title,
      detail: t("hero.panel.liveSignalJob"),
      context: row.location || workModeLabel(t, row.workMode),
      signal: workModeLabel(t, row.workMode)
    }))
  ].slice(0, 2);
  const hasLiveRows = liveRows.length > 0;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1280px] px-4 pb-8 pt-6 sm:px-6 sm:pb-10 sm:pt-8 lg:pb-12 lg:pt-10">
        <div className="grid gap-5 lg:grid-cols-12 lg:items-start">
          <div className="flex flex-col lg:col-span-8">
            <div className="relative overflow-hidden rounded-2xl border border-[#e5e7eb] bg-[#f7f5ff] p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="mt-1.5 inline-flex rounded-lg border border-slate-200 bg-white p-1">
                    <Link
                      href={modeHref(homePath, "hire")}
                      className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${isHireMode ? "bg-[#4f35e8] text-white" : "text-slate-600 hover:bg-slate-100"}`}
                    >
                      Saya ingin rekrut
                    </Link>
                    <Link
                      href={modeHref(homePath, "work")}
                      className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${!isHireMode ? "bg-[#4f35e8] text-white" : "text-slate-600 hover:bg-slate-100"}`}
                    >
                      Saya ingin kerja
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
                      Pasang lowongan sekarang
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </AuthAwareCtaLink>
                  ) : (
                    <Link
                      href={primaryCtaHref}
                      className="nw-cta-primary inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold"
                    >
                      Cari lowongan
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  )}
                  <Link
                    href={secondaryHref}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                  >
                    Cari freelancer
                  </Link>
                </div>
              </div>

              <h1 className="relative z-10 mt-5 max-w-2xl text-[2rem] font-bold leading-[1.08] tracking-tight text-[#071027] sm:text-[2.7rem] lg:text-[3rem]">
                Temukan freelancer siap kerja dalam hitungan menit
              </h1>
              <p className="relative z-10 mt-2 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-[15px]">Cari, bandingkan, dan mulai diskusi dalam satu alur kerja - lokal atau remote.</p>
              <p className="relative z-10 mt-2 text-xs font-semibold text-slate-600 sm:text-[13px]">Proposal tetap terhubung ke setiap pekerjaan.</p>
              <p className="relative z-10 mt-3 inline-flex rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 sm:text-xs">
                {activityLine}
              </p>

              <div className="pointer-events-none absolute bottom-4 right-4 hidden min-w-[16rem] rounded-xl border border-slate-200 bg-white p-3 lg:block">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-[#4f35e8]/15" />
                  <div className="h-10 w-10 -ml-3 rounded-full bg-[#4f35e8]/25" />
                  <div className="h-10 w-10 -ml-3 rounded-full bg-[#4f35e8]/35" />
                  <span className="ml-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    Aktif sekarang
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-700">
                  <Sparkles className="mr-1 inline h-3.5 w-3.5 text-[#4f35e8]" />
                  Proyek cocok!
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[#e5e7eb] bg-white p-4 sm:p-5">
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 sm:mb-3">
                <p className="text-sm font-bold text-[#071027]">Cari freelancer</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
                    <Users className="h-3.5 w-3.5 text-[#4f35e8]" aria-hidden />
                    {pulse.freelancersAvailable} freelancer tersedia sekarang
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
                    <Briefcase className="h-3.5 w-3.5 text-[#4f35e8]" aria-hidden />
                    {pulse.openPublicJobs} lowongan terbuka hari ini
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
                <label className="flex min-h-[3.6rem] flex-1 cursor-text items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 transition focus-within:border-[#4f35e8] focus-within:ring-2 focus-within:ring-[#4f35e8]/20 lg:flex-[1.3]">
                  <span className="sr-only">{t("hero.searchLabel")}</span>
                  <Search className="h-5 w-5 shrink-0 text-[#4f35e8]" aria-hidden />
                  <input
                    name="keyword"
                    type="search"
                    list="landing-kw-suggestions"
                    placeholder="Contoh: fotografer event"
                    className="min-w-0 flex-1 border-0 bg-transparent text-left text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                    autoComplete="off"
                  />
                </label>
                <label className="flex min-h-[3.6rem] flex-1 cursor-text items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 transition focus-within:border-[#4f35e8] focus-within:ring-2 focus-within:ring-[#4f35e8]/20">
                  <span className="sr-only">{t("hero.cityLabel")}</span>
                  <MapPin className="h-5 w-5 shrink-0 text-[#4f35e8]" aria-hidden />
                  <input
                    name="city"
                    type="text"
                    placeholder="Kota (opsional)"
                    className="min-w-0 flex-1 border-0 bg-transparent text-left text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                    autoComplete="address-level2"
                  />
                </label>
                <button type="submit" className="nw-cta-primary shrink-0 rounded-xl bg-[#4f35e8] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#4326d9] sm:text-base">
                  Cari
                </button>
              </form>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-slate-600">
                <div className="flex flex-wrap items-center gap-2">
                <Link href={withIntent("/search/nearby", intent)} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 hover:border-[#4f35e8]/45 hover:text-[#4f35e8]">
                  Nearby
                </Link>
                <Link href={withIntent("/freelancers?workMode=REMOTE", intent)} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 hover:border-[#4f35e8]/45 hover:text-[#4f35e8]">
                  Remote
                </Link>
                <Link href={withIntent("/jobs?minBudget=1000000", intent)} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 hover:border-[#4f35e8]/45 hover:text-[#4f35e8]">
                  Sesuai budget
                </Link>
                </div>
                <Link href={withIntent("/freelancers", intent)} className="inline-flex items-center gap-1 text-slate-600 hover:text-[#4f35e8]">
                  <SearchCheck className="h-3.5 w-3.5" />
                  Filter lanjutan
                </Link>
              </div>
            </div>
          </div>
          <aside className="space-y-4 lg:col-span-4">
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
              <p className="text-sm font-bold text-[#071027]">Marketplace aktif</p>
              <ul className="mt-3 space-y-2 text-sm font-medium text-slate-700">
                <li className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                  <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-[#4f35e8]" />Freelancer aktif sekarang</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </li>
                <li className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                  <span className="inline-flex items-center gap-2"><Briefcase className="h-4 w-4 text-[#4f35e8]" />Brief baru masuk setiap hari</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </li>
                <li className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                  <span className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4 text-[#4f35e8]" />Proposal tetap terhubung ke pekerjaan</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
              <p className="text-sm font-bold text-[#071027]">Aktivitas live</p>
              {hasLiveRows ? (
                <div className="mt-2 space-y-2">
                  {liveRows.map((row) => (
                    <div key={`${row.title}-${row.context}-${row.signal}`} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="line-clamp-1 font-semibold text-slate-900">{row.title}</p>
                          <p className="line-clamp-1 text-xs font-medium text-slate-600">
                            {row.detail} · {row.context}
                          </p>
                        </div>
                        <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CircleDot className="h-3 w-3 fill-current" />
                          Tersedia
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm font-medium text-slate-700">{t("hero.panel.noLiveData")}</p>
              )}
            </div>

            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
              <p className="text-sm font-bold text-[#071027]">Pola kerja yang paling sering dipakai</p>
              <p className="mt-1 text-xs text-slate-500">Pilih mode kerja yang paling sesuai kebutuhan Anda.</p>
              <ul className="mt-3 space-y-2">
                <li className="rounded-lg border border-slate-200 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-900">On-site</p>
                  <p className="text-xs text-slate-500">Pilih nearby untuk kerja lokal di kota Anda.</p>
                </li>
                <li className="rounded-lg border border-slate-200 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-900">Remote</p>
                  <p className="text-xs text-slate-500">Kerja dari mana saja dengan fleksibilitas penuh.</p>
                </li>
                <li className="rounded-lg border border-slate-200 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-900">Hybrid</p>
                  <p className="text-xs text-slate-500">Kombinasi sesi online dan pertemuan offline.</p>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
