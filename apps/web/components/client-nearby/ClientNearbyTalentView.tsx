import Link from "next/link";
import type { Route } from "next";
import { MapPin, Navigation, Radar, Sparkles, Users } from "lucide-react";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { cn } from "@/lib/utils";

export type ClientNearbyDiscovery = "geo" | "city" | "none";

export type ClientNearbyFreelancerRow = {
  id: string;
  username: string;
  fullName: string;
  headline: string | null;
  primaryCategoryName: string | null;
  workMode: string;
  city: string | null;
  country: string | null;
  hourlyRate: number | null;
  availabilityStatus: string;
  reviewCount: number;
  averageReviewRating: number | null;
  distanceKm: number | null;
};

type ClientNearbyTalentViewProps = {
  discovery: ClientNearbyDiscovery;
  hasProfile: boolean;
  areaLabel: string | null;
  radiusKm: number;
  showRadiusControl: boolean;
  searchDefaults: { q: string; workMode: string; radiusKm: number };
  freelancers: ClientNearbyFreelancerRow[];
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

function formatHourly(rate: number | null): string | null {
  if (rate == null || !Number.isFinite(rate)) return null;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
      rate
    );
  } catch {
    return `$${Math.round(rate)}`;
  }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function ClientNearbyTalentView({
  discovery,
  hasProfile,
  areaLabel,
  radiusKm,
  showRadiusControl,
  searchDefaults,
  freelancers
}: ClientNearbyTalentViewProps) {
  if (!hasProfile) {
    return (
      <DashboardEmptyState
        tone="elevated"
        kicker="Client workspace"
        icon={Users}
        title="Set up your client profile first"
        description="Nearby talent uses your company location to bias results. Complete your client profile with at least a city, or add map pins on jobs for radius-based discovery."
        action={{ label: "Go to settings", href: "/settings" }}
        secondaryAction={{ label: "Back to overview", href: "/client" }}
      />
    );
  }

  if (discovery === "none") {
    return (
      <DashboardEmptyState
        tone="elevated"
        kicker="Location"
        icon={MapPin}
        title="We need a location anchor"
        description="Add a city to your client profile, or publish a job with coordinates. We will match freelancers in that area—or within a radius when a job pin is available."
        action={{ label: "Update settings", href: "/settings" }}
        secondaryAction={{ label: "Post a job", href: "/client/jobs/new" }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-[#3525cd]/[0.07] via-white to-slate-50/90 p-6 shadow-sm ring-1 ring-slate-900/[0.03] md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3525cd] text-white shadow-lg shadow-[#3525cd]/25">
              <Navigation className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3525cd]">Local talent</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                Discover freelancers near you
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                {discovery === "geo"
                  ? "Results are ranked by distance from your most recent job with a map pin. Great for hybrid and on-site briefs where showing up matters."
                  : "Results are scoped to your company city on file—same matching rules as the public directory, tuned for hiring."}
              </p>
            </div>
          </div>
          {areaLabel ? (
            <div className="flex shrink-0 flex-col rounded-xl border border-slate-200/90 bg-white/95 px-4 py-3 shadow-sm lg:min-w-[12rem] lg:text-right">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:justify-end">
                <MapPin className="h-3.5 w-3.5 text-[#3525cd]" aria-hidden />
                Your anchor
              </span>
              <span className="mt-1 text-sm font-semibold text-slate-900">{areaLabel}</span>
              {discovery === "geo" ? (
                <span className="mt-2 inline-flex items-center justify-center rounded-full bg-[#3525cd]/10 px-2.5 py-1 text-xs font-semibold text-[#3525cd] ring-1 ring-[#3525cd]/20 lg:self-end">
                  Radius · {radiusKm} km
                </span>
              ) : (
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500 lg:justify-end">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                  City-scoped search
                </span>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <form
        method="get"
        action="/client/nearby"
        className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.02] md:flex-row md:flex-wrap md:items-end md:gap-4 md:p-5"
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          <label htmlFor="client-nearby-q" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Search
          </label>
          <input
            id="client-nearby-q"
            name="q"
            type="search"
            defaultValue={searchDefaults.q}
            placeholder="Name, headline, or keywords…"
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-[#3525cd]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3525cd]/20"
          />
        </div>
        <div className="w-full space-y-1.5 md:w-44">
          <label htmlFor="client-nearby-mode" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Work mode
          </label>
          <select
            id="client-nearby-mode"
            name="workMode"
            defaultValue={searchDefaults.workMode}
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 shadow-sm focus-visible:border-[#3525cd]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3525cd]/20"
          >
            <option value="">Any</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ONSITE">On-site</option>
          </select>
        </div>
        {showRadiusControl ? (
          <div className="w-full space-y-1.5 md:w-40">
            <label
              htmlFor="client-nearby-radius"
              className="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Radius
            </label>
            <select
              id="client-nearby-radius"
              name="radiusKm"
              defaultValue={String(searchDefaults.radiusKm)}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 shadow-sm focus-visible:border-[#3525cd]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3525cd]/20"
            >
              {[25, 50, 75, 100, 150, 200].map((r) => (
                <option key={r} value={String(r)}>
                  {r} km
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="w-full text-xs leading-relaxed text-slate-500 md:max-w-[14rem] md:self-end md:pb-2">
            Radius appears when at least one of your jobs includes map coordinates—ideal for site visits and hybrid
            teams.
          </p>
        )}
        <div className="flex flex-wrap gap-2 md:ml-auto">
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#3525cd] px-5 text-sm font-semibold text-white shadow-md shadow-[#3525cd]/20 transition hover:bg-[#2d1fb0]"
          >
            Apply filters
          </button>
          <Link
            href={"/client/nearby" as Route}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Reset
          </Link>
        </div>
      </form>

      {freelancers.length === 0 ? (
        <DashboardEmptyState
          tone="elevated"
          kicker="No matches"
          icon={Radar}
          title="No nearby freelancers with these filters"
          description="Try widening the radius, switching work mode, or shortening your search. Talent with public profiles and matching locations will appear here first."
          action={{ label: "Browse all freelancers", href: "/freelancers" }}
          secondaryAction={{ label: "Clear filters", href: "/client/nearby" }}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {freelancers.map((f) => {
            const dist = formatDistance(f.distanceKm);
            const hourly = formatHourly(f.hourlyRate);
            const locationLine = [f.city, f.country].filter(Boolean).join(", ") || "Location on request";
            return (
              <li key={f.id}>
                <Link
                  href={`/freelancers/${f.username}` as Route}
                  className={cn(
                    "flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition",
                    "ring-1 ring-slate-900/[0.02] hover:border-[#3525cd]/30 hover:shadow-md",
                    f.distanceKm != null && f.distanceKm <= 15 ? "ring-2 ring-emerald-200/70" : ""
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3525cd]/15 to-violet-500/10 text-sm font-bold text-[#3525cd] ring-1 ring-[#3525cd]/15">
                      {initials(f.fullName)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">{f.fullName}</p>
                      <p className="truncate text-sm text-slate-500">@{f.username}</p>
                    </div>
                    {dist ? (
                      <span className="shrink-0 rounded-full bg-slate-900/[0.06] px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-800 ring-1 ring-slate-200/80">
                        {dist}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-[#3525cd]/10 px-2.5 py-1 text-xs font-semibold text-[#3525cd] ring-1 ring-[#3525cd]/15">
                        Area match
                      </span>
                    )}
                  </div>
                  {f.headline ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{f.headline}</p>
                  ) : (
                    <p className="mt-3 text-sm italic text-slate-400">No headline yet</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                    <span className="rounded-md bg-slate-50 px-2 py-1 font-medium text-slate-700 ring-1 ring-slate-200/80">
                      {workModeLabel(f.workMode)}
                    </span>
                    {f.primaryCategoryName ? (
                      <span className="rounded-md bg-slate-50 px-2 py-1 font-medium text-slate-700 ring-1 ring-slate-200/80">
                        {f.primaryCategoryName}
                      </span>
                    ) : null}
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                      {locationLine}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    {hourly ? <span className="font-medium text-slate-700">{hourly}/hr</span> : null}
                    {f.reviewCount > 0 ? (
                      <span>
                        ★ {f.averageReviewRating != null ? f.averageReviewRating.toFixed(1) : "—"} · {f.reviewCount}{" "}
                        review{f.reviewCount === 1 ? "" : "s"}
                      </span>
                    ) : (
                      <span>New to NearWork</span>
                    )}
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
