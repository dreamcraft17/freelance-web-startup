import type { Route } from "next";
import Link from "next/link";
import { searchFreelancersSchema } from "@acme/validators";
import { FreelancersBrowseList, type PublicFreelancerCard } from "@/features/public/components/FreelancersBrowseList";
import { FreelancersPublicEmpty } from "@/features/public/components/FreelancersPublicEmpty";
import { FreelancersPublicFilters } from "@/features/public/components/FreelancersPublicFilters";
import { MarketplacePulse } from "@/components/marketing/MarketplacePulse";
import { getServerTranslator } from "@/lib/i18n/server-translator";
import { CategoryService } from "@/server/services/category.service";
import { GeoService } from "@/server/services/geo.service";
import type { FreelancerSearchItem } from "@/server/services/search.service";
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
  page: number;
}): string {
  const u = new URLSearchParams();
  if (args.keyword.trim()) u.set("keyword", args.keyword.trim());
  if (args.city.trim()) u.set("city", args.city.trim());
  if (args.workMode) u.set("workMode", args.workMode);
  if (args.categoryId.trim()) u.set("categoryId", args.categoryId.trim());
  if (args.availability.trim()) u.set("availability", args.availability.trim());
  if (args.budget.trim()) u.set("budget", args.budget.trim());
  if (args.page > 1) u.set("page", String(args.page));
  const s = u.toString();
  return s ? `?${s}` : "";
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
  const [{ items, total }, categories, pulse, { t }] = await Promise.all([
    search.searchFreelancers(geoQuery),
    loadCategories(),
    new PublicStatsService().getMarketplacePulse(),
    getServerTranslator()
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
  const page = query.page;
  const totalPages = hasGeoCenter ? 1 : Math.max(1, Math.ceil(total / query.limit));

  const filteredFreelancers = availability
    ? freelancers.filter((f) => f.availabilityStatus === "AVAILABLE")
    : freelancers;
  const budgetFilteredFreelancers =
    budget === "fit"
      ? filteredFreelancers.filter((f) => f.hourlyRate != null && Number.isFinite(f.hourlyRate) && f.hourlyRate <= 100000)
      : filteredFreelancers;
  const displayTotal = budgetFilteredFreelancers.length;
  const availableNowCount = budgetFilteredFreelancers.filter((f) => f.availabilityStatus === "AVAILABLE").length;

  const hasFilters =
    Boolean(keyword.trim()) ||
    Boolean(city.trim()) ||
    Boolean(workMode) ||
    Boolean(categoryId.trim()) ||
    Boolean(raw.skillId?.trim()) ||
    Boolean(availability) ||
    Boolean(budget);
  const categorySelected = Boolean(categoryId.trim());

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <header className="nw-page-header">
        <p className="nw-section-title">{t("public.freelancers.sectionTitle")}</p>
        <h1 className="nw-page-title">{t("public.freelancers.pageTitle")}</h1>
        <p className="nw-page-description">{t("public.freelancers.pageDescription")}</p>
        <div className="mt-2">
          <MarketplacePulse pulse={pulse} t={t} />
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr),min(100%,22rem)] lg:items-start lg:gap-8">
        <div className="order-2 min-w-0 space-y-6 lg:order-1">
          {hasGeoCenter ? (
            <div className="border border-emerald-200 border-l-[3px] border-l-emerald-600 bg-emerald-50/90 px-4 py-3.5 text-sm leading-relaxed text-emerald-950">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">{t("public.freelancers.nearbyBannerTitle")}</p>
              <p className="mt-1 font-semibold text-emerald-950">
                {t("public.freelancers.nearbyBannerBody", { radius: radiusKm })}
              </p>
            </div>
          ) : city.trim() ? (
            <div className="border border-slate-200 border-l-[3px] border-l-[#3525cd] bg-white px-4 py-3.5 text-sm leading-relaxed">
              <p className="text-xs font-bold uppercase tracking-wide text-[#3525cd]">{t("public.freelancers.cityMatchTitle")}</p>
              <p className="mt-1 font-semibold text-slate-800">
                {t("public.freelancers.cityMatchBody", { city: city.trim() })}
              </p>
            </div>
          ) : null}

          {displayTotal > 0 ? (
            <div className="nw-results-toolbar">
              <span className="text-[15px] font-bold text-slate-950">
                {displayTotal === 1 ? t("public.freelancers.resultOne") : t("public.freelancers.resultMany", { count: displayTotal })}
              </span>
              <span className="max-w-[12rem] text-right text-xs font-medium leading-snug text-slate-600 sm:max-w-none sm:text-left">
                {t("public.freelancers.resultHint")}
              </span>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
            <span>
              {t("public.freelancers.activityAvailableNow", {
                count: availableNowCount
              })}
            </span>
            <span className="text-slate-400">•</span>
            <span>{t("public.freelancers.activityUpdatedDaily")}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              {t("public.freelancers.quickChipsLabel")}
            </span>
            <Link
              href={`/freelancers${freelancersQueryString({ keyword, city, workMode: "ONSITE", categoryId, availability: "", budget: "", page: 1 })}` as Route}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-[#3525cd]/45 hover:text-[#3525cd]"
            >
              {t("public.freelancers.quickChipNearby")}
            </Link>
            <Link
              href={`/freelancers${freelancersQueryString({ keyword, city: "", workMode: "REMOTE", categoryId, availability: "", budget: "", page: 1 })}` as Route}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-[#3525cd]/45 hover:text-[#3525cd]"
            >
              {t("public.freelancers.quickChipRemote")}
            </Link>
            <Link
              href={`/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId, availability: "", budget: "fit", page: 1 })}` as Route}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-[#3525cd]/45 hover:text-[#3525cd]"
            >
              {t("public.freelancers.quickChipBudget")}
            </Link>
            <Link
              href={`/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId, availability: "AVAILABLE", budget: "", page: 1 })}` as Route}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-[#3525cd]/45 hover:text-[#3525cd]"
            >
              {t("public.freelancers.quickChipAvailable")}
            </Link>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t("public.freelancers.trustTitle")}</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              <li>{t("public.freelancers.trustOne")}</li>
              <li>{t("public.freelancers.trustTwo")}</li>
              <li>{t("public.freelancers.trustThree")}</li>
            </ul>
          </div>

          {budgetFilteredFreelancers.length === 0 ? (
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
            <FreelancersBrowseList freelancers={budgetFilteredFreelancers} activeCityFilter={city.trim() || undefined} />
          )}

          {!hasGeoCenter && totalPages > 1 ? (
            <nav
              className="flex items-center justify-between border-t border-slate-200 pt-6 text-sm"
              aria-label={t("public.pagination.label")}
            >
              {page > 1 ? (
                <Link
                  href={
                    `/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId, availability, budget, page: page - 1 })}` as Route
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
                    `/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId, availability, budget, page: page + 1 })}` as Route
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

        <aside className="order-1 mb-8 min-w-0 space-y-5 lg:order-2 lg:mb-0 lg:sticky lg:top-28">
          <FreelancersPublicFilters
            keyword={keyword}
            city={city}
            workMode={workMode}
            categoryId={categoryId}
            categories={categories}
            lat={hasGeoCenter ? rawLat : null}
            lng={hasGeoCenter ? rawLng : null}
            radiusKm={radiusKm}
          />
          <div className="nw-surface-soft hidden border-t-[3px] border-t-[#3525cd] p-4 text-sm lg:block">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600">{t("public.freelancers.sidebarKicker")}</p>
            <p className="mt-1 text-base font-bold text-slate-950">{t("public.freelancers.sidebarTitle")}</p>
            <p className="mt-2 text-sm text-slate-600">{t("public.freelancers.sidebarSimpleBody")}</p>
            <div className="mt-4">
              <Link
                href={"/freelancer/profile" as Route}
                className="inline-flex w-full items-center justify-center rounded-md border-2 border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                {t("public.freelancers.sidebarPrimary")}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
