import type { Route } from "next";
import Link from "next/link";
import { searchJobsSchema } from "@acme/validators";
import { UserRole } from "@acme/types";
import { getSessionFromCookies } from "@src/lib/auth";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { JobsPublicEmpty } from "@/features/public/components/JobsPublicEmpty";
import { JobsPublicList, type JobsPublicCard } from "@/features/public/components/JobsPublicList";
import { getServerTranslator } from "@/lib/i18n/server-translator";
import { CategoryService } from "@/server/services/category.service";
import { JobService } from "@/server/services/job.service";
import { PublicStatsService } from "@/server/services/public-stats.service";

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

function toPublicJobCard(job: {
  id: string;
  title: string;
  description: string;
  translationSource: "en" | "id";
  isTranslated: boolean;
  categoryId: string;
  budgetMin: { toString(): string } | null;
  budgetMax: { toString(): string } | null;
  currency: string;
  budgetType: string;
  workMode: string;
  city: string | null;
  createdAt: string;
  isFeaturedActive: boolean;
}, categoryName: string | null): JobsPublicCard {
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
    isFeaturedActive: job.isFeaturedActive
  };
}

function jobsQueryString(args: {
  keyword: string;
  city: string;
  workMode: string;
  categoryId: string;
  minBudget: string;
  postedWithinDays: string;
  page: number;
}): string {
  const u = new URLSearchParams();
  if (args.keyword.trim()) u.set("keyword", args.keyword.trim());
  if (args.city.trim()) u.set("city", args.city.trim());
  if (args.workMode) u.set("workMode", args.workMode);
  if (args.categoryId.trim()) u.set("categoryId", args.categoryId.trim());
  if (args.minBudget.trim()) u.set("minBudget", args.minBudget.trim());
  if (args.postedWithinDays.trim()) u.set("postedWithinDays", args.postedWithinDays.trim());
  if (args.page > 1) u.set("page", String(args.page));
  const s = u.toString();
  return s ? `?${s}` : "";
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
  const { t, locale } = await getServerTranslator();
  const [{ items, total }, categories, pulse, heroPanelActivity, session] = await Promise.all([
    jobService.listOpenJobs(query, locale),
    loadCategories(),
    new PublicStatsService().getMarketplacePulse(),
    new PublicStatsService().getHeroPanelActivity(),
    getSessionFromCookies()
  ]);
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const jobs = items.map((job) => toPublicJobCard(job, categoryMap.get(job.categoryId) ?? null));

  const keyword = query.keyword ?? "";
  const city = query.city ?? "";
  const workMode = (query.workMode ?? "") as "" | "REMOTE" | "ONSITE" | "HYBRID";
  const categoryId = query.categoryId ?? "";
  const page = query.page;
  const minBudget = query.minBudget != null ? String(query.minBudget) : "";
  const postedWithinDays = query.postedWithinDays != null ? String(query.postedWithinDays) : "";
  const totalPages = Math.max(1, Math.ceil(total / query.limit));

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
    { label: t("public.jobs.quickTagDesign"), href: jobsQueryString({ keyword: "desain", city, workMode, categoryId, minBudget, postedWithinDays, page: 1 }) },
    { label: t("public.jobs.quickTagVideo"), href: jobsQueryString({ keyword: "video", city, workMode, categoryId, minBudget, postedWithinDays, page: 1 }) },
    { label: t("public.jobs.quickTagRemote"), href: jobsQueryString({ keyword, city: "", workMode: "REMOTE", categoryId, minBudget, postedWithinDays, page: 1 }) },
    { label: t("public.jobs.quickTagPartTime"), href: jobsQueryString({ keyword: "part time", city, workMode, categoryId, minBudget, postedWithinDays, page: 1 }) },
    { label: t("public.jobs.quickTagFullTime"), href: jobsQueryString({ keyword: "full time", city, workMode, categoryId, minBudget, postedWithinDays, page: 1 }) }
  ];
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

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-10 pt-6 md:px-6 md:pt-8">
      <header className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t("public.jobs.sectionTitle")}</p>
          <h1 className="mt-2 text-2xl font-bold text-[#071027] md:text-3xl">{t("public.jobs.boardTitle")}</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">{t("public.jobs.boardDescription")}</p>
        </div>
        <div className="sticky top-[4.75rem] z-30 rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-[0_1px_2px_rgba(2,6,23,0.04)] md:p-5">
          <form method="get" action="/jobs" className="grid gap-3 lg:grid-cols-[minmax(0,1.9fr),minmax(0,1fr),minmax(0,1fr),auto] lg:items-center">
            <input
              name="keyword"
              defaultValue={keyword}
              placeholder={t("public.jobs.searchKeywordPlaceholder")}
              className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-[#4f35e8]"
            />
            <input
              name="city"
              defaultValue={city}
              placeholder={t("public.jobs.searchLocationPlaceholder")}
              className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-[#4f35e8]"
            />
            <select
              name="categoryId"
              defaultValue={categoryId}
              className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-[#4f35e8]"
            >
              <option value="">{t("public.filters.allCategories")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button type="submit" className="inline-flex h-11 items-center justify-center rounded-lg bg-[#4f35e8] px-6 text-sm font-semibold text-white hover:bg-[#4326d9]">
              {t("public.jobs.searchAction")}
            </button>
          </form>
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">{t("public.jobs.quickSearchLabel")}</span>
            {quickTags.map((tag) => (
              <Link key={tag.label} href={`/jobs${tag.href}` as Route} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-medium text-slate-700 hover:border-slate-300">
                {tag.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <div className="mt-6 lg:grid lg:grid-cols-[260px,minmax(0,1fr),280px] lg:items-start lg:gap-6">
        <aside className="hidden lg:block lg:sticky lg:top-[11.25rem]">
          <div className="space-y-4 rounded-2xl border border-[#e5e7eb] bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">{t("public.filters.title")}</h2>
              <Link href="/jobs" className="text-xs font-semibold text-[#4f35e8] hover:underline">
                {t("public.filters.reset")}
              </Link>
            </div>
            <details open className="border-t border-slate-100 pt-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-800">{t("public.filters.category")}</summary>
              <div className="mt-2 space-y-1 text-sm">
                <Link href={`/jobs${jobsQueryString({ keyword, city, workMode, categoryId: "", minBudget, postedWithinDays, page: 1 })}` as Route} className={`block ${categoryId === "" ? "font-semibold text-[#4f35e8]" : "text-slate-700 hover:text-[#4f35e8]"}`}>
                  {t("public.filters.allCategories")}
                </Link>
                {categories.slice(0, 8).map((c) => (
                  <Link key={c.id} href={`/jobs${jobsQueryString({ keyword, city, workMode, categoryId: c.id, minBudget, postedWithinDays, page: 1 })}` as Route} className={`block ${categoryId === c.id ? "font-semibold text-[#4f35e8]" : "text-slate-700 hover:text-[#4f35e8]"}`}>
                    {c.name}
                  </Link>
                ))}
              </div>
            </details>
            <details open className="border-t border-slate-100 pt-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-800">{t("public.jobs.budgetFilterLabel")}</summary>
              <div className="mt-2 space-y-1 text-sm">
                {[
                  { value: "500000", label: t("public.jobs.budgetFilter500k") },
                  { value: "1000000", label: t("public.jobs.budgetFilter1m") },
                  { value: "3000000", label: t("public.jobs.budgetFilter3m") }
                ].map((item) => (
                  <Link key={item.value} href={`/jobs${jobsQueryString({ keyword, city, workMode, categoryId, minBudget: item.value, postedWithinDays, page: 1 })}` as Route} className={`block ${minBudget === item.value ? "font-semibold text-[#4f35e8]" : "text-slate-700 hover:text-[#4f35e8]"}`}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
            <details open className="border-t border-slate-100 pt-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-800">{t("public.jobs.workTypeFilterLabel")}</summary>
              <div className="mt-2 space-y-1 text-sm">
                <Link href={`/jobs${jobsQueryString({ keyword, city: "", workMode: "REMOTE", categoryId, minBudget, postedWithinDays, page: 1 })}` as Route} className={`block ${workMode === "REMOTE" ? "font-semibold text-[#4f35e8]" : "text-slate-700 hover:text-[#4f35e8]"}`}>{t("public.filters.workModeRemote")}</Link>
                <Link href={`/jobs${jobsQueryString({ keyword, city, workMode: "ONSITE", categoryId, minBudget, postedWithinDays, page: 1 })}` as Route} className={`block ${workMode === "ONSITE" ? "font-semibold text-[#4f35e8]" : "text-slate-700 hover:text-[#4f35e8]"}`}>{t("public.filters.workModeOnSite")}</Link>
                <Link href={`/jobs${jobsQueryString({ keyword, city, workMode: "HYBRID", categoryId, minBudget, postedWithinDays, page: 1 })}` as Route} className={`block ${workMode === "HYBRID" ? "font-semibold text-[#4f35e8]" : "text-slate-700 hover:text-[#4f35e8]"}`}>{t("public.filters.workModeHybrid")}</Link>
              </div>
            </details>
            <details open className="border-t border-slate-100 pt-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-800">{t("public.jobs.experienceLevelLabel")}</summary>
              <div className="mt-2 space-y-1 text-sm">
                <span className="block text-slate-700">{t("public.jobs.experienceEntry")}</span>
                <span className="block text-slate-700">{t("public.jobs.experienceMid")}</span>
                <span className="block text-slate-700">{t("public.jobs.experienceSenior")}</span>
              </div>
            </details>
          </div>
        </aside>

        <div className="order-1 min-w-0 space-y-4 lg:order-2">
          <div className="lg:hidden">
            <details className="rounded-xl border border-[#e5e7eb] bg-white p-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-900">{t("public.jobs.mobileFilterSummary")}</summary>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Link href={`/jobs${jobsQueryString({ keyword, city: "", workMode: "REMOTE", categoryId, minBudget, postedWithinDays, page: 1 })}` as Route} className="rounded border border-slate-200 px-2 py-1">{t("public.filters.workModeRemote")}</Link>
                <Link href={`/jobs${jobsQueryString({ keyword, city, workMode: "", categoryId, minBudget: "1000000", postedWithinDays, page: 1 })}` as Route} className="rounded border border-slate-200 px-2 py-1">{t("public.jobs.budgetFilter1m")}</Link>
                <Link href={`/jobs${jobsQueryString({ keyword, city, workMode, categoryId, minBudget, postedWithinDays: "1", page: 1 })}` as Route} className="rounded border border-slate-200 px-2 py-1">{t("public.jobs.postedFilter24h")}</Link>
              </div>
            </details>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e5e7eb] bg-white px-4 py-3">
            <div>
              <p className="text-sm font-bold text-slate-900">
                {total === 1 ? t("public.jobs.resultOne") : t("public.jobs.resultMany", { count: total })}
              </p>
              <p className="text-xs text-slate-600">{t("public.jobs.resultHint")}</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">{t("public.jobs.sortLabel")}</span>
              <select className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700">
                <option>{t("public.jobs.sortRelevant")}</option>
              </select>
            </div>
          </div>

          {total > 0 ? (
            <JobsPublicList jobs={jobs} />
          ) : null}

          {jobs.length === 0 ? (
            <JobsPublicEmpty categorySelected={categorySelected} hasFilters={hasFilters} viewerRole={viewerRole} />
          ) : null}

          <section className="rounded-xl border border-[#e5e7eb] bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">{t("public.jobs.demandTrendTitle")}</h2>
              <Link href="/jobs" className="text-xs font-semibold text-[#4f35e8] hover:underline">
                {t("public.jobs.viewAllSmall")}
              </Link>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {(topDemandCategories.length > 0 ? topDemandCategories : [{ label: t("public.jobs.quickTagVideo"), count: 0 }, { label: t("public.jobs.quickTagDesign"), count: 0 }, { label: t("public.jobs.quickTagCopy"), count: 0 }]).map((item, idx) => (
                <div key={`${item.label}-${idx}`} className="rounded-lg border border-slate-200 px-3 py-2.5">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.label} {idx === 0 ? "🔥" : ""}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.count > 0 ? t("public.jobs.demandCount", { count: item.count }) : t("public.jobs.demandFallback")}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {totalPages > 1 ? (
            <nav
              className="flex items-center justify-between border-t border-slate-200 pt-6 text-sm"
              aria-label={t("public.pagination.label")}
            >
              {page > 1 ? (
                <Link
                  href={
                    `/jobs${jobsQueryString({ keyword, city, workMode, categoryId, minBudget, postedWithinDays, page: page - 1 })}` as Route
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
                    `/jobs${jobsQueryString({ keyword, city, workMode, categoryId, minBudget, postedWithinDays, page: page + 1 })}` as Route
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

        <aside className={["order-3 min-w-0 space-y-4", noJobsBaseline ? "mt-6" : "mt-5 lg:mt-0 lg:sticky lg:top-[11.25rem]"].join(" ")}>
          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">{t("public.jobs.liveActivityTitle")}</h2>
              <Link href="/notifications" className="text-xs font-semibold text-[#4f35e8] hover:underline">
                {t("public.jobs.viewAllSmall")}
              </Link>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {heroPanelActivity.jobRows.slice(0, 2).map((job) => (
                <li key={job.title} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
                  {t("public.jobs.liveNewJob", { title: job.title, time: relativeTime(items[0]?.createdAt ?? new Date().toISOString(), locale) })}
                </li>
              ))}
              {heroPanelActivity.freelancerRows[0] ? (
                <li className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
                  {t("public.jobs.liveFreelancerApply", { name: heroPanelActivity.freelancerRows[0].title })}
                </li>
              ) : null}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
            <h2 className="text-base font-semibold text-slate-900">{t("public.jobs.insightTitle")}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg border border-slate-200 p-2.5">
                <p className="text-lg font-bold text-slate-900">{pulse.openPublicJobs}</p>
                <p className="text-xs text-slate-600">{t("public.jobs.insightJobsToday")}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-2.5">
                <p className="text-lg font-bold text-slate-900">18m</p>
                <p className="text-xs text-slate-600">{t("public.jobs.insightAvgResponse")}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-2.5">
                <p className="text-lg font-bold text-slate-900">{pulse.bidsLast24h}</p>
                <p className="text-xs text-slate-600">{t("public.jobs.insightApplyVolume")}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-2.5">
                <p className="text-lg font-bold text-slate-900">{pulse.freelancersAvailable}</p>
                <p className="text-xs text-slate-600">{t("public.jobs.insightFreelancerActive")}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
            <h2 className="text-base font-semibold text-slate-900">{t("public.jobs.quickTipsTitle")}</h2>
            <p className="mt-2 text-sm text-slate-600">{t("public.jobs.quickTipApply")}</p>
          </section>

          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">{t("public.jobs.smallCtaTitle")}</p>
            <AuthAwareCtaLink
              href={"/client/jobs/new" as Route}
              intent="post-job"
              unauthenticatedTo="register"
              registerRoleHint="client"
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[#4f35e8] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#4326d9]"
            >
              {t("public.jobs.smallCtaPrimary")}
            </AuthAwareCtaLink>
            <Link href="/freelancer/profile" className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              {t("public.jobs.smallCtaSecondary")}
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
