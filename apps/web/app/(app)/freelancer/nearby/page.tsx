import { redirect } from "next/navigation";
import { db } from "@acme/database";
import { JobStatus, JobVisibility, WorkMode } from "@acme/types";
import { getSessionFromCookies } from "@src/lib/auth";
import {
  FreelancerNearbyView,
  type FreelancerNearbyDiscovery,
  type NearbyJobDisplay
} from "@/components/freelancer/FreelancerNearbyView";
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

export default async function FreelancerNearbyPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?returnUrl=/freelancer/nearby");
  }

  const sp = pick(await searchParams);
  const q = (sp.q ?? "").trim();
  const workModeRaw = sp.workMode ?? "";
  const workMode =
    workModeRaw === "REMOTE" || workModeRaw === "ONSITE" || workModeRaw === "HYBRID"
      ? (workModeRaw as WorkMode)
      : undefined;
  const radiusFromUrl = clampRadius(parseInt(sp.radiusKm ?? "", 10));

  const profile = await db.freelancerProfile.findFirst({
    where: { userId: session.userId, deletedAt: null },
    select: {
      city: true,
      region: true,
      country: true,
      lat: true,
      lng: true,
      serviceRadiusKm: true
    }
  });

  const profileRadiusDefault = profile?.serviceRadiusKm != null ? clampRadius(profile.serviceRadiusKm) : 75;
  const radiusKm = sp.radiusKm ? radiusFromUrl : profileRadiusDefault;

  const areaLabel = profile ? areaParts(profile.city, profile.region, profile.country) : null;

  let discovery: FreelancerNearbyDiscovery = "none";
  let jobs: NearbyJobDisplay[] = [];

  if (profile) {
    const plat = profile.lat != null ? Number(profile.lat) : null;
    const plng = profile.lng != null ? Number(profile.lng) : null;

    if (plat != null && plng != null && Number.isFinite(plat) && Number.isFinite(plng)) {
      discovery = "geo";
      const geo = new GeoService();
      const rawJobs = await db.job.findMany({
        where: {
          status: JobStatus.OPEN,
          visibility: JobVisibility.PUBLIC,
          deletedAt: null,
          lat: { not: null },
          lng: { not: null }
        },
        select: {
          id: true,
          title: true,
          city: true,
          workMode: true,
          lat: true,
          lng: true
        },
        orderBy: { createdAt: "desc" },
        take: 200
      });

      const qLower = q.toLowerCase();
      jobs = rawJobs
        .map((j) => {
          const jlat = Number(j.lat);
          const jlng = Number(j.lng);
          const distanceKm = geo.haversineKm(plat, plng, jlat, jlng);
          return {
            id: j.id,
            title: j.title,
            city: j.city,
            workMode: j.workMode,
            distanceKm
          };
        })
        .filter((j) => j.distanceKm <= radiusKm)
        .filter((j) => (workMode ? j.workMode === workMode : true))
        .filter((j) => (!qLower ? true : j.title.toLowerCase().includes(qLower)))
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 40);
    } else if (profile.city?.trim()) {
      discovery = "city";
      const searchService = new SearchService();
      const { items } = await searchService.listPublicOpenJobsPaginated({
        page: 1,
        limit: 40,
        city: profile.city.trim(),
        keyword: q || undefined,
        workMode
      });
      jobs = items
        .filter((item) => (workMode ? item.workMode === workMode : true))
        .map((item) => ({
          id: item.id,
          title: item.title,
          city: item.city,
          workMode: item.workMode,
          distanceKm: null as number | null
        }));
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <header className="border-b border-slate-200/80 pb-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Freelancer</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 md:text-[1.65rem]">
          Nearby
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
          NearWork Nearby keeps local and hybrid work in focus—anchored to your profile location and the radius you
          choose, with the same open roles you will see on the public job board.
        </p>
      </header>

      <FreelancerNearbyView
        discovery={discovery}
        hasProfile={Boolean(profile)}
        areaLabel={areaLabel}
        radiusKm={radiusKm}
        showRadiusControl={discovery === "geo"}
        searchDefaults={{
          q,
          workMode: workMode ?? "",
          radiusKm
        }}
        jobs={jobs}
      />
    </div>
  );
}
