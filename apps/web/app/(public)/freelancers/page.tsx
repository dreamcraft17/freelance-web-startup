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
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <header className="nw-page-header">
        <p className="nw-section-title">Freelancer discovery</p>
        <h1 className="nw-page-title">Browse freelancers</h1>
        <p className="nw-page-description">
          Live profiles—filter by skill, city, and work mode. Turn on nearby when place matters; go remote when it does
          not.
        </p>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr),min(100%,22rem)] lg:items-start lg:gap-8">
        <div className="order-2 min-w-0 space-y-6 lg:order-1">
          {hasGeoCenter ? (
            <div className="border border-emerald-200 border-l-[3px] border-l-emerald-600 bg-emerald-50/90 px-4 py-3.5 text-sm leading-relaxed text-emerald-950">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Nearby sort on</p>
              <p className="mt-1 font-semibold text-emerald-950">
                Within <span className="text-emerald-900">{radiusKm} km</span> · closest first. Distance on cards when
                coordinates exist.
              </p>
            </div>
          ) : city.trim() ? (
            <div className="border border-slate-200 border-l-[3px] border-l-[#3525cd] bg-white px-4 py-3.5 text-sm leading-relaxed">
              <p className="text-xs font-bold uppercase tracking-wide text-[#3525cd]">City match</p>
              <p className="mt-1 font-semibold text-slate-800">
                Profiles mentioning <span className="text-slate-950">&ldquo;{city.trim()}&rdquo;</span>—pair with work
                mode to separate remote vs on-site.
              </p>
            </div>
          ) : null}

          {nearbyTotal > 0 ? (
            <div className="nw-results-toolbar">
              <span className="text-[15px] font-bold text-slate-950">
                {nearbyTotal === 1 ? "1 profile" : `${nearbyTotal} profiles`}
              </span>
              <span className="max-w-[12rem] text-right text-xs font-medium leading-snug text-slate-600 sm:max-w-none sm:text-left">
                Open a card for the full profile and reviews.
              </span>
            </div>
          ) : null}

          {freelancers.length === 0 ? (
            <FreelancersPublicEmpty categorySelected={categorySelected} hasFilters={hasFilters} />
          ) : (
            <FreelancersBrowseList freelancers={freelancers} activeCityFilter={city.trim() || undefined} />
          )}

          {!hasGeoCenter && totalPages > 1 ? (
            <nav
              className="flex items-center justify-between border-t border-slate-200 pt-6 text-sm"
              aria-label="Pagination"
            >
              {page > 1 ? (
                <Link
                  href={
                    `/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId, page: page - 1 })}` as Route
                  }
                  className="font-bold text-[#3525cd] hover:underline"
                >
                  ← Previous
                </Link>
              ) : (
                <span className="text-slate-300">← Previous</span>
              )}
              <span className="text-xs font-semibold text-slate-600">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={
                    `/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId, page: page + 1 })}` as Route
                  }
                  className="font-bold text-[#3525cd] hover:underline"
                >
                  Next →
                </Link>
              ) : (
                <span className="text-slate-300">Next →</span>
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
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600">For freelancers</p>
            <p className="mt-1 text-base font-bold text-slate-950">Get seen on this directory</p>
            <ul className="mt-3 space-y-2 font-medium text-slate-700">
              <li className="border-l-2 border-slate-200 pl-3">
                <span className="font-bold text-slate-900">Profile</span> — headline, skills, city
              </li>
              <li className="border-l-2 border-slate-200 pl-3">
                <span className="font-bold text-slate-900">Jobs</span> — match your work mode
              </li>
              <li className="border-l-2 border-[#3525cd]/40 pl-3">
                <span className="font-bold text-[#3525cd]">Proposals</span> — one workspace
              </li>
            </ul>
            <div className="mt-4 space-y-2">
              <Link
                href={"/freelancer/profile" as Route}
                className="inline-flex w-full items-center justify-center rounded-md border-2 border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Complete profile
              </Link>
              <AuthAwareCtaLink
                href={"/freelancer/proposals" as Route}
                intent="continue"
                unauthenticatedTo="login"
                className="nw-cta-primary inline-flex w-full items-center justify-center px-3 py-2.5 text-sm font-semibold"
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
