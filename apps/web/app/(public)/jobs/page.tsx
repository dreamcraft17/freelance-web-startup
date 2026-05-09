import type { Route } from "next";
import Link from "next/link";
import { searchJobsSchema } from "@acme/validators";
import { UserRole } from "@acme/types";
import { db } from "@acme/database";
import { CheckCircle2, Search, Sparkles } from "lucide-react";
import { getSessionFromCookies } from "@src/lib/auth";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { JobsMarketplaceMobileFilters } from "@/features/public/components/JobsMarketplaceMobileFilters";
import { JobsPublicEmpty } from "@/features/public/components/JobsPublicEmpty";
import { JobsPublicList, type JobsPublicCard } from "@/features/public/components/JobsPublicList";
import { jobsBrowseQueryString } from "@/features/public/lib/jobs-browse-query";
import { getServerTranslator } from "@/lib/i18n/server-translator";
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

function relativeTime(input: string, locale: string): string {
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
    [
      "rounded-full px-3 py-1 text-xs font-semibold transition",
      active
        ? "bg-[#3525cd] text-white shadow-sm"
        : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
    ].join(" ");
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

  return (
    <div className="min-h-screen bg-[#f4f3f1]">
      <section className="relative overflow-hidden border-b border-white/70 bg-gradient-to-br from-[#ede9ff] via-[#f7f4ff] to-[#faf8f4]">
        <div className="pointer-events-none absolute left-[-10%] top-[-20%] h-[420px] w-[420px] rounded-full bg-[#3525cd]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[-5%] top-[10%] h-[280px] w-[280px] rounded-full bg-amber-200/25 blur-3xl" />
        <div className="relative mx-auto max-w-[1440px] px-4 pb-12 pt-10 md:px-6 md:pb-14 md:pt-14">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)] lg:gap-14">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5246ae]">{t("public.jobs.sectionTitle")}</p>
              <h1 className="mt-3 text-3xl font-bold leading-[1.12] tracking-tight text-[#0b1220] sm:text-4xl md:text-5xl">
                {t("public.jobs.heroHeadlineBefore")}{" "}
                <span className="bg-gradient-to-r from-[#3525cd] to-[#5b4ddb] bg-clip-text text-transparent">
                  {t("public.jobs.heroHeadlineAccent")}
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-base text-slate-600 md:text-lg">{t("public.jobs.boardDescription")}</p>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-700">
                <li className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  {t("public.jobs.trustFree")}
                </li>
                <li className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  {t("public.jobs.trustClients")}
                </li>
                <li className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  {t("public.jobs.trustPayments")}
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-px rounded-[26px] bg-gradient-to-br from-white/90 to-white/40 blur-[2px]" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-white/80 bg-white/70 shadow-[0_28px_80px_-40px_rgba(53,37,205,0.55)] backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-t from-[#3525cd]/[0.07] to-transparent" />
                <div className="flex h-full flex-col justify-between p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-100">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden />
                      {t("public.jobs.heroPanelKicker")}
                    </span>
                    <span className="rounded-full bg-slate-900/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      NearWork
                    </span>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-800">{t("public.jobs.heroVisualTitle")}</p>
                    <p className="text-sm leading-relaxed text-slate-600">{t("public.jobs.heroVisualBody")}</p>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
                      <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#3525cd] to-violet-400 shadow-[0_0_24px_rgba(53,37,205,0.35)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mx-auto mt-10 max-w-[1200px]">
            <div className="rounded-[22px] border border-white/80 bg-white/90 p-4 shadow-[0_22px_60px_-34px_rgba(15,23,42,0.35)] backdrop-blur-md md:p-5">
              <form method="get" action="/jobs" className="grid gap-3 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr),minmax(0,1fr),auto] lg:items-end">
                <div className="relative">
                  <label className="sr-only" htmlFor="nw-jobs-q">
                    {t("public.jobs.searchKeywordPlaceholder")}
                  </label>
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden
                  />
                  <input
                    id="nw-jobs-q"
                    name="keyword"
                    defaultValue={keyword}
                    placeholder={t("public.jobs.searchKeywordPlaceholder")}
                    className="h-12 w-full rounded-2xl border border-slate-200/90 bg-white pl-10 pr-3 text-sm font-medium text-slate-900 shadow-sm outline-none ring-0 transition focus:border-[#3525cd]/50 focus:ring-2 focus:ring-[#3525cd]/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {t("public.filters.location")}
                  </label>
                  <input
                    name="city"
                    defaultValue={city}
                    placeholder={t("public.jobs.searchLocationPlaceholder")}
                    className="h-12 w-full rounded-2xl border border-slate-200/90 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm outline-none focus:border-[#3525cd]/50 focus:ring-2 focus:ring-[#3525cd]/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {t("public.filters.category")}
                  </label>
                  <select
                    name="categoryId"
                    defaultValue={categoryId}
                    className="h-12 w-full rounded-2xl border border-slate-200/90 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm outline-none focus:border-[#3525cd]/50 focus:ring-2 focus:ring-[#3525cd]/20"
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
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#3525cd] px-6 text-sm font-semibold text-white shadow-[0_14px_34px_-18px_rgba(53,37,205,0.9)] transition hover:bg-[#2b1daa]"
                >
                  {t("public.jobs.searchAction")}
                </button>
              </form>
              <p className="mt-3 text-xs text-slate-500">{t("public.jobs.searchExamplesHint")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t("public.jobs.quickSearchLabel")}
                </span>
                {quickTags.map((tag) => (
                  <Link
                    key={tag.label}
                    href={`/jobs${tag.href}` as Route}
                    className="rounded-full border border-slate-200/80 bg-slate-50/90 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-[#3525cd]/30 hover:bg-white"
                  >
                    {tag.label}
                  </Link>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/jobs${jobsBrowseQueryString({ ...qArgs, workMode: "" })}` as Route}
                  className={workModeChipClass(workMode === "")}
                >
                  {t("public.filters.workModeAny")}
                </Link>
                <Link
                  href={`/jobs${jobsBrowseQueryString({ ...qArgs, workMode: "REMOTE" })}` as Route}
                  className={workModeChipClass(workMode === "REMOTE")}
                >
                  {t("public.filters.workModeRemote")}
                </Link>
                <Link
                  href={`/jobs${jobsBrowseQueryString({ ...qArgs, workMode: "ONSITE" })}` as Route}
                  className={workModeChipClass(workMode === "ONSITE")}
                >
                  {t("public.filters.workModeOnSite")}
                </Link>
                <Link
                  href={`/jobs${jobsBrowseQueryString({ ...qArgs, workMode: "HYBRID" })}` as Route}
                  className={workModeChipClass(workMode === "HYBRID")}
                >
                  {t("public.filters.workModeHybrid")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-8 md:px-6">
        <div className="lg:grid lg:grid-cols-[280px,minmax(0,1fr),300px] lg:items-start lg:gap-8">
          <aside className="mb-5 hidden lg:sticky lg:top-28 lg:mb-0 lg:block">
            <div className="space-y-1 rounded-[22px] border border-white/70 bg-white/95 p-5 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.45)] backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">{t("public.filters.title")}</h2>
                <Link href="/jobs" className="text-xs font-semibold text-[#3525cd] hover:underline">
                  {t("public.filters.reset")}
                </Link>
              </div>
              <details open className="group border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-800 marker:content-none [&::-webkit-details-marker]:hidden">
                  {t("public.filters.category")}
                </summary>
                <div className="mt-3 space-y-1 text-sm">
                  <Link
                    href={`/jobs${jobsBrowseQueryString({ ...filterBase, categoryId: "", page: 1 })}` as Route}
                    className={`block rounded-xl px-2 py-1.5 ${categoryId === "" ? "bg-[#f4f2ff] font-semibold text-[#3525cd]" : "text-slate-700 hover:bg-slate-50"}`}
                  >
                    {t("public.filters.allCategories")}
                  </Link>
                  {categories.slice(0, 12).map((c) => (
                    <Link
                      key={c.id}
                      href={`/jobs${jobsBrowseQueryString({ ...filterBase, categoryId: c.id, page: 1 })}` as Route}
                      className={`block rounded-xl px-2 py-1.5 ${categoryId === c.id ? "bg-[#f4f2ff] font-semibold text-[#3525cd]" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </details>
              <details open className="group border-t border-slate-100 pt-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-800 marker:content-none [&::-webkit-details-marker]:hidden">
                  {t("public.jobs.budgetFilterLabel")}
                </summary>
                <div className="mt-3 space-y-1 text-sm">
                  {[
                    { value: "500000", label: t("public.jobs.budgetFilter500k") },
                    { value: "1000000", label: t("public.jobs.budgetFilter1m") },
                    { value: "3000000", label: t("public.jobs.budgetFilter3m") }
                  ].map((item) => (
                    <Link
                      key={item.value}
                      href={`/jobs${jobsBrowseQueryString({ ...filterBase, minBudget: item.value, page: 1 })}` as Route}
                      className={`block rounded-xl px-2 py-1.5 ${minBudget === item.value ? "bg-[#f4f2ff] font-semibold text-[#3525cd]" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
              <details open className="group border-t border-slate-100 pt-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-800 marker:content-none [&::-webkit-details-marker]:hidden">
                  {t("public.jobs.postedFilterLabel")}
                </summary>
                <div className="mt-3 space-y-1 text-sm">
                  {[
                    { value: "1", label: t("public.jobs.postedFilter24h") },
                    { value: "7", label: t("public.jobs.postedFilter7d") },
                    { value: "30", label: t("public.jobs.postedFilter30d") }
                  ].map((item) => (
                    <Link
                      key={item.value}
                      href={`/jobs${jobsBrowseQueryString({ ...filterBase, postedWithinDays: item.value, page: 1 })}` as Route}
                      className={`block rounded-xl px-2 py-1.5 ${postedWithinDays === item.value ? "bg-[#f4f2ff] font-semibold text-[#3525cd]" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
              <details open className="group border-t border-slate-100 pt-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-800 marker:content-none [&::-webkit-details-marker]:hidden">
                  {t("public.jobs.workTypeFilterLabel")}
                </summary>
                <div className="mt-3 space-y-1 text-sm">
                  <Link
                    href={`/jobs${jobsBrowseQueryString({ ...filterBase, workMode: "REMOTE", page: 1 })}` as Route}
                    className={`block rounded-xl px-2 py-1.5 ${workMode === "REMOTE" ? "bg-[#f4f2ff] font-semibold text-[#3525cd]" : "text-slate-700 hover:bg-slate-50"}`}
                  >
                    {t("public.filters.workModeRemote")}
                  </Link>
                  <Link
                    href={`/jobs${jobsBrowseQueryString({ ...filterBase, workMode: "ONSITE", page: 1 })}` as Route}
                    className={`block rounded-xl px-2 py-1.5 ${workMode === "ONSITE" ? "bg-[#f4f2ff] font-semibold text-[#3525cd]" : "text-slate-700 hover:bg-slate-50"}`}
                  >
                    {t("public.filters.workModeOnSite")}
                  </Link>
                  <Link
                    href={`/jobs${jobsBrowseQueryString({ ...filterBase, workMode: "HYBRID", page: 1 })}` as Route}
                    className={`block rounded-xl px-2 py-1.5 ${workMode === "HYBRID" ? "bg-[#f4f2ff] font-semibold text-[#3525cd]" : "text-slate-700 hover:bg-slate-50"}`}
                  >
                    {t("public.filters.workModeHybrid")}
                  </Link>
                </div>
              </details>
            </div>
          </aside>

          <div className="order-1 min-w-0 space-y-5 lg:order-2">
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

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-white/70 bg-white/95 px-5 py-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#3525cd]" aria-hidden />
                <div>
                  <p className="text-base font-bold text-slate-900">
                    {total === 1 ? t("public.jobs.resultOne") : t("public.jobs.resultMany", { count: total })}
                  </p>
                  <p className="text-sm text-slate-600">{t("public.jobs.resultHint")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="hidden font-semibold text-slate-500 sm:inline">{t("public.jobs.sortLabel")}</span>
                <select
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm"
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

            <section className="rounded-[22px] border border-white/70 bg-white/95 p-5 shadow-sm backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900">{t("public.jobs.demandTrendTitle")}</h2>
                <Link href="/jobs" className="text-xs font-semibold text-[#3525cd] hover:underline">
                  {t("public.jobs.viewAllSmall")}
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {(topDemandCategories.length > 0
                  ? topDemandCategories
                  : [
                      { label: t("public.jobs.quickTagVideo"), count: 0 },
                      { label: t("public.jobs.quickTagDesign"), count: 0 },
                      { label: t("public.jobs.quickTagCopy"), count: 0 }
                    ]
                ).map((item, idx) => (
                  <div
                    key={`${item.label}-${idx}`}
                    className="rounded-[18px] border border-slate-200/80 bg-slate-50/50 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {item.label}
                      {idx === 0 ? " · 🔥" : ""}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.count > 0 ? t("public.jobs.demandCount", { count: item.count }) : t("public.jobs.demandFallback")}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {totalPages > 1 ? (
              <nav
                className="flex items-center justify-between border-t border-slate-200/80 pt-8 text-sm"
                aria-label={t("public.pagination.label")}
              >
                {page > 1 ? (
                  <Link
                    href={
                      `/jobs${jobsBrowseQueryString({ ...filterBase, page: page - 1 })}` as Route
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
                      `/jobs${jobsBrowseQueryString({ ...filterBase, page: page + 1 })}` as Route
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
            className={["order-3 min-w-0 space-y-5", noJobsBaseline ? "mt-6" : "mt-4 lg:mt-0 lg:sticky lg:top-28"].join(
              " "
            )}
          >
            <section className="rounded-[22px] border border-white/70 bg-white/95 p-5 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.35)] backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900">{t("public.jobs.pulseTitle")}</h2>
                <Link href="/notifications" className="text-xs font-semibold text-[#3525cd] hover:underline">
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
                    <li className="rounded-xl border border-dashed border-slate-200 px-3 py-2 text-slate-500">
                      {t("public.jobs.pulseEmptyJobs")}
                    </li>
                  ) : (
                    heroPanelActivity.jobRows.map((job) => (
                      <li
                        key={`${job.title}-${job.createdAt}`}
                        className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 px-3 py-2.5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.35)]"
                      >
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
                    <li className="rounded-xl border border-dashed border-slate-200 px-3 py-2 text-slate-500">
                      {t("public.jobs.pulseEmptyProposals")}
                    </li>
                  ) : (
                    heroPanelActivity.proposalRows.map((row) => (
                      <li
                        key={`${row.freelancerName}-${row.createdAt}-${row.jobTitle}`}
                        className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-[#faf9ff] to-white px-3 py-2.5"
                      >
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

            <section className="rounded-[22px] border border-white/70 bg-white/95 p-5 shadow-sm backdrop-blur-sm">
              <h2 className="text-base font-semibold text-slate-900">{t("public.jobs.insightTitle")}</h2>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <div className="rounded-[18px] border border-slate-200/80 bg-slate-50/60 px-4 py-3">
                  <p className="text-2xl font-bold tabular-nums text-slate-900">{pulse.openPublicJobs}</p>
                  <p className="text-xs text-slate-600">{t("public.jobs.insightOpenRoles")}</p>
                </div>
                <div className="rounded-[18px] border border-slate-200/80 bg-slate-50/60 px-4 py-3">
                  <p className="text-2xl font-bold tabular-nums text-slate-900">{pulse.bidsLast24h}</p>
                  <p className="text-xs text-slate-600">{t("public.jobs.insightApplyVolume")}</p>
                </div>
                <div className="rounded-[18px] border border-slate-200/80 bg-slate-50/60 px-4 py-3">
                  <p className="text-2xl font-bold tabular-nums text-slate-900">{pulse.freelancersAvailable}</p>
                  <p className="text-xs text-slate-600">{t("public.jobs.insightFreelancerActive")}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">{t("public.jobs.insightFootnote")}</p>
            </section>

            <section className="rounded-[22px] border border-white/70 bg-gradient-to-br from-[#3525cd] to-[#4f3ae0] p-5 text-white shadow-[0_24px_60px_-36px_rgba(53,37,205,0.8)]">
              <p className="text-sm font-semibold">{t("public.jobs.notifyCardTitle")}</p>
              <p className="mt-2 text-sm text-white/85">{t("public.jobs.notifyCardBody")}</p>
              <Link
                href="/notifications"
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white px-3 py-2.5 text-sm font-semibold text-[#3525cd] shadow-sm hover:bg-white/95"
              >
                {t("public.jobs.notifyCardCta")}
              </Link>
            </section>

            <section className="rounded-[22px] border border-white/70 bg-white/95 p-5 shadow-sm backdrop-blur-sm">
              <h2 className="text-base font-semibold text-slate-900">{t("public.jobs.quickTipsTitle")}</h2>
              <p className="mt-2 text-sm text-slate-600">{t("public.jobs.quickTipApply")}</p>
            </section>

            <section className="rounded-[22px] border border-white/70 bg-white/95 p-5 shadow-sm backdrop-blur-sm">
              <p className="text-sm font-semibold text-slate-900">{t("public.jobs.smallCtaTitle")}</p>
              <AuthAwareCtaLink
                href={"/client/jobs/new" as Route}
                intent="post-job"
                unauthenticatedTo="register"
                registerRoleHint="client"
                className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-[#3525cd] px-3 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(53,37,205,0.9)] hover:bg-[#2b1daa]"
              >
                {t("public.jobs.smallCtaPrimary")}
              </AuthAwareCtaLink>
              <Link
                href="/freelancer/profile"
                className="mt-2 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200/90 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
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
