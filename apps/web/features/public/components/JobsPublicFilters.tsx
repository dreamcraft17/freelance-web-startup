"use client";

import Link from "next/link";
import { useI18n } from "@/features/i18n/I18nProvider";
import { popularJobSearchSuggestions } from "@/features/public/lib/popular-search-suggestions";

type WorkMode = "" | "REMOTE" | "ONSITE" | "HYBRID";

export type JobsFilterCategory = { id: string; name: string };

type JobsPublicFiltersProps = {
  keyword: string;
  city: string;
  workMode: WorkMode;
  categoryId: string;
  minBudget: string;
  postedWithinDays: string;
  categories: JobsFilterCategory[];
};

export function JobsPublicFilters({
  keyword,
  city,
  workMode,
  categoryId,
  minBudget,
  postedWithinDays,
  categories
}: JobsPublicFiltersProps) {
  const { t } = useI18n();
  const workModes: { value: WorkMode; label: string }[] = [
    { value: "", label: t("public.filters.workModeAny") },
    { value: "REMOTE", label: t("public.filters.workModeRemote") },
    { value: "ONSITE", label: t("public.filters.workModeOnSite") },
    { value: "HYBRID", label: t("public.filters.workModeHybrid") }
  ];

  return (
    <div className="nw-discovery-panel">
      <div className="nw-panel-head">
        <div>
          <p className="nw-section-title">{t("public.filters.title")}</p>
          <p className="text-sm font-semibold text-slate-900">{t("public.jobs.filtersSubtitle")}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="submit" form="jobs-filter-form" className="nw-cta-primary px-5 py-2.5">
            {t("public.filters.apply")}
          </button>
          <Link
            href="/jobs"
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {t("public.filters.reset")}
          </Link>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
          {t("public.jobs.filterHintRelevant")}
        </span>
        <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
          {t("public.jobs.filterHintBudget")}
        </span>
        <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
          {t("public.jobs.filterHintRecent")}
        </span>
      </div>

      <form id="jobs-filter-form" method="get" action="/jobs" className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-end">
        <div className="min-w-0 flex-1 xl:max-w-[220px]">
          <label htmlFor="jobs-kw" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("public.filters.keyword")}
          </label>
          <datalist id="jobs-kw-suggestions">
            {popularJobSearchSuggestions.map((term) => (
              <option key={term} value={term} />
            ))}
          </datalist>
          <input
            id="jobs-kw"
            name="keyword"
            type="search"
            list="jobs-kw-suggestions"
            defaultValue={keyword}
            placeholder={t("public.jobs.keywordPlaceholder")}
            className="nw-input w-full"
          />
          <p className="mt-1.5 text-[11px] font-medium text-slate-500">{t("public.filters.popular")}</p>
          <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
            {popularJobSearchSuggestions.map((term) => (
              <Link
                key={term}
                href={`/jobs?keyword=${encodeURIComponent(term)}`}
                className="text-[11px] font-semibold text-[#3525cd] hover:underline"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-1 xl:max-w-[200px]">
          <label htmlFor="jobs-cat" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("public.filters.category")}
          </label>
          <select
            id="jobs-cat"
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
        </div>

        <div className="min-w-0 flex-1 xl:max-w-[200px]">
          <label htmlFor="jobs-min-budget" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("public.jobs.budgetFilterLabel")}
          </label>
          <select id="jobs-min-budget" name="minBudget" defaultValue={minBudget} className="nw-input w-full">
            <option value="">{t("public.jobs.budgetFilterAny")}</option>
            <option value="500000">{t("public.jobs.budgetFilter500k")}</option>
            <option value="1000000">{t("public.jobs.budgetFilter1m")}</option>
            <option value="3000000">{t("public.jobs.budgetFilter3m")}</option>
          </select>
        </div>

        <div className="min-w-0 flex-1 xl:max-w-[200px]">
          <label htmlFor="jobs-posted" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("public.jobs.postedFilterLabel")}
          </label>
          <select id="jobs-posted" name="postedWithinDays" defaultValue={postedWithinDays} className="nw-input w-full">
            <option value="">{t("public.jobs.postedFilterAny")}</option>
            <option value="1">{t("public.jobs.postedFilter24h")}</option>
            <option value="7">{t("public.jobs.postedFilter7d")}</option>
            <option value="30">{t("public.jobs.postedFilter30d")}</option>
          </select>
        </div>

        <div className="min-w-0 flex-1 xl:max-w-[200px]">
          <label htmlFor="jobs-wm" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("public.filters.workMode")}
          </label>
          <select
            id="jobs-wm"
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
          <label htmlFor="jobs-city" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("public.filters.location")}
          </label>
          <input
            id="jobs-city"
            name="city"
            type="text"
            defaultValue={city}
            placeholder={t("public.filters.cityPlaceholder")}
            className="nw-input w-full"
          />
          <p className="mt-1.5 text-[11px] leading-snug text-slate-500">{t("public.jobs.locationHint")}</p>
        </div>

        <p className="w-full text-[11px] font-medium text-slate-600">
          {t("public.jobs.tipPrefix")} <span className="font-bold text-slate-800">{t("public.filters.workModeLower")}</span>{" "}
          {t("public.jobs.tipSuffix")}
        </p>
      </form>
    </div>
  );
}
