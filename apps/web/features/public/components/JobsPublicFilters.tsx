import Link from "next/link";

type WorkMode = "" | "REMOTE" | "ONSITE" | "HYBRID";

export type JobsFilterCategory = { id: string; name: string };

type JobsPublicFiltersProps = {
  keyword: string;
  city: string;
  workMode: WorkMode;
  categoryId: string;
  categories: JobsFilterCategory[];
};

const workModes: { value: WorkMode; label: string }[] = [
  { value: "", label: "Any work mode" },
  { value: "REMOTE", label: "Remote" },
  { value: "ONSITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" }
];

export function JobsPublicFilters({ keyword, city, workMode, categoryId, categories }: JobsPublicFiltersProps) {
  return (
    <div className="nw-discovery-panel">
      <div className="nw-panel-head">
        <div>
          <p className="nw-section-title">Filters</p>
          <p className="text-sm font-semibold text-slate-900">Live board · open roles only</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="submit" form="jobs-filter-form" className="nw-cta-primary px-5 py-2.5">
            Apply
          </button>
          <Link
            href="/jobs"
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Reset
          </Link>
        </div>
      </div>

      <form id="jobs-filter-form" method="get" action="/jobs" className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-end">
        <div className="min-w-0 flex-1 xl:max-w-[220px]">
          <label htmlFor="jobs-kw" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Keyword
          </label>
          <input
            id="jobs-kw"
            name="keyword"
            type="search"
            defaultValue={keyword}
            placeholder="Title or description"
            className="nw-input w-full"
          />
        </div>

        <div className="min-w-0 flex-1 xl:max-w-[200px]">
          <label htmlFor="jobs-cat" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Category
          </label>
          <select
            id="jobs-cat"
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
        </div>

        <div className="min-w-0 flex-1 xl:max-w-[200px]">
          <label htmlFor="jobs-wm" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Work mode
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
            Location
          </label>
          <input
            id="jobs-city"
            name="city"
            type="text"
            defaultValue={city}
            placeholder="City (optional)"
            className="nw-input w-full"
          />
          <p className="mt-1.5 text-[11px] leading-snug text-slate-500">Matches when the job lists a city.</p>
        </div>

        <p className="w-full text-[11px] font-medium text-slate-600">
          Tip: set <span className="font-bold text-slate-800">work mode</span> first, then keyword.
        </p>
      </form>
    </div>
  );
}
