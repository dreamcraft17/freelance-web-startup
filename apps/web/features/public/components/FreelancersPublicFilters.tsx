"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, Navigation, X } from "lucide-react";
import { useI18n } from "@/features/i18n/I18nProvider";
import { useBrowserLocation } from "@/features/public/hooks/useBrowserLocation";
import { popularFreelancerSearchSuggestions } from "@/features/public/lib/popular-search-suggestions";

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
  const { t } = useI18n();
  const router = useRouter();
  const [radius, setRadius] = useState<number>(radiusKm);
  const { state, coords, errorCode, request, clear, setCoords, setState } = useBrowserLocation();
  const workModes: { value: WorkMode; label: string }[] = [
    { value: "", label: t("public.filters.workModeAny") },
    { value: "REMOTE", label: t("public.filters.workModeRemote") },
    { value: "ONSITE", label: t("public.filters.workModeOnSite") },
    { value: "HYBRID", label: t("public.filters.workModeHybrid") }
  ];

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
    <div className="nw-discovery-panel">
      <div className="nw-panel-head">
        <div>
          <p className="nw-section-title">{t("public.filters.title")}</p>
          <p className="text-sm font-semibold text-slate-900">{t("public.freelancers.filtersSubtitle")}</p>
        </div>
        <div className="flex shrink-0 gap-2 sm:pb-0">
          <button type="submit" form="freelancers-filter-form" className="nw-cta-primary px-5 py-2.5">
            {t("public.filters.apply")}
          </button>
          <Link
            href="/freelancers"
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {t("public.filters.reset")}
          </Link>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
          {t("public.freelancers.filterHintRole")}
        </span>
        <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
          {t("public.freelancers.filterHintMode")}
        </span>
        <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
          {t("public.freelancers.filterHintRate")}
        </span>
      </div>

      <form id="freelancers-filter-form" method="get" action="/freelancers" className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-end">
        {activeCoords ? (
          <>
            <input type="hidden" name="lat" value={String(activeCoords.lat)} />
            <input type="hidden" name="lng" value={String(activeCoords.lng)} />
            <input type="hidden" name="radiusKm" value={String(radius)} />
          </>
        ) : null}
        <div className="min-w-0 flex-1 xl:max-w-[220px]">
          <label htmlFor="fl-kw" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("public.filters.keyword")}
          </label>
          <datalist id="fl-kw-suggestions">
            {popularFreelancerSearchSuggestions.map((term) => (
              <option key={term} value={term} />
            ))}
          </datalist>
          <input
            id="fl-kw"
            name="keyword"
            type="search"
            list="fl-kw-suggestions"
            defaultValue={keyword}
                placeholder={t("public.freelancers.keywordPlaceholder")}
            className="nw-input w-full"
          />
          <p className="mt-1.5 text-[11px] font-medium text-slate-500">{t("public.filters.popular")}</p>
          <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
            {popularFreelancerSearchSuggestions.map((term) => (
              <Link
                key={term}
                href={`/freelancers?keyword=${encodeURIComponent(term)}`}
                className="text-[11px] font-semibold text-[#3525cd] hover:underline"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-1 xl:max-w-[200px]">
          <label htmlFor="fl-cat" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("public.filters.category")}
          </label>
          <select
            id="fl-cat"
            name="categoryId"
            defaultValue={categoryId}
            className="nw-input w-full"
          >
            <option value="">{t("public.filters.allCategories")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[11px] leading-snug text-slate-500">
            {t("public.freelancers.categoryHint")}
          </p>
        </div>

        <div className="min-w-0 flex-1 xl:max-w-[200px]">
          <label htmlFor="fl-wm" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("public.filters.workMode")}
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
          <p className="mt-1.5 text-[11px] leading-snug text-slate-500">
            {t("public.freelancers.workModeHint")}
          </p>
        </div>

        <div className="min-w-0 flex-1 xl:max-w-[200px]">
          <label htmlFor="fl-city" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("public.filters.city")}
          </label>
          <input
            id="fl-city"
            name="city"
            type="text"
            defaultValue={city}
            placeholder={t("public.freelancers.cityPlaceholder")}
            className="nw-input w-full"
          />
          <p className="mt-1.5 text-[11px] leading-snug text-slate-500">
            {t("public.freelancers.cityHint")}
          </p>
        </div>

        <div className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-slate-600">
          <span className="font-semibold text-slate-700">{t("public.freelancers.rateGuideLabel")}</span>{" "}
          {t("public.freelancers.rateGuideBody")}
        </div>

        <p className="w-full text-[11px] font-medium text-slate-600 xl:col-span-full">
          {t("public.freelancers.tipPrefix")} <span className="font-bold text-slate-800">{t("public.filters.workModeRemote")}</span>{" "}
          {t("public.freelancers.tipSuffix")}
        </p>
      </form>

      <div className="mt-4 border border-slate-200 border-l-[3px] border-l-[#3525cd] bg-slate-50/90 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Navigation className="h-4 w-4 shrink-0 text-[#3525cd]" aria-hidden />
            <p className="text-sm font-bold text-slate-900">{t("public.freelancers.nearbyTitle")}</p>
            {locationState === "granted" ? (
              <span className="inline-flex items-center rounded border border-[#3525cd]/30 bg-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#3525cd]">
                {t("public.freelancers.nearbyLive")}
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
            {locationState === "requesting" ? t("public.freelancers.nearbyRequesting") : t("public.freelancers.nearbyUseLocation")}
          </button>
        </div>

        {locationState === "granted" && activeCoords ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="text-xs font-medium text-slate-600" htmlFor="nearby-radius">
              {t("public.freelancers.nearbyRadius")}
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
              {t("public.freelancers.nearbyApply")}
            </button>
            <button
              type="button"
              onClick={onClearLocation}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              {t("public.freelancers.nearbyClear")}
            </button>
          </div>
        ) : null}

        {locationState === "idle" ? (
          <p className="mt-2 text-xs text-slate-500">
            {t("public.freelancers.nearbyIdleHint")}
          </p>
        ) : null}
        {locationState === "denied" && errorCode ? (
          <p className="mt-2 text-xs text-amber-700">
            {errorCode === "unsupported"
              ? t("public.freelancers.nearbyErrorUnsupported")
              : errorCode === "permission_denied"
                ? t("public.freelancers.nearbyErrorDenied")
                : t("public.freelancers.nearbyErrorLookup")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
