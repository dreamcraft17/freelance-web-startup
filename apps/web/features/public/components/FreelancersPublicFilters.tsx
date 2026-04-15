"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, Navigation, X } from "lucide-react";
import { useBrowserLocation } from "@/features/public/hooks/useBrowserLocation";

type WorkMode = "" | "REMOTE" | "ONSITE" | "HYBRID";

export type FreelancersFilterCategory = { id: string; name: string };

type FreelancersPublicFiltersProps = {
  keyword: string;
  city: string;
  workMode: WorkMode;
  categoryId: string;
  categories: FreelancersFilterCategory[];
  lat?: number | null;
  lng?: number | null;
  radiusKm?: number;
};

const workModes: { value: WorkMode; label: string }[] = [
  { value: "", label: "Any work mode" },
  { value: "REMOTE", label: "Remote" },
  { value: "ONSITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" }
];

export function FreelancersPublicFilters({
  keyword,
  city,
  workMode,
  categoryId,
  categories,
  lat = null,
  lng = null,
  radiusKm = 50
}: FreelancersPublicFiltersProps) {
  const router = useRouter();
  const [radius, setRadius] = useState<number>(radiusKm);
  const { state, coords, error, request, clear, setCoords, setState } = useBrowserLocation();

  const activeCoords = useMemo(() => {
    if (coords) return coords;
    if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
    return null;
  }, [coords, lat, lng]);

  const locationState = useMemo(() => {
    if (state === "requesting") return "requesting";
    if (state === "denied") return "denied";
    if (activeCoords) return "granted";
    return "idle";
  }, [activeCoords, state]);

  function buildQuery(next: {
    keyword: string;
    city: string;
    workMode: WorkMode;
    categoryId: string;
    lat?: number | null;
    lng?: number | null;
    radiusKm?: number;
  }) {
    const q = new URLSearchParams();
    if (next.keyword.trim()) q.set("keyword", next.keyword.trim());
    if (next.city.trim()) q.set("city", next.city.trim());
    if (next.workMode) q.set("workMode", next.workMode);
    if (next.categoryId.trim()) q.set("categoryId", next.categoryId.trim());
    if (next.lat != null && next.lng != null) {
      q.set("lat", String(next.lat));
      q.set("lng", String(next.lng));
      q.set("radiusKm", String(next.radiusKm ?? radius));
    }
    return q.toString();
  }

  const onUseLocation = () => {
    request();
  };

  const onClearLocation = () => {
    clear();
    setCoords(null);
    setState("idle");
    const query = buildQuery({ keyword, city, workMode, categoryId, lat: null, lng: null });
    router.push(query ? `/freelancers?${query}` : "/freelancers");
  };

  const onApplyLocation = () => {
    if (!activeCoords) return;
    const query = buildQuery({
      keyword,
      city,
      workMode,
      categoryId,
      lat: activeCoords.lat,
      lng: activeCoords.lng,
      radiusKm: radius
    });
    router.push(`/freelancers?${query}`);
  };

  useEffect(() => {
    if (!coords || state !== "granted") return;
    const query = buildQuery({
      keyword,
      city,
      workMode,
      categoryId,
      lat: coords.lat,
      lng: coords.lng,
      radiusKm: radius
    });
    router.push(`/freelancers?${query}`);
    // only react when browser-granted coordinates arrive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  return (
    <div className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5">
      <form method="get" action="/freelancers" className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-end">
        {activeCoords ? (
          <>
            <input type="hidden" name="lat" value={String(activeCoords.lat)} />
            <input type="hidden" name="lng" value={String(activeCoords.lng)} />
            <input type="hidden" name="radiusKm" value={String(radius)} />
          </>
        ) : null}
        <div className="min-w-0 flex-1 xl:max-w-[220px]">
          <label htmlFor="fl-kw" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Keyword
          </label>
          <input
            id="fl-kw"
            name="keyword"
            type="search"
            defaultValue={keyword}
            placeholder="Name, headline, or bio"
            className="nw-input w-full"
          />
        </div>

        <div className="min-w-0 flex-1 xl:max-w-[200px]">
          <label htmlFor="fl-cat" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Category
          </label>
          <select
            id="fl-cat"
            name="categoryId"
            defaultValue={categoryId}
            className="nw-input w-full"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[11px] leading-snug text-slate-500">
            Matches anyone with at least one skill in that category.
          </p>
        </div>

        <div className="min-w-0 flex-1 xl:max-w-[200px]">
          <label htmlFor="fl-wm" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Work mode
          </label>
          <select
            id="fl-wm"
            name="workMode"
            defaultValue={workMode}
            className="nw-input w-full"
          >
            {workModes.map((o) => (
              <option key={o.value || "any"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0 flex-1 xl:max-w-[200px]">
          <label htmlFor="fl-city" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            City
          </label>
          <input
            id="fl-city"
            name="city"
            type="text"
            defaultValue={city}
            placeholder="e.g. Jakarta"
            className="nw-input w-full"
          />
          <p className="mt-1.5 text-[11px] leading-snug text-slate-500">
            NearWork treats city as a first-class signal for on-site and hybrid work—add yours to discover nearby
            freelancers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 xl:pb-0.5">
          <button
            type="submit"
            className="nw-cta-primary px-5 py-2.5"
          >
            Search
          </button>
          <Link
            href="/freelancers"
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Navigation className="h-4 w-4 shrink-0 text-[#3525cd]" aria-hidden />
            <p className="text-sm font-medium text-slate-800">Find nearby talent</p>
            {locationState === "granted" ? (
              <span className="inline-flex items-center rounded-md bg-[#3525cd]/10 px-2 py-0.5 text-[11px] font-semibold text-[#3525cd] ring-1 ring-[#3525cd]/15">
                Nearby active
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onUseLocation}
            disabled={locationState === "requesting"}
            className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {locationState === "requesting" ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <MapPin className="h-3.5 w-3.5" aria-hidden />}
            {locationState === "requesting" ? "Requesting..." : "Use my location"}
          </button>
        </div>

        {locationState === "granted" && activeCoords ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="text-xs font-medium text-slate-600" htmlFor="nearby-radius">
              Radius
            </label>
            <select
              id="nearby-radius"
              value={String(radius)}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
            >
              {[10, 25, 50, 75, 100, 150].map((r) => (
                <option key={r} value={r}>
                  {r} km
                </option>
              ))}
            </select>
            <button type="button" onClick={onApplyLocation} className="rounded-md bg-[#3525cd] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#4f46e5]">
              Apply nearby
            </button>
            <button
              type="button"
              onClick={onClearLocation}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              Clear location
            </button>
          </div>
        ) : null}

        {locationState === "idle" ? (
          <p className="mt-2 text-xs text-slate-500">
            Optional: allow browser location to prioritize freelancers close to you. City search remains available.
          </p>
        ) : null}
        {locationState === "denied" && error ? <p className="mt-2 text-xs text-amber-700">{error}</p> : null}
      </div>
    </div>
  );
}
