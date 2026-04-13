import { redirect } from "next/navigation";
import { db } from "@acme/database";
import { WorkMode } from "@acme/types";
import { getSessionFromCookies } from "@src/lib/auth";
import {
  ClientNearbyTalentView,
  type ClientNearbyDiscovery,
  type ClientNearbyFreelancerRow
} from "@/components/client-nearby/ClientNearbyTalentView";
import { GeoService } from "@/server/services/geo.service";
import { SearchService } from "@/server/services/search.service";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function pick(sp: SearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (v === undefined) continue;
    out[k] = Array.isArray(v) ? (v[0] ?? "") : v;
  }
  return out;
}

function clampRadius(n: number): number {
  if (!Number.isFinite(n)) return 75;
  return Math.min(200, Math.max(10, Math.round(n)));
}

function areaParts(city: string | null, region: string | null, country: string | null): string | null {
  const parts = [city?.trim(), region?.trim(), country?.trim()].filter(Boolean) as string[];
  if (parts.length === 0) return null;
  return parts.join(", ");
}

export default async function ClientNearbyTalentPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?returnUrl=/client/nearby");
  }

  const sp = pick(await searchParams);
  const q = (sp.q ?? "").trim();
  const workModeRaw = sp.workMode ?? "";
  const workMode =
    workModeRaw === "REMOTE" || workModeRaw === "ONSITE" || workModeRaw === "HYBRID"
      ? (workModeRaw as WorkMode)
      : undefined;
  const radiusFromUrl = clampRadius(parseInt(sp.radiusKm ?? "", 10));
  const radiusKm = sp.radiusKm ? radiusFromUrl : 75;

  const profile = await db.clientProfile.findFirst({
    where: { userId: session.userId, deletedAt: null },
    select: {
      id: true,
      city: true,
      region: true,
      country: true
    }
  });

  const hasProfile = Boolean(profile);
  const areaLabel = profile ? areaParts(profile.city, profile.region, profile.country) : null;

  let discovery: ClientNearbyDiscovery = "none";
  let freelancers: ClientNearbyFreelancerRow[] = [];
  let showRadiusControl = false;

  if (profile) {
    const anchorJob = await db.job.findFirst({
      where: {
        clientProfileId: profile.id,
        deletedAt: null,
        lat: { not: null },
        lng: { not: null }
      },
      orderBy: { updatedAt: "desc" },
      select: { lat: true, lng: true }
    });

    const plat = anchorJob?.lat != null ? Number(anchorJob.lat) : null;
    const plng = anchorJob?.lng != null ? Number(anchorJob.lng) : null;

    if (plat != null && plng != null && Number.isFinite(plat) && Number.isFinite(plng)) {
      discovery = "geo";
      showRadiusControl = true;
      const geo = new GeoService();
      const qLower = q.toLowerCase();

      const raw = await db.freelancerProfile.findMany({
        where: {
          deletedAt: null,
          lat: { not: null },
          lng: { not: null },
          ...(workMode ? { workMode } : {})
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          headline: true,
          bio: true,
          workMode: true,
          city: true,
          country: true,
          lat: true,
          lng: true,
          hourlyRate: true,
          availabilityStatus: true,
          reviewCount: true,
          averageReviewRating: true
        },
        orderBy: { createdAt: "desc" },
        take: 250
      });

      const keywordMatch = (f: (typeof raw)[number]) => {
        if (!qLower) return true;
        const hay = [f.fullName, f.username, f.headline ?? "", f.bio ?? ""].join(" ").toLowerCase();
        return hay.includes(qLower);
      };

      freelancers = raw
        .filter(keywordMatch)
        .map((f) => {
          const flat = Number(f.lat);
          const flng = Number(f.lng);
          const distanceKm = geo.haversineKm(plat, plng, flat, flng);
          const rc = typeof f.reviewCount === "bigint" ? Number(f.reviewCount) : f.reviewCount;
          const ar =
            f.averageReviewRating == null
              ? null
              : typeof f.averageReviewRating === "number"
                ? f.averageReviewRating
                : Number(f.averageReviewRating);

          const row: ClientNearbyFreelancerRow = {
            id: f.id,
            username: f.username,
            fullName: f.fullName,
            headline: f.headline,
            primaryCategoryName: null,
            workMode: f.workMode,
            city: f.city,
            country: f.country,
            hourlyRate: f.hourlyRate != null ? Number(f.hourlyRate) : null,
            availabilityStatus: f.availabilityStatus,
            reviewCount: Number.isFinite(rc) ? rc : 0,
            averageReviewRating: ar != null && Number.isFinite(ar) ? ar : null,
            distanceKm
          };
          return row;
        })
        .filter((f) => (f.distanceKm ?? 0) <= radiusKm)
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
        .slice(0, 48);
    } else if (profile.city?.trim()) {
      discovery = "city";
      const searchService = new SearchService();
      const { items } = await searchService.searchFreelancers({
        page: 1,
        limit: 48,
        city: profile.city.trim(),
        keyword: q || undefined,
        workMode
      });
      freelancers = items.map((item) => ({
        id: item.id,
        username: item.username,
        fullName: item.fullName,
        headline: item.headline,
        primaryCategoryName: item.primaryCategoryName,
        workMode: item.workMode,
        city: item.city,
        country: item.country,
        hourlyRate: item.hourlyRate,
        availabilityStatus: item.availabilityStatus,
        reviewCount: item.reviewCount,
        averageReviewRating: item.averageReviewRating,
        distanceKm: null as number | null
      }));
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <header className="border-b border-slate-200/80 pb-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">NearWork · Client</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-[1.65rem]">
          Nearby talent
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          A hiring-focused view of freelancers around your company anchor—city directory match, or distance-ranked
          when your own listings include coordinates.
        </p>
      </header>

      <ClientNearbyTalentView
        discovery={discovery}
        hasProfile={hasProfile}
        areaLabel={areaLabel}
        radiusKm={radiusKm}
        showRadiusControl={showRadiusControl}
        searchDefaults={{
          q,
          workMode: workMode ?? "",
          radiusKm
        }}
        freelancers={freelancers}
      />
    </div>
  );
}
