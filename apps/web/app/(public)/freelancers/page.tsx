import type { Route } from "next";
import Link from "next/link";
import { searchFreelancersSchema } from "@acme/validators";
import { WorkMode } from "@acme/types";
import { FreelancersBrowseList, type PublicFreelancerCard } from "@/features/public/components/FreelancersBrowseList";
import { FreelancersPublicEmpty } from "@/features/public/components/FreelancersPublicEmpty";
import { getServerTranslator } from "@/lib/i18n/server-translator";
import { CategoryService } from "@/server/services/category.service";
import { GeoService } from "@/server/services/geo.service";
import type { FreelancerSearchItem, JobSearchItem } from "@/server/services/search.service";
import { SearchService } from "@/server/services/search.service";
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

function toPublicCard(f: FreelancerSearchItem, distanceKm?: number | null): PublicFreelancerCard {
  const rounded =
    distanceKm != null && Number.isFinite(distanceKm) ? Math.round(distanceKm * 10) / 10 : null;
  return {
    id: f.id,
    username: f.username,
    fullName: f.fullName,
    headline: f.headline,
    primaryCategoryName: f.primaryCategoryName,
    workMode: f.workMode,
    city: f.city,
    country: f.country,
    hourlyRate: f.hourlyRate,
    availabilityStatus: f.availabilityStatus,
    reviewCount: f.reviewCount,
    averageReviewRating: f.averageReviewRating,
    createdAt: f.createdAt,
    distanceKm: rounded
  };
}

function clampRadius(n: number): number {
  if (!Number.isFinite(n)) return 50;
  return Math.min(150, Math.max(10, Math.round(n)));
}

function freelancersQueryString(args: {
  keyword: string;
  city: string;
  workMode: string;
  categoryId: string;
  availability: string;
  budget: string;
  minRating: string;
  responseTime: string;
  page: number;
}): string {
  const u = new URLSearchParams();
  if (args.keyword.trim()) u.set("keyword", args.keyword.trim());
  if (args.city.trim()) u.set("city", args.city.trim());
  if (args.workMode) u.set("workMode", args.workMode);
  if (args.categoryId.trim()) u.set("categoryId", args.categoryId.trim());
  if (args.availability.trim()) u.set("availability", args.availability.trim());
  if (args.budget.trim()) u.set("budget", args.budget.trim());
  if (args.minRating.trim()) u.set("minRating", args.minRating.trim());
  if (args.responseTime.trim()) u.set("responseTime", args.responseTime.trim());
  if (args.page > 1) u.set("page", String(args.page));
  const s = u.toString();
  return s ? `?${s}` : "";
}

function mapResponseMinutes(f: PublicFreelancerCard): number {
  if (f.reviewCount >= 12) return 15;
  if (f.reviewCount >= 6) return 60;
  if (f.reviewCount >= 2) return 180;
  return 240;
}

function formatBudget(job: JobSearchItem, t: (key: string, values?: Record<string, string | number>) => string): string {
  const min = job.budgetMin != null ? Number(job.budgetMin) : null;
  const max = job.budgetMax != null ? Number(job.budgetMax) : null;
  const currency = job.currency || "IDR";
  const format = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      maximumFractionDigits: 0
    }).format(value);
  if (Number.isFinite(min) && Number.isFinite(max)) return `${format(min as number)} - ${format(max as number)}`;
  if (Number.isFinite(min)) return t("public.jobDetail.budgetFrom", { amount: format(min as number) });
  if (Number.isFinite(max)) return t("public.jobDetail.budgetUpTo", { amount: format(max as number) });
  return t("public.freelancers.rateOnRequest");
}

function relativeTime(input: string, locale: string): string {
  const date = new Date(input);
  const diff = Date.now() - date.getTime();
  if (!Number.isFinite(diff) || diff < 0) return "";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return locale === "id" ? `${days} hari` : `${days}d`;
}

function workModeLabel(mode: string, t: (key: string, values?: Record<string, string | number>) => string): string {
  if (mode === WorkMode.REMOTE) return t("public.filters.workModeRemote");
  if (mode === WorkMode.ONSITE) return t("public.filters.workModeOnSite");
  if (mode === WorkMode.HYBRID) return t("public.filters.workModeHybrid");
  return mode;
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

export default async function FreelancersDirectoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = pick(await searchParams);
  const parsed = searchFreelancersSchema.safeParse({
    page: raw.page ?? 1,
    limit: 24,
    keyword: raw.keyword,
    city: raw.city,
    workMode: raw.workMode === "" ? undefined : raw.workMode,
    categoryId: raw.categoryId,
    skillId: raw.skillId
  });
  const query = parsed.success ? parsed.data : { page: 1, limit: 24 as const };
  const rawLat = Number(raw.lat ?? "");
  const rawLng = Number(raw.lng ?? "");
  const hasGeoCenter = Number.isFinite(rawLat) && Number.isFinite(rawLng);
  const radiusKm = clampRadius(Number(raw.radiusKm ?? 50));

  const search = new SearchService();
  const geoQuery = hasGeoCenter ? { ...query, page: 1 as const, limit: 120 as const } : query;
  const { t, locale } = await getServerTranslator();
  const [{ items, total }, categories, pulse, heroPanelActivity, latestJobs] = await Promise.all([
    search.searchFreelancers(geoQuery),
    loadCategories(),
    new PublicStatsService().getMarketplacePulse(),
    new PublicStatsService().getHeroPanelActivity(),
    search.listPublicOpenJobsPaginated({ page: 1, limit: 5 }, locale)
  ]);

  const geo = new GeoService();
  const rowsWithDistance = hasGeoCenter
    ? items
        .map((f) => {
          const distanceKm =
            f.lat != null && f.lng != null ? geo.haversineKm(rawLat, rawLng, f.lat, f.lng) : Number.POSITIVE_INFINITY;
          return { row: f, distanceKm };
        })
        .filter((x) => Number.isFinite(x.distanceKm) && x.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 24)
        .map((x) => ({ row: x.row, distanceKm: x.distanceKm as number }))
    : items.map((row) => ({ row, distanceKm: null as number | null }));
  const freelancers = rowsWithDistance.map(({ row, distanceKm }) => toPublicCard(row, distanceKm));

  const keyword = query.keyword ?? "";
  const city = query.city ?? "";
  const workMode = (query.workMode ?? "") as "" | "REMOTE" | "ONSITE" | "HYBRID";
  const categoryId = query.categoryId ?? "";
  const availability = (raw.availability ?? "").toUpperCase() === "AVAILABLE" ? "AVAILABLE" : "";
  const budget = (raw.budget ?? "").toLowerCase() === "fit" ? "fit" : "";
  const minRating = ["4.8", "4.5", "4.0"].includes(raw.minRating ?? "") ? (raw.minRating as "4.8" | "4.5" | "4.0") : "";
  const responseTime = ["15", "60", "180"].includes(raw.responseTime ?? "") ? (raw.responseTime as "15" | "60" | "180") : "";
  const page = query.page;
  const totalPages = hasGeoCenter ? 1 : Math.max(1, Math.ceil(total / query.limit));

  const filteredFreelancers = availability
    ? freelancers.filter((f) => f.availabilityStatus === "AVAILABLE")
    : freelancers;
  const budgetFilteredFreelancers =
    budget === "fit"
      ? filteredFreelancers.filter((f) => f.hourlyRate != null && Number.isFinite(f.hourlyRate) && f.hourlyRate <= 100000)
      : filteredFreelancers;
  const ratingFilteredFreelancers =
    minRating !== ""
      ? budgetFilteredFreelancers.filter(
          (f) => f.averageReviewRating != null && Number.isFinite(f.averageReviewRating) && f.averageReviewRating >= Number(minRating)
        )
      : budgetFilteredFreelancers;
  const responseFilteredFreelancers =
    responseTime !== "" ? ratingFilteredFreelancers.filter((f) => mapResponseMinutes(f) <= Number(responseTime)) : ratingFilteredFreelancers;
  const displayTotal = responseFilteredFreelancers.length;
  const availableNowCount = budgetFilteredFreelancers.filter((f) => f.availabilityStatus === "AVAILABLE").length;
  const avgResponseMinutes =
    responseFilteredFreelancers.length > 0
      ? Math.round(responseFilteredFreelancers.reduce((sum, row) => sum + mapResponseMinutes(row), 0) / responseFilteredFreelancers.length)
      : 0;

  const hasFilters =
    Boolean(keyword.trim()) ||
    Boolean(city.trim()) ||
    Boolean(workMode) ||
    Boolean(categoryId.trim()) ||
    Boolean(raw.skillId?.trim()) ||
    Boolean(availability) ||
    Boolean(budget) ||
    Boolean(minRating) ||
    Boolean(responseTime);
  const categorySelected = Boolean(categoryId.trim());
  const quickTerms = ["Desain logo", "Video editing", "Website", "Copywriting", "SEO"];

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-10 pt-6 md:px-6 md:pt-8">
      <header className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t("public.freelancers.sectionTitle")}</p>
          <h1 className="mt-2 text-2xl font-bold text-[#071027] md:text-3xl">{t("public.freelancers.pageTitle")}</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">{t("public.freelancers.pageDescription")}</p>
        </div>
        <div className="sticky top-[4.75rem] z-30 rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-[0_1px_2px_rgba(2,6,23,0.04)] md:p-5">
          <form method="get" action="/freelancers" className="grid gap-3 lg:grid-cols-[minmax(0,1.9fr),minmax(0,1fr),minmax(0,1fr),auto] lg:items-center">
            <input type="hidden" name="availability" value={availability} />
            <input type="hidden" name="budget" value={budget} />
            <input type="hidden" name="minRating" value={minRating} />
            <input type="hidden" name="responseTime" value={responseTime} />
            <input
              name="keyword"
              defaultValue={keyword}
              placeholder={t("public.freelancers.searchKeywordPlaceholder")}
              className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-[#4f35e8]"
            />
            <input
              name="city"
              defaultValue={city}
              placeholder={t("public.freelancers.searchLocationPlaceholder")}
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
              {t("public.freelancers.searchAction")}
            </button>
          </form>
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">{t("public.freelancers.quickSearchLabel")}</span>
            {quickTerms.map((term) => (
              <Link
                key={term}
                href={`/freelancers${freelancersQueryString({ keyword: term, city, workMode, categoryId, availability, budget, minRating, responseTime, page: 1 })}` as Route}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-medium text-slate-700 hover:border-slate-300"
              >
                {term}
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
              <Link href="/freelancers" className="text-xs font-semibold text-[#4f35e8] hover:underline">
                {t("public.filters.reset")}
              </Link>
            </div>
            <details open className="group border-t border-slate-100 pt-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-800">{t("public.filters.category")}</summary>
              <div className="mt-2 space-y-1 text-sm">
                <Link href={`/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId: "", availability, budget, minRating, responseTime, page: 1 })}` as Route} className="block text-slate-700 hover:text-[#4f35e8]">
                  {t("public.filters.allCategories")}
                </Link>
                {categories.slice(0, 8).map((c) => (
                  <Link key={c.id} href={`/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId: c.id, availability, budget, minRating, responseTime, page: 1 })}` as Route} className={`block ${categoryId === c.id ? "font-semibold text-[#4f35e8]" : "text-slate-700 hover:text-[#4f35e8]"}`}>
                    {c.name}
                  </Link>
                ))}
              </div>
            </details>
            <details open className="group border-t border-slate-100 pt-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-800">{t("public.freelancers.filterBudgetLabel")}</summary>
              <div className="mt-2 space-y-1 text-sm">
                <Link href={`/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId, availability, budget: "fit", minRating, responseTime, page: 1 })}` as Route} className={`block ${budget === "fit" ? "font-semibold text-[#4f35e8]" : "text-slate-700 hover:text-[#4f35e8]"}`}>
                  {t("public.freelancers.quickChipBudget")}
                </Link>
                <Link href={`/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId, availability, budget: "", minRating, responseTime, page: 1 })}` as Route} className={`block ${budget === "" ? "font-semibold text-[#4f35e8]" : "text-slate-700 hover:text-[#4f35e8]"}`}>
                  {t("public.freelancers.filterAnyBudget")}
                </Link>
              </div>
            </details>
            <details open className="group border-t border-slate-100 pt-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-800">{t("public.freelancers.filterRatingLabel")}</summary>
              <div className="mt-2 space-y-1 text-sm">
                {["4.8", "4.5", "4.0"].map((ratingValue) => (
                  <Link key={ratingValue} href={`/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId, availability, budget, minRating: ratingValue, responseTime, page: 1 })}` as Route} className={`block ${minRating === ratingValue ? "font-semibold text-[#4f35e8]" : "text-slate-700 hover:text-[#4f35e8]"}`}>
                    {t("public.freelancers.filterRatingAtLeast", { rating: ratingValue })}
                  </Link>
                ))}
              </div>
            </details>
            <details open className="group border-t border-slate-100 pt-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-800">{t("public.filters.city")}</summary>
              <div className="mt-2 space-y-1 text-sm">
                <Link href={`/freelancers${freelancersQueryString({ keyword, city, workMode: "ONSITE", categoryId, availability, budget, minRating, responseTime, page: 1 })}` as Route} className={`block ${workMode === "ONSITE" ? "font-semibold text-[#4f35e8]" : "text-slate-700 hover:text-[#4f35e8]"}`}>
                  {t("public.freelancers.quickChipNearby")}
                </Link>
                <Link href={`/freelancers${freelancersQueryString({ keyword, city: "", workMode: "REMOTE", categoryId, availability, budget, minRating, responseTime, page: 1 })}` as Route} className={`block ${workMode === "REMOTE" ? "font-semibold text-[#4f35e8]" : "text-slate-700 hover:text-[#4f35e8]"}`}>
                  {t("public.freelancers.quickChipRemote")}
                </Link>
                <Link href={`/freelancers${freelancersQueryString({ keyword, city, workMode: "", categoryId, availability, budget, minRating, responseTime, page: 1 })}` as Route} className={`block ${workMode === "" ? "font-semibold text-[#4f35e8]" : "text-slate-700 hover:text-[#4f35e8]"}`}>
                  {t("public.filters.workModeAny")}
                </Link>
              </div>
            </details>
            <details open className="group border-t border-slate-100 pt-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-800">{t("public.freelancers.filterAvailabilityLabel")}</summary>
              <div className="mt-2 space-y-1 text-sm">
                <Link href={`/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId, availability: "AVAILABLE", budget, minRating, responseTime, page: 1 })}` as Route} className={`block ${availability === "AVAILABLE" ? "font-semibold text-[#4f35e8]" : "text-slate-700 hover:text-[#4f35e8]"}`}>
                  {t("public.freelancers.quickChipAvailable")}
                </Link>
                <Link href={`/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId, availability: "", budget, minRating, responseTime, page: 1 })}` as Route} className={`block ${availability === "" ? "font-semibold text-[#4f35e8]" : "text-slate-700 hover:text-[#4f35e8]"}`}>
                  {t("public.freelancers.filterAnyAvailability")}
                </Link>
              </div>
            </details>
            <details open className="group border-t border-slate-100 pt-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-800">{t("public.freelancers.filterResponseLabel")}</summary>
              <div className="mt-2 space-y-1 text-sm">
                {[
                  { value: "15", label: "< 15 menit" },
                  { value: "60", label: "< 1 jam" },
                  { value: "180", label: "< 3 jam" }
                ].map((item) => (
                  <Link key={item.value} href={`/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId, availability, budget, minRating, responseTime: item.value, page: 1 })}` as Route} className={`block ${responseTime === item.value ? "font-semibold text-[#4f35e8]" : "text-slate-700 hover:text-[#4f35e8]"}`}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
          </div>
        </aside>

        <div className="order-1 min-w-0 space-y-4 lg:order-2">
          <div className="lg:hidden">
            <details className="rounded-xl border border-[#e5e7eb] bg-white p-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-900">{t("public.freelancers.mobileFilterSummary")}</summary>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Link href={`/freelancers${freelancersQueryString({ keyword, city, workMode: "ONSITE", categoryId, availability, budget, minRating, responseTime, page: 1 })}` as Route} className="rounded border border-slate-200 px-2 py-1">{t("public.freelancers.quickChipNearby")}</Link>
                <Link href={`/freelancers${freelancersQueryString({ keyword, city: "", workMode: "REMOTE", categoryId, availability, budget, minRating, responseTime, page: 1 })}` as Route} className="rounded border border-slate-200 px-2 py-1">{t("public.freelancers.quickChipRemote")}</Link>
                <Link href={`/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId, availability: "AVAILABLE", budget, minRating, responseTime, page: 1 })}` as Route} className="rounded border border-slate-200 px-2 py-1">{t("public.freelancers.quickChipAvailable")}</Link>
                <Link href={`/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId, availability, budget: "fit", minRating, responseTime, page: 1 })}` as Route} className="rounded border border-slate-200 px-2 py-1">{t("public.freelancers.quickChipBudget")}</Link>
              </div>
            </details>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e5e7eb] bg-white px-4 py-3">
            <div>
              <p className="text-sm font-bold text-slate-900">
                {displayTotal === 1 ? t("public.freelancers.resultOne") : t("public.freelancers.resultMany", { count: displayTotal })}
              </p>
              <p className="text-xs text-slate-600">{t("public.freelancers.resultHint")}</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">{t("public.freelancers.sortLabel")}</span>
              <select className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700">
                <option>{t("public.freelancers.sortRelevant")}</option>
              </select>
            </div>
          </div>

          {responseFilteredFreelancers.length === 0 ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t("public.freelancers.exampleRowsLabel")}
                </p>
                <div className="mt-2 space-y-2.5">
                  {[1, 2, 3].map((idx) => (
                    <div key={idx} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{t("public.freelancers.exampleName")}</p>
                          <p className="text-xs font-medium text-slate-700">{t("public.freelancers.exampleRole")}</p>
                          <p className="mt-1 line-clamp-1 text-xs text-slate-600">{t("public.freelancers.exampleHook")}</p>
                          <p className="mt-1 text-[11px] text-slate-500">{t("public.freelancers.exampleMeta")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("public.freelancers.rateStartingLabel")}</p>
                          <p className="text-xs font-bold text-slate-800">{t("public.freelancers.examplePrice")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <FreelancersPublicEmpty categorySelected={categorySelected} hasFilters={hasFilters} />
            </div>
          ) : (
            <FreelancersBrowseList freelancers={responseFilteredFreelancers} activeCityFilter={city.trim() || undefined} />
          )}

          <section className="rounded-xl border border-[#e5e7eb] bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">{t("public.freelancers.latestJobsTitle")}</h2>
              <Link href="/jobs" className="text-xs font-semibold text-[#4f35e8] hover:underline">
                {t("public.freelancers.latestJobsMore")}
              </Link>
            </div>
            <div className="space-y-2.5">
              {latestJobs.items.slice(0, 4).map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}` as Route} className="block rounded-lg border border-slate-200 px-3 py-2.5 hover:border-slate-300">
                  <p className="line-clamp-1 text-sm font-semibold text-slate-900">{job.title}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {formatBudget(job, t)} · {job.city || workModeLabel(job.workMode, t)} · {relativeTime(job.createdAt, locale)}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {!hasGeoCenter && totalPages > 1 ? (
            <nav
              className="flex items-center justify-between border-t border-slate-200 pt-6 text-sm"
              aria-label={t("public.pagination.label")}
            >
              {page > 1 ? (
                <Link
                  href={
                    `/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId, availability, budget, minRating, responseTime, page: page - 1 })}` as Route
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
                    `/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId, availability, budget, minRating, responseTime, page: page + 1 })}` as Route
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

        <aside className="order-3 mt-5 min-w-0 space-y-4 lg:order-3 lg:mt-0 lg:sticky lg:top-[11.25rem]">
          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">{t("public.freelancers.liveActivityTitle")}</h2>
              <Link href="/notifications" className="text-xs font-semibold text-[#4f35e8] hover:underline">
                {t("public.freelancers.viewAllSmall")}
              </Link>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
                {t("public.freelancers.liveProposalCount", { count: pulse.bidsLast24h })}
              </li>
              {heroPanelActivity.jobRows[0] ? (
                <li className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
                  {t("public.freelancers.liveNewJob", { title: heroPanelActivity.jobRows[0].title })}
                </li>
              ) : null}
              {heroPanelActivity.freelancerRows[0] ? (
                <li className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
                  {t("public.freelancers.liveFreelancerOnline", { name: heroPanelActivity.freelancerRows[0].title })}
                </li>
              ) : null}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
            <h2 className="text-base font-semibold text-slate-900">{t("public.freelancers.insightTitle")}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg border border-slate-200 p-2.5">
                <p className="text-lg font-bold text-slate-900">{pulse.freelancersAvailable}</p>
                <p className="text-xs text-slate-600">{t("public.freelancers.insightActiveFreelancers")}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-2.5">
                <p className="text-lg font-bold text-slate-900">{avgResponseMinutes > 0 ? `${avgResponseMinutes}m` : "-"}</p>
                <p className="text-xs text-slate-600">{t("public.freelancers.insightAvgResponse")}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-2.5">
                <p className="text-lg font-bold text-slate-900">{pulse.openPublicJobs}</p>
                <p className="text-xs text-slate-600">{t("public.freelancers.insightOpenJobs")}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-2.5">
                <p className="text-lg font-bold text-slate-900">{availableNowCount}</p>
                <p className="text-xs text-slate-600">{t("public.freelancers.insightOnlineNow")}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
            <h2 className="text-base font-semibold text-slate-900">{t("public.freelancers.workModeTitle")}</h2>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-semibold">
              <Link href={`/freelancers${freelancersQueryString({ keyword, city: "", workMode: "REMOTE", categoryId, availability, budget, minRating, responseTime, page: 1 })}` as Route} className={`rounded-md border px-2 py-2 text-center ${workMode === "REMOTE" ? "border-[#4f35e8] text-[#4f35e8]" : "border-slate-200 text-slate-700"}`}>{t("public.filters.workModeRemote")}</Link>
              <Link href={`/freelancers${freelancersQueryString({ keyword, city, workMode: "ONSITE", categoryId, availability, budget, minRating, responseTime, page: 1 })}` as Route} className={`rounded-md border px-2 py-2 text-center ${workMode === "ONSITE" ? "border-[#4f35e8] text-[#4f35e8]" : "border-slate-200 text-slate-700"}`}>{t("public.filters.workModeOnSite")}</Link>
              <Link href={`/freelancers${freelancersQueryString({ keyword, city, workMode: "HYBRID", categoryId, availability, budget, minRating, responseTime, page: 1 })}` as Route} className={`rounded-md border px-2 py-2 text-center ${workMode === "HYBRID" ? "border-[#4f35e8] text-[#4f35e8]" : "border-slate-200 text-slate-700"}`}>{t("public.filters.workModeHybrid")}</Link>
            </div>
          </section>

          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">{t("public.freelancers.smallCtaTitle")}</p>
            <Link href={"/client/jobs/new" as Route} className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[#4f35e8] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#4326d9]">
              {t("public.freelancers.smallCtaAction")}
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
