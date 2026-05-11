import type { Route } from "next";
import Link from "next/link";
import { searchJobsSchema } from "@acme/validators";
import { UserRole } from "@acme/types";
import { db } from "@acme/database";
import { ArrowRight, CheckCircle2, ChevronRight, Search, Sparkles, TrendingUp } from "lucide-react";
import { getSessionFromCookies } from "@src/lib/auth";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { JobsMarketplaceMobileFilters } from "@/features/public/components/JobsMarketplaceMobileFilters";
import { JobsPublicEmpty } from "@/features/public/components/JobsPublicEmpty";
import { JobsPublicList, type JobsPublicCard } from "@/features/public/components/JobsPublicList";
import { jobsBrowseQueryString } from "@/features/public/lib/jobs-browse-query";
import { formatMoneyAmount } from "@/lib/format-money";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import { getServerTranslator } from "@/lib/i18n/server-translator";
import type { AppLocale } from "@/lib/i18n/types";
import { withWorkspaceLocale } from "@/lib/i18n/workspace-path";
import { cn } from "@/lib/utils";
import { CategoryService } from "@/server/services/category.service";
import { JobService } from "@/server/services/job.service";
import { PublicStatsService } from "@/server/services/public-stats.service";
import type { OpenJobListItem } from "@/server/services/job.service";

export const revalidate = 60;

type SearchParams = Record<string, string | string[] | undefined>;

function pick(sp: SearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (v === undefined) continue;
    out[k] = Array.isArray(v) ? (v[0] ?? "") : v;
  }
  return out;
}

function toPublicJobCard(
  job: OpenJobListItem,
  categoryName: string | null
): JobsPublicCard {
  const min = job.budgetMin != null ? Number(job.budgetMin) : null;
  const max = job.budgetMax != null ? Number(job.budgetMax) : null;
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    translationSource: job.translationSource,
    isTranslated: job.isTranslated,
    categoryName,
    budgetMin: Number.isFinite(min) ? min : null,
    budgetMax: Number.isFinite(max) ? max : null,
    currency: job.currency,
    budgetType: job.budgetType,
    workMode: job.workMode,
    city: job.city,
    createdAt: job.createdAt,
    isFeaturedActive: job.isFeaturedActive,
    clientDisplayName: job.clientDisplayName,
    clientVerified: job.clientVerified,
    bidCount: job.bidCount,
    skillNames: job.skillNames
  };
}

async function loadSavedJobIds(userId: string, jobIds: string[]): Promise<string[]> {
  if (jobIds.length === 0) return [];
  const rows = await db.savedJob.findMany({
    where: { userId, jobId: { in: jobIds } },
    select: { jobId: true }
  });
  return rows.map((r) => r.jobId);
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase() || "?";
}

function formatBudgetShort(job: JobsPublicCard, appLocale: AppLocale): string {
  const min = job.budgetMin;
  const max = job.budgetMax;
  const { currency } = job;
  if (min != null && max != null && Number.isFinite(min) && Number.isFinite(max)) {
    return `${formatMoneyAmount(min, currency, { locale: appLocale, maximumFractionDigits: 0, compact: appLocale === "id" })}–${formatMoneyAmount(max, currency, { locale: appLocale, maximumFractionDigits: 0, compact: appLocale === "id" })}`;
  }
  return "—";
}

function relativeTime(input: string, locale: AppLocale): string {
  const date = new Date(input);
  const diff = Date.now() - date.getTime();
  if (!Number.isFinite(diff) || diff < 0) return "";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return locale === "id" ? `${Math.max(1, mins)} menit lalu` : `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return locale === "id" ? `${hours} jam lalu` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return locale === "id" ? `${days} hari lalu` : `${days}d ago`;
}

async function loadCategories(): Promise<{ id: string; name: string }[]> {
  try {
    const catRes = await new CategoryService().list({ page: 1, limit: 100 });
    if (catRes.mode !== "categories") return [];
    return catRes.items.map((c) => ({ id: c.id, name: c.name }));
  } catch {
    return [];
  }
}

export default async function JobsBrowsePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = pick(await searchParams);
  const parsed = searchJobsSchema.safeParse({
    page: raw.page ?? 1,
    limit: 24,
    keyword: raw.keyword,
    city: raw.city,
    workMode: raw.workMode === "" ? undefined : raw.workMode,
    categoryId: raw.categoryId,
    minBudget: raw.minBudget,
    postedWithinDays: raw.postedWithinDays
  });
  const query = parsed.success ? parsed.data : { page: 1, limit: 24 as const };

  const jobService = new JobService();
  const statsSvc = new PublicStatsService();
  const { t, locale } = await getServerTranslator();
  const jobsBase = withPublicLocale(locale, "/jobs");
  const postJobHref = withWorkspaceLocale(locale, "/client/jobs/new");
  const notificationsHref = withPublicLocale(locale, "/notifications");
  const freelancerProfileHref = withPublicLocale(locale, "/freelancer/profile");
  const [{ items, total }, categories, { pulse, heroPanelActivity }, session] = await Promise.all([
    jobService.listOpenJobs(query, locale),
    loadCategories(),
    statsSvc.getPulseAndHeroForPublicBrowse(),
    getSessionFromCookies()
  ]);
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const jobs = items.map((job) => toPublicJobCard(job, categoryMap.get(job.categoryId) ?? null));

  const savedJobIds =
    session && items.length > 0 ? await loadSavedJobIds(session.userId, items.map((j) => j.id)) : [];

  const keyword = query.keyword ?? "";
  const city = query.city ?? "";
  const workMode = (query.workMode ?? "") as "" | "REMOTE" | "ONSITE" | "HYBRID";
  const categoryId = query.categoryId ?? "";
  const page = query.page;
  const minBudget = query.minBudget != null ? String(query.minBudget) : "";
  const postedWithinDays = query.postedWithinDays != null ? String(query.postedWithinDays) : "";
  const totalPages = Math.max(1, Math.ceil(total / query.limit));

  const qArgs = { keyword, city, workMode, categoryId, minBudget, postedWithinDays, page: 1 };
  const hasFilters =
    Boolean(keyword.trim()) ||
    Boolean(city.trim()) ||
    Boolean(workMode) ||
    Boolean(categoryId.trim()) ||
    Boolean(minBudget) ||
    Boolean(postedWithinDays);
  const categorySelected = Boolean(categoryId.trim());
  const noJobsBaseline = jobs.length === 0 && !hasFilters && !categorySelected;
  const quickTags = [
    { label: t("public.jobs.quickTagDesign"), href: jobsBrowseQueryString({ ...qArgs, keyword: "desain" }) },
    { label: t("public.jobs.quickTagVideo"), href: jobsBrowseQueryString({ ...qArgs, keyword: "video" }) },
    { label: t("public.jobs.quickTagRemote"), href: jobsBrowseQueryString({ ...qArgs, city: "", workMode: "REMOTE" }) },
    { label: t("public.jobs.quickTagPartTime"), href: jobsBrowseQueryString({ ...qArgs, keyword: "part time" }) },
    { label: t("public.jobs.quickTagFullTime"), href: jobsBrowseQueryString({ ...qArgs, keyword: "full time" }) }
  ];
  const workModeChipClass = (active: boolean) =>
    cn(
      "nw-chip min-h-9 px-2.5 py-1 text-[11px] transition-colors duration-150",
      active ? "border-transparent bg-[#3525cd] text-white shadow-sm" : "text-slate-700 hover:border-slate-300"
    );

  const workModeT = (wm: string) =>
    wm === "REMOTE"
      ? t("public.filters.workModeRemote")
      : wm === "ONSITE"
        ? t("public.filters.workModeOnSite")
        : wm === "HYBRID"
          ? t("public.filters.workModeHybrid")
          : wm;
  const topDemandCategories = Array.from(
    jobs.reduce<Map<string, { label: string; count: number }>>((map, job) => {
      if (!job.categoryName) return map;
      const key = job.categoryName.trim();
      if (!key) return map;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        return map;
      }
      map.set(key, { label: key, count: 1 });
      return map;
    }, new Map())
  )
    .map(([, value]) => value)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const viewerRole =
    session?.role === UserRole.CLIENT
      ? "CLIENT"
      : session?.role === UserRole.FREELANCER
        ? "FREELANCER"
        : null;

  const filterBase = {
    keyword,
    city,
    workMode,
    categoryId,
    minBudget,
    postedWithinDays,
    page
  };

  const featuredJob = jobs[0] ?? null;
  const heroFreelancer = heroPanelActivity.freelancerRows[0];

  const trendingChips: { label: string; href: string; count?: number }[] =
    topDemandCategories.length > 0
      ? topDemandCategories.map((row) => ({
          label: row.label,
          href: jobsBrowseQueryString({ ...qArgs, keyword: row.label }),
          count: row.count
        }))
      : categories.slice(0, 8).map((c) => ({ label: c.name, href: jobsBrowseQueryString({ ...qArgs, categoryId: c.id }) }));

  return (
    <div className="min-h-screen bg-slate-100">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1360px] px-3 pb-5 pt-6 sm:px-5 sm:pb-7 sm:pt-8 md:px-8">
          <div className="lg:grid lg:grid-cols-[minmax(0,1.12fr),minmax(280px,400px)] lg:items-start lg:gap-10 xl:gap-12">
            <div className="max-w-2xl lg:max-w-none">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{t("public.jobs.sectionTitle")}</p>
              <h1 className="mt-2 text-balance text-3xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-4xl md:text-[2.65rem]">
                <span className="text-slate-900">{t("public.jobs.heroHeadlineBefore")}</span>{" "}
                <span className="text-[#3525cd]">{t("public.jobs.heroHeadlineAccent")}</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-[15px]">{t("public.jobs.boardDescription")}</p>

              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href={`${jobsBase}#nw-jobs-list` as Route}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2b1daa]"
                >
                  {t("public.jobs.heroCtaFindWork")}
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
                <AuthAwareCtaLink
                  href={postJobHref as Route}
                  intent="post-job"
                  unauthenticatedTo="register"
                  registerRoleHint="client"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                >
                  {t("public.jobs.heroCtaPostJob")}
                </AuthAwareCtaLink>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-y border-slate-200 py-3.5 text-[11px] font-semibold tabular-nums text-slate-800 sm:text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#3525cd]" aria-hidden />
                  {t("public.jobs.heroStatOpen", { count: pulse.openPublicJobs })}
                </span>
                <span className="text-slate-300" aria-hidden>
                  ·
                </span>
                <span>{t("public.jobs.heroStatBids24h", { count: pulse.bidsLast24h })}</span>
                <span className="text-slate-300" aria-hidden>
                  ·
                </span>
                <span>{t("public.jobs.heroStatFreelancers", { count: pulse.freelancersAvailable })}</span>
              </div>

              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-slate-600 sm:text-xs">
                <li className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                  {t("public.jobs.trustFree")}
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                  {t("public.jobs.trustClients")}
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                  {t("public.jobs.trustPayments")}
                </li>
              </ul>

              {trendingChips.length > 0 ? (
                <div className="mt-5">
                  <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <TrendingUp className="h-3.5 w-3.5 text-[#3525cd]" aria-hidden />
                    {topDemandCategories.length > 0 ? t("public.jobs.heroTrendingLabel") : t("public.jobs.heroBrowseCategories")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {trendingChips.map((chip) => (
                      <Link
                        key={chip.href}
                        href={`${jobsBase}${chip.href}` as Route}
                        className="nw-chip-quiet"
                      >
                        {chip.label}
                        {chip.count != null ? (
                          <span className="ml-1 tabular-nums text-slate-500">({chip.count})</span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-md lg:mt-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{t("public.jobs.heroPulseKicker")}</p>
              <p className="mt-1 text-xs font-semibold text-slate-900">{t("public.jobs.heroSnapshotTitle")}</p>

              {featuredJob ? (
                <Link
                  href={`${jobsBase}/${featuredJob.id}` as Route}
                  className="mt-3 block rounded-xl border border-slate-200 bg-white p-3 transition hover:border-[#3525cd]/40"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#3525cd]">{t("public.jobs.heroFeaturedLabel")}</p>
                  <div className="mt-2 flex gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-[11px] font-bold text-slate-800"
                      aria-hidden
                    >
                      {initialsFromName(featuredJob.clientDisplayName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">{featuredJob.title}</p>
                      <p className="mt-0.5 truncate text-xs font-medium text-slate-600">{featuredJob.clientDisplayName}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {formatBudgetShort(featuredJob, locale)}
                        <span className="mx-1.5 text-slate-300">·</span>
                        {featuredJob.bidCount > 0
                          ? t("public.jobs.heroFeaturedProposals", { count: featuredJob.bidCount })
                          : t("public.jobs.heroFeaturedProposalsZero")}
                        <span className="mx-1.5 text-slate-300">·</span>
                        {relativeTime(featuredJob.createdAt, locale)}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  </div>
                </Link>
              ) : null}

              <div className="mt-3 space-y-0 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                {heroPanelActivity.proposalRows.slice(0, 2).map((row) => (
                  <div key={`${row.freelancerName}-${row.createdAt}`} className="flex gap-2.5 px-3 py-2.5 first:rounded-t-xl last:rounded-b-xl sm:px-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ede9fe] text-[10px] font-bold text-[#3525cd]"
                      aria-hidden
                    >
                      {initialsFromName(row.freelancerName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-800">{t("public.jobs.liveProposalLine", { name: row.freelancerName })}</p>
                      <p className="truncate text-[11px] text-slate-500">{row.jobTitle}</p>
                      <p className="text-[10px] font-medium text-slate-400">{relativeTime(row.createdAt, locale)}</p>
                    </div>
                  </div>
                ))}
                {heroPanelActivity.jobRows.slice(0, featuredJob ? 1 : 2).map((job) => (
                  <div key={`${job.title}-${job.createdAt}`} className="px-3 py-2.5">
                    <p className="text-xs font-semibold leading-snug text-slate-900 line-clamp-2">{job.title}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {t("public.jobs.pulseJobMeta", {
                        time: relativeTime(job.createdAt, locale),
                        place: job.location ?? t("public.jobs.noCity")
                      })}
                    </p>
                  </div>
                ))}
                {heroFreelancer ? (
                  <div className="flex gap-2.5 px-3 py-2.5">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-[10px] font-bold text-slate-800"
                      aria-hidden
                    >
                      {initialsFromName(heroFreelancer.title)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900">{heroFreelancer.title}</p>
                      {heroFreelancer.specialty ? (
                        <p className="truncate text-[11px] text-slate-600">{heroFreelancer.specialty}</p>
                      ) : null}
                      <p className="text-[10px] text-slate-500">
                        {[heroFreelancer.location, workModeT(heroFreelancer.workMode)].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mx-auto mt-6 max-w-[1200px] lg:mt-7">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm sm:p-4">
              <form method="get" action={jobsBase} className="grid gap-2 sm:gap-3 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr),minmax(0,1fr),auto] lg:items-end">
                <div className="relative">
                  <label className="sr-only" htmlFor="nw-jobs-q">
                    {t("public.jobs.searchKeywordPlaceholder")}
                  </label>
                  <Search
                    className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                    aria-hidden
                  />
                  <input
                    id="nw-jobs-q"
                    name="keyword"
                    defaultValue={keyword}
                    placeholder={t("public.jobs.searchKeywordPlaceholder")}
                    autoComplete="off"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd]/30"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    {t("public.filters.location")}
                  </label>
                  <input
                    name="city"
                    defaultValue={city}
                    placeholder={t("public.jobs.searchLocationPlaceholder")}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd]/30"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    {t("public.filters.category")}
                  </label>
                  <select
                    name="categoryId"
                    defaultValue={categoryId}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd]/30"
                  >
                    <option value="">{t("public.filters.allCategories")}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#3525cd] px-5 text-sm font-semibold text-white transition hover:bg-[#2b1daa]"
                >
                  {t("public.jobs.searchAction")}
                </button>
              </form>
              <p className="mt-2 text-[11px] text-slate-500">{t("public.jobs.searchExamplesHint")}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t("public.jobs.quickSearchLabel")}</span>
                {quickTags.map((tag) => (
                  <Link
                    key={tag.label}
                    href={`${jobsBase}${tag.href}` as Route}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:border-slate-300 hover:bg-white"
                  >
                    {tag.label}
                  </Link>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Link
                  href={`${jobsBase}${jobsBrowseQueryString({ ...qArgs, workMode: "" })}` as Route}
                  className={workModeChipClass(workMode === "")}
                >
                  {t("public.filters.workModeAny")}
                </Link>
                <Link
                  href={`${jobsBase}${jobsBrowseQueryString({ ...qArgs, workMode: "REMOTE" })}` as Route}
                  className={workModeChipClass(workMode === "REMOTE")}
                >
                  {t("public.filters.workModeRemote")}
                </Link>
                <Link
                  href={`${jobsBase}${jobsBrowseQueryString({ ...qArgs, workMode: "ONSITE" })}` as Route}
                  className={workModeChipClass(workMode === "ONSITE")}
                >
                  {t("public.filters.workModeOnSite")}
                </Link>
                <Link
                  href={`${jobsBase}${jobsBrowseQueryString({ ...qArgs, workMode: "HYBRID" })}` as Route}
                  className={workModeChipClass(workMode === "HYBRID")}
                >
                  {t("public.filters.workModeHybrid")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-3 pb-12 pt-5 sm:px-5 md:px-6 md:pb-16">
        <div className="lg:grid lg:grid-cols-[minmax(260px,300px),minmax(0,1fr),minmax(260px,300px)] lg:items-start lg:gap-7">
          <aside className="mb-4 hidden lg:sticky lg:top-24 lg:mb-0 lg:block">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md ring-1 ring-slate-900/[0.03]">
              <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("public.filters.title")}</h2>
                <Link href={jobsBase as Route} className="text-xs font-bold text-[#3525cd] hover:underline">
                  {t("public.filters.reset")}
                </Link>
              </div>
              <details open className="group pt-1 first:border-t-0 first:pt-0">
                <summary className="cursor-pointer list-none text-sm font-bold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
                  {t("public.filters.category")}
                </summary>
                <div className="mt-2.5 space-y-0.5 text-sm">
                  <Link
                    href={`${jobsBase}${jobsBrowseQueryString({ ...filterBase, categoryId: "", page: 1 })}` as Route}
                    className={`block rounded-lg px-2.5 py-2 ${categoryId === "" ? "bg-slate-900 text-white shadow-sm" : "text-slate-700 hover:bg-slate-50"}`}
                  >
                    {t("public.filters.allCategories")}
                  </Link>
                  {categories.slice(0, 12).map((c) => (
                    <Link
                      key={c.id}
                      href={`${jobsBase}${jobsBrowseQueryString({ ...filterBase, categoryId: c.id, page: 1 })}` as Route}
                      className={`block rounded-lg px-2.5 py-2 ${categoryId === c.id ? "bg-[#3525cd] font-semibold text-white shadow-sm" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </details>
              <details open className="group border-t border-slate-100 pt-4">
                <summary className="cursor-pointer list-none text-sm font-bold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
                  {t("public.jobs.budgetFilterLabel")}
                </summary>
                <div className="mt-2.5 space-y-0.5 text-sm">
                  {[
                    { value: "500000", label: t("public.jobs.budgetFilter500k") },
                    { value: "1000000", label: t("public.jobs.budgetFilter1m") },
                    { value: "3000000", label: t("public.jobs.budgetFilter3m") }
                  ].map((item) => (
                    <Link
                      key={item.value}
                      href={`${jobsBase}${jobsBrowseQueryString({ ...filterBase, minBudget: item.value, page: 1 })}` as Route}
                      className={`block rounded-lg px-2.5 py-2 ${minBudget === item.value ? "bg-[#3525cd] font-semibold text-white shadow-sm" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
              <details open className="group border-t border-slate-100 pt-4">
                <summary className="cursor-pointer list-none text-sm font-bold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
                  {t("public.jobs.postedFilterLabel")}
                </summary>
                <div className="mt-2.5 space-y-0.5 text-sm">
                  {[
                    { value: "1", label: t("public.jobs.postedFilter24h") },
                    { value: "7", label: t("public.jobs.postedFilter7d") },
                    { value: "30", label: t("public.jobs.postedFilter30d") }
                  ].map((item) => (
                    <Link
                      key={item.value}
                      href={`${jobsBase}${jobsBrowseQueryString({ ...filterBase, postedWithinDays: item.value, page: 1 })}` as Route}
                      className={`block rounded-lg px-2.5 py-2 ${postedWithinDays === item.value ? "bg-[#3525cd] font-semibold text-white shadow-sm" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
              <details open className="group border-t border-slate-100 pt-4">
                <summary className="cursor-pointer list-none text-sm font-bold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
                  {t("public.jobs.workTypeFilterLabel")}
                </summary>
                <div className="mt-2.5 space-y-0.5 text-sm">
                  <Link
                    href={`${jobsBase}${jobsBrowseQueryString({ ...filterBase, workMode: "REMOTE", page: 1 })}` as Route}
                    className={`block rounded-lg px-2.5 py-2 ${workMode === "REMOTE" ? "bg-[#3525cd] font-semibold text-white shadow-sm" : "text-slate-700 hover:bg-slate-50"}`}
                  >
                    {t("public.filters.workModeRemote")}
                  </Link>
                  <Link
                    href={`${jobsBase}${jobsBrowseQueryString({ ...filterBase, workMode: "ONSITE", page: 1 })}` as Route}
                    className={`block rounded-lg px-2.5 py-2 ${workMode === "ONSITE" ? "bg-[#3525cd] font-semibold text-white shadow-sm" : "text-slate-700 hover:bg-slate-50"}`}
                  >
                    {t("public.filters.workModeOnSite")}
                  </Link>
                  <Link
                    href={`${jobsBase}${jobsBrowseQueryString({ ...filterBase, workMode: "HYBRID", page: 1 })}` as Route}
                    className={`block rounded-lg px-2.5 py-2 ${workMode === "HYBRID" ? "bg-[#3525cd] font-semibold text-white shadow-sm" : "text-slate-700 hover:bg-slate-50"}`}
                  >
                    {t("public.filters.workModeHybrid")}
                  </Link>
                </div>
              </details>
            </div>
          </aside>

          <div id="nw-jobs-list" className="order-1 min-w-0 scroll-mt-28 space-y-4 lg:order-2">
            <div className="lg:hidden">
              <JobsMarketplaceMobileFilters
                keyword={keyword}
                city={city}
                workMode={workMode}
                categoryId={categoryId}
                minBudget={minBudget}
                postedWithinDays={postedWithinDays}
                categories={categories}
              />
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-2.5">
              <div>
                <p className="text-base font-bold text-slate-950">
                  {total === 1 ? t("public.jobs.resultOne") : t("public.jobs.resultMany", { count: total })}
                </p>
                <p className="text-xs font-medium text-slate-600">{t("public.jobs.resultHint")}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="hidden font-semibold text-slate-500 sm:inline">{t("public.jobs.sortLabel")}</span>
                <select
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-800"
                  aria-label={t("public.jobs.sortLabel")}
                  disabled
                >
                  <option>{t("public.jobs.sortRelevant")}</option>
                </select>
              </div>
            </div>

            {total > 0 ? <JobsPublicList jobs={jobs} savedJobIds={savedJobIds} /> : null}

            {jobs.length === 0 ? (
              <JobsPublicEmpty categorySelected={categorySelected} hasFilters={hasFilters} viewerRole={viewerRole} />
            ) : null}

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {topDemandCategories.length > 0 ? t("public.jobs.demandTrendTitle") : t("public.jobs.demandProcessTitle")}
                </h2>
                {topDemandCategories.length > 0 ? (
                  <Link href={jobsBase as Route} className="text-xs font-bold text-[#3525cd] hover:underline">
                    {t("public.jobs.viewAllSmall")}
                  </Link>
                ) : null}
              </div>
              {topDemandCategories.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-3">
                  {topDemandCategories.map((item) => (
                    <div key={item.label} className="border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-xs font-bold text-slate-900">{item.label}</p>
                      <p className="mt-0.5 text-[11px] font-medium text-slate-600">{t("public.jobs.demandCount", { count: item.count })}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 text-sm text-slate-700">
                  <p className="text-xs leading-relaxed text-slate-600">{t("public.jobs.demandProcessLead")}</p>
                  <ol className="list-decimal space-y-2 pl-4 text-xs font-medium text-slate-800">
                    <li>{t("public.jobs.demandProcessStep1")}</li>
                    <li>{t("public.jobs.demandProcessStep2")}</li>
                    <li>{t("public.jobs.demandProcessStep3")}</li>
                  </ol>
                </div>
              )}
            </section>

            {totalPages > 1 ? (
              <nav
                className="flex items-center justify-between border-t border-slate-200/80 pt-8 text-sm"
                aria-label={t("public.pagination.label")}
              >
                {page > 1 ? (
                  <Link
                    href={
                      `${jobsBase}${jobsBrowseQueryString({ ...filterBase, page: page - 1 })}` as Route
                    }
                    className="font-bold text-[#3525cd] hover:underline"
                  >
                    {t("public.pagination.previous")}
                  </Link>
                ) : (
                  <span className="text-slate-300">{t("public.pagination.previous")}</span>
                )}
                <span className="text-xs font-semibold text-slate-600">
                  {t("public.pagination.pageOf", { page, total: totalPages })}
                </span>
                {page < totalPages ? (
                  <Link
                    href={
                      `${jobsBase}${jobsBrowseQueryString({ ...filterBase, page: page + 1 })}` as Route
                    }
                    className="font-bold text-[#3525cd] hover:underline"
                  >
                    {t("public.pagination.next")}
                  </Link>
                ) : (
                  <span className="text-slate-300">{t("public.pagination.next")}</span>
                )}
              </nav>
            ) : null}
          </div>

          <aside
            className={["order-3 min-w-0 space-y-4", noJobsBaseline ? "mt-6" : "mt-4 lg:mt-0 lg:sticky lg:top-24"].join(" ")}
          >
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md ring-1 ring-slate-900/[0.03]">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("public.jobs.pulseTitle")}</h2>
                <Link href={notificationsHref as Route} className="text-xs font-bold text-[#3525cd] hover:underline">
                  {t("public.jobs.viewAllSmall")}
                </Link>
              </div>
              <p className="mt-1 text-xs text-slate-500">{t("public.jobs.pulseSubtitle")}</p>

              <div className="mt-4 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  {t("public.jobs.pulseFreshJobs")}
                </p>
                <ul className="space-y-2 text-sm">
                  {heroPanelActivity.jobRows.length === 0 ? (
                    <li className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-slate-500">
                      {t("public.jobs.pulseEmptyJobs")}
                    </li>
                  ) : (
                    heroPanelActivity.jobRows.map((job) => (
                      <li key={`${job.title}-${job.createdAt}`} className="border-l-2 border-slate-200 py-2 pl-3">
                        <p className="font-semibold text-slate-900 line-clamp-2">{job.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {t("public.jobs.pulseJobMeta", {
                            time: relativeTime(job.createdAt, locale),
                            place: job.location ?? t("public.jobs.noCity")
                          })}
                        </p>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  {t("public.jobs.pulseProposals")}
                </p>
                <ul className="space-y-2 text-sm">
                  {heroPanelActivity.proposalRows.length === 0 ? (
                    <li className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-slate-500">
                      {t("public.jobs.pulseEmptyProposals")}
                    </li>
                  ) : (
                    heroPanelActivity.proposalRows.map((row) => (
                      <li key={`${row.freelancerName}-${row.createdAt}-${row.jobTitle}`} className="border-l-2 border-[#3525cd]/25 py-2 pl-3">
                        <p className="text-slate-800">{t("public.jobs.liveProposalLine", { name: row.freelancerName })}</p>
                        <p className="mt-1 text-xs text-slate-500 line-clamp-1">{row.jobTitle}</p>
                        <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                          {relativeTime(row.createdAt, locale)}
                        </p>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md ring-1 ring-slate-900/[0.03]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("public.jobs.insightTitle")}</h2>
              <div className="mt-3 grid grid-cols-1 gap-2">
                <div className="border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p className="text-xl font-bold tabular-nums text-slate-900">{pulse.openPublicJobs}</p>
                  <p className="text-[11px] font-medium text-slate-600">{t("public.jobs.insightOpenRoles")}</p>
                </div>
                <div className="border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p className="text-xl font-bold tabular-nums text-slate-900">{pulse.bidsLast24h}</p>
                  <p className="text-[11px] font-medium text-slate-600">{t("public.jobs.insightApplyVolume")}</p>
                </div>
                <div className="border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p className="text-xl font-bold tabular-nums text-slate-900">{pulse.freelancersAvailable}</p>
                  <p className="text-[11px] font-medium text-slate-600">{t("public.jobs.insightFreelancerActive")}</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] leading-snug text-slate-500">{t("public.jobs.insightFootnote")}</p>
            </section>

            <section className="rounded-2xl border border-[#2b1da8] bg-[#3525cd] p-4 text-white shadow-md">
              <p className="text-sm font-bold">{t("public.jobs.notifyCardTitle")}</p>
              <p className="mt-2 text-sm leading-relaxed text-indigo-100">{t("public.jobs.notifyCardBody")}</p>
              <Link
                href={notificationsHref as Route}
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-[#3525cd] transition hover:bg-slate-100"
              >
                {t("public.jobs.notifyCardCta")}
              </Link>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("public.jobs.quickTipsTitle")}</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{t("public.jobs.quickTipApply")}</p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-bold text-slate-900">{t("public.jobs.smallCtaTitle")}</p>
              <AuthAwareCtaLink
                href={postJobHref as Route}
                intent="post-job"
                unauthenticatedTo="register"
                registerRoleHint="client"
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-[#3525cd] px-3 py-2.5 text-sm font-bold text-white transition hover:bg-[#2b1daa]"
              >
                {t("public.jobs.smallCtaPrimary")}
              </AuthAwareCtaLink>
              <Link
                href={freelancerProfileHref as Route}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
              >
                {t("public.jobs.smallCtaSecondary")}
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
