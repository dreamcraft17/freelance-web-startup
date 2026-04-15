import type { Route } from "next";
import Link from "next/link";
import { searchFreelancersSchema } from "@acme/validators";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { FreelancersBrowseList, type PublicFreelancerCard } from "@/features/public/components/FreelancersBrowseList";
import { FreelancersPublicEmpty } from "@/features/public/components/FreelancersPublicEmpty";
import { FreelancersPublicFilters } from "@/features/public/components/FreelancersPublicFilters";
import { CategoryService } from "@/server/services/category.service";
import { GeoService } from "@/server/services/geo.service";
import type { FreelancerSearchItem } from "@/server/services/search.service";
import { SearchService } from "@/server/services/search.service";

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
  page: number;
}): string {
  const u = new URLSearchParams();
  if (args.keyword.trim()) u.set("keyword", args.keyword.trim());
  if (args.city.trim()) u.set("city", args.city.trim());
  if (args.workMode) u.set("workMode", args.workMode);
  if (args.categoryId.trim()) u.set("categoryId", args.categoryId.trim());
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
  const [{ items, total }, categories] = await Promise.all([search.searchFreelancers(geoQuery), loadCategories()]);

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
  const page = query.page;
  const nearbyTotal = hasGeoCenter ? rowsWithDistance.length : total;
  const totalPages = hasGeoCenter ? 1 : Math.max(1, Math.ceil(total / query.limit));

  const hasFilters =
    Boolean(keyword.trim()) ||
    Boolean(city.trim()) ||
    Boolean(workMode) ||
    Boolean(categoryId.trim()) ||
    Boolean(raw.skillId?.trim());
  const categorySelected = Boolean(categoryId.trim());

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <header className="nw-page-header">
        <p className="nw-section-title">Freelancer discovery</p>
        <h1 className="nw-page-title md:text-4xl">Browse freelancers</h1>
        <p className="nw-page-description text-base">
          Filter by skill, city, and work mode. Use nearby search when location matters; switch to remote when it does not.
          All results are live directory profiles.
        </p>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr),min(100%,22rem)] lg:items-start lg:gap-8">
        <div className="order-2 min-w-0 space-y-5 lg:order-1">
          {hasGeoCenter ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-950">
              <p className="font-medium">Nearby sort active</p>
              <p className="mt-1 text-emerald-900/90">
                Within <span className="font-semibold">{radiusKm} km</span> of your point, closest first. Distance shows
                on each card when coordinates are on file.
              </p>
            </div>
          ) : city.trim() ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800">
              <p className="font-medium text-slate-900">City filter</p>
              <p className="mt-1 text-slate-700">
                Profiles listing{" "}
                <span className="font-semibold">&ldquo;{city.trim()}&rdquo;</span>. Combine with work mode to split remote
                from on-site expectations.
              </p>
            </div>
          ) : null}

          {nearbyTotal > 0 ? (
            <div className="nw-results-toolbar">
              <span className="font-medium text-slate-900">
                {nearbyTotal === 1 ? "1 profile" : `${nearbyTotal} profiles`}
              </span>
              <span className="text-slate-500">Open a row to view the full profile.</span>
            </div>
          ) : null}

          {freelancers.length === 0 ? (
            <FreelancersPublicEmpty categorySelected={categorySelected} hasFilters={hasFilters} />
          ) : (
            <FreelancersBrowseList freelancers={freelancers} activeCityFilter={city.trim() || undefined} />
          )}

          {!hasGeoCenter && totalPages > 1 ? (
            <nav
              className="flex items-center justify-between border-t border-slate-200 pt-5 text-sm"
              aria-label="Pagination"
            >
              {page > 1 ? (
                <Link
                  href={
                    `/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId, page: page - 1 })}` as Route
                  }
                  className="font-semibold text-[#433C93] hover:underline"
                >
                  ← Previous
                </Link>
              ) : (
                <span className="text-slate-300">← Previous</span>
              )}
              <span className="text-slate-500">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={
                    `/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId, page: page + 1 })}` as Route
                  }
                  className="font-semibold text-[#433C93] hover:underline"
                >
                  Next →
                </Link>
              ) : (
                <span className="text-slate-300">Next →</span>
              )}
            </nav>
          ) : null}
        </div>

        <aside className="order-1 mb-6 min-w-0 lg:order-2 lg:mb-0 lg:sticky lg:top-28">
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
          <div className="mt-3 hidden rounded-xl border border-slate-200 bg-white p-4 text-sm lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">For freelancers</p>
            <p className="mt-1 font-semibold text-slate-900">Build your earning pipeline</p>
            <ul className="mt-3 space-y-2 text-slate-600">
              <li className="rounded-md bg-slate-50 px-3 py-2">
                <span className="font-medium text-slate-800">Complete profile</span> to improve visibility
              </li>
              <li className="rounded-md bg-slate-50 px-3 py-2">
                <span className="font-medium text-slate-800">Find jobs</span> that match your work mode
              </li>
              <li className="rounded-md bg-slate-50 px-3 py-2">
                <span className="font-medium text-slate-800">Track proposals</span> in one workspace
              </li>
            </ul>
            <div className="mt-3 space-y-2">
              <Link
                href={"/freelancer/profile" as Route}
                className="inline-flex w-full items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Complete profile
              </Link>
              <AuthAwareCtaLink
                href={"/freelancer/proposals" as Route}
                intent="continue"
                unauthenticatedTo="login"
                className="inline-flex w-full items-center justify-center rounded-md bg-[#433C93] px-3 py-2 text-sm font-semibold text-white hover:bg-[#4d45a5]"
              >
                View proposals
              </AuthAwareCtaLink>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
