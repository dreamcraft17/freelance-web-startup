import type { Route } from "next";
import Link from "next/link";
import { searchFreelancersSchema } from "@acme/validators";
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

function toPublicCard(f: FreelancerSearchItem): PublicFreelancerCard {
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
    averageReviewRating: f.averageReviewRating
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
  const geoItems = hasGeoCenter
    ? items
        .map((f) => ({
          row: f,
          distanceKm:
            f.lat != null && f.lng != null ? geo.haversineKm(rawLat, rawLng, f.lat, f.lng) : Number.POSITIVE_INFINITY
        }))
        .filter((x) => x.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 24)
        .map((x) => x.row)
    : items;
  const freelancers = geoItems.map(toPublicCard);

  const keyword = query.keyword ?? "";
  const city = query.city ?? "";
  const workMode = (query.workMode ?? "") as "" | "REMOTE" | "ONSITE" | "HYBRID";
  const categoryId = query.categoryId ?? "";
  const page = query.page;
  const nearbyTotal = hasGeoCenter ? geoItems.length : total;
  const totalPages = hasGeoCenter ? 1 : Math.max(1, Math.ceil(total / query.limit));

  const hasFilters =
    Boolean(keyword.trim()) ||
    Boolean(city.trim()) ||
    Boolean(workMode) ||
    Boolean(categoryId.trim()) ||
    Boolean(raw.skillId?.trim());
  const categorySelected = Boolean(categoryId.trim());

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Discover freelancers</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
          NearWork is built around <span className="font-semibold text-slate-800">who is near you</span> and who can
          work <span className="font-semibold text-slate-800">remotely</span>. Start with city for on-site or hybrid,
          switch to remote when location does not matter—every row is a live profile from the directory.
        </p>
      </header>

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

      {hasGeoCenter ? (
        <p className="mb-6 rounded-xl bg-emerald-50/80 px-4 py-3 text-sm leading-relaxed text-emerald-900 ring-1 ring-emerald-100">
          Showing freelancers near you within <span className="font-semibold">{radiusKm} km</span>. You can still refine
          by city and work mode.
        </p>
      ) : city.trim() ? (
        <p className="mb-6 rounded-xl bg-indigo-50/80 px-4 py-3 text-sm leading-relaxed text-slate-700 ring-1 ring-indigo-100">
          Showing freelancers whose listed city matches{" "}
          <span className="font-semibold text-slate-900">&ldquo;{city.trim()}&rdquo;</span>—pair with work mode to
          separate remote collaborators from people who expect to meet in person.
        </p>
      ) : null}

      {nearbyTotal > 0 ? (
        <p className="mb-6 text-sm text-slate-600">
          {nearbyTotal === 1 ? "One profile matches your search." : `${nearbyTotal} profiles match your search.`}
        </p>
      ) : null}

      {freelancers.length === 0 ? (
        <FreelancersPublicEmpty categorySelected={categorySelected} hasFilters={hasFilters} />
      ) : (
        <FreelancersBrowseList freelancers={freelancers} activeCityFilter={city.trim() || undefined} />
      )}

      {!hasGeoCenter && totalPages > 1 ? (
        <nav
          className="mt-10 flex items-center justify-between border-t border-slate-200/80 pt-6 text-sm"
          aria-label="Pagination"
        >
          {page > 1 ? (
            <Link
              href={
                `/freelancers${freelancersQueryString({ keyword, city, workMode, categoryId, page: page - 1 })}` as Route
              }
              className="font-semibold text-[#3525cd] hover:underline"
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
              className="font-semibold text-[#3525cd] hover:underline"
            >
              Next →
            </Link>
          ) : (
            <span className="text-slate-300">Next →</span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
