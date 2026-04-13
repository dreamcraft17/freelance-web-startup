import Link from "next/link";
import type { Route } from "next";
import { MapPin, Navigation, Radar } from "lucide-react";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { cn } from "@/lib/utils";

export type NearbyJobDisplay = {
  id: string;
  title: string;
  city: string | null;
  workMode: string;
  distanceKm: number | null;
};

export type FreelancerNearbyDiscovery = "geo" | "city" | "none";

type FreelancerNearbyViewProps = {
  discovery: FreelancerNearbyDiscovery;
  hasProfile: boolean;
  /** Human-readable area, e.g. "Berlin, DE" */
  areaLabel: string | null;
  radiusKm: number;
  showRadiusControl: boolean;
  searchDefaults: { q: string; workMode: string; radiusKm: number };
  jobs: NearbyJobDisplay[];
};

function formatDistance(km: number | null): string | null {
  if (km == null || !Number.isFinite(km)) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

function workModeLabel(mode: string): string {
  switch (mode) {
    case "REMOTE":
      return "Remote";
    case "HYBRID":
      return "Hybrid";
    case "ONSITE":
      return "On-site";
    default:
      return mode;
  }
}

export function FreelancerNearbyView({
  discovery,
  hasProfile,
  areaLabel,
  radiusKm,
  showRadiusControl,
  searchDefaults,
  jobs
}: FreelancerNearbyViewProps) {
  if (!hasProfile) {
    return (
      <DashboardEmptyState
        tone="elevated"
        kicker="NearWork Nearby"
        icon={MapPin}
        title="Add a freelancer profile to use Nearby"
        description="Nearby uses your saved city or map pin to surface open roles. Set your location on your profile, then return here for a focused local feed."
        action={{ label: "Go to profile", href: "/freelancer/profile" }}
        secondaryAction={{ label: "Browse all jobs", href: "/jobs" }}
      />
    );
  }

  if (discovery === "none") {
    return (
      <DashboardEmptyState
        tone="elevated"
        kicker="Location"
        icon={Radar}
        title="We need a place to anchor Nearby"
        description="Add a city or set your map coordinates on your profile. NearWork will match open jobs in that area—or within a radius when a pin is saved."
        action={{ label: "Update profile location", href: "/freelancer/profile" }}
        secondaryAction={{ label: "Browse all jobs", href: "/jobs" }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200/90 bg-gradient-to-br from-[#3525cd]/[0.06] via-white to-slate-50/80 p-5 shadow-sm ring-1 ring-slate-100/90 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3525cd] text-white shadow-md">
              <Navigation className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#3525cd]">NearWork Nearby</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">Discovery anchored to you</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {discovery === "geo"
                  ? "Open roles are ranked by straight-line distance from your profile pin. Onsite and hybrid posts surface first when they are close."
                  : "Open roles are filtered to your profile city. Add coordinates later for radius-based matching."}
              </p>
            </div>
          </div>
          {areaLabel ? (
            <div className="flex shrink-0 flex-col items-stretch rounded-lg border border-slate-200/90 bg-white/90 px-4 py-3 text-left shadow-sm sm:items-end sm:text-right">
              <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-[#3525cd]" aria-hidden />
                Your area
              </span>
              <span className="mt-1 text-sm font-semibold text-slate-900">{areaLabel}</span>
              {discovery === "geo" ? (
                <span className="mt-2 inline-flex items-center rounded-full bg-[#3525cd]/10 px-2.5 py-0.5 text-xs font-semibold text-[#3525cd] ring-1 ring-[#3525cd]/20">
                  Radius · {radiusKm} km
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <form
        method="get"
        action="/freelancer/nearby"
        className="flex flex-col gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm md:flex-row md:flex-wrap md:items-end"
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          <label htmlFor="nearby-q" className="text-xs font-medium text-slate-500">
            Search titles
          </label>
          <input
            id="nearby-q"
            name="q"
            type="search"
            defaultValue={searchDefaults.q}
            placeholder="e.g. React, brand, onsite…"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="w-full space-y-1.5 md:w-40">
          <label htmlFor="nearby-mode" className="text-xs font-medium text-slate-500">
            Work mode
          </label>
          <select
            id="nearby-mode"
            name="workMode"
            defaultValue={searchDefaults.workMode}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Any</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ONSITE">On-site</option>
          </select>
        </div>
        {showRadiusControl ? (
          <div className="w-full space-y-1.5 md:w-36">
            <label htmlFor="nearby-radius" className="text-xs font-medium text-slate-500">
              Radius
            </label>
            <select
              id="nearby-radius"
              name="radiusKm"
              defaultValue={String(searchDefaults.radiusKm)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {[25, 50, 75, 100, 150].map((r) => (
                <option key={r} value={String(r)}>
                  {r} km
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="w-full text-xs text-slate-500 md:max-w-[12rem] md:self-end md:pb-2">
            Radius controls unlock when your profile includes a map pin.
          </p>
        )}
        <div className="flex gap-2 md:ml-auto">
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-md bg-[#3525cd] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d1fb0]"
          >
            Apply
          </button>
          <Link
            href={"/freelancer/nearby" as Route}
            className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Reset
          </Link>
        </div>
      </form>

      {jobs.length === 0 ? (
        <DashboardEmptyState
          tone="elevated"
          kicker="No matches"
          icon={Radar}
          title="Nothing nearby with these filters"
          description="Try widening the radius, clearing work mode, or searching a shorter keyword. New roles appear on the board as clients publish them."
          action={{ label: "Browse all jobs", href: "/jobs" }}
          secondaryAction={{ label: "Clear filters", href: "/freelancer/nearby" }}
        />
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => {
            const dist = formatDistance(job.distanceKm);
            return (
              <li key={job.id}>
                <Link
                  href={`/jobs/${job.id}` as Route}
                  className={cn(
                    "block rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:border-[#3525cd]/25 hover:shadow-md md:p-5",
                    job.distanceKm != null && job.distanceKm <= 15
                      ? "ring-1 ring-emerald-200/60"
                      : "ring-1 ring-slate-100/80"
                  )}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-base font-semibold leading-snug text-slate-900">{job.title}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {workModeLabel(job.workMode)}
                        {job.city ? ` · ${job.city}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                      {dist ? (
                        <span className="inline-flex items-center rounded-full bg-slate-900/[0.06] px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-800 ring-1 ring-slate-200/80">
                          {dist} away
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-[#3525cd]/10 px-2.5 py-1 text-xs font-semibold text-[#3525cd] ring-1 ring-[#3525cd]/15">
                          Area match
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
