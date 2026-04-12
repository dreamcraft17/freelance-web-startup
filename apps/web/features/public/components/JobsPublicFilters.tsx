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
    <div className="mb-10 rounded-2xl bg-white/90 p-4 shadow-[0_2px_20px_-4px_rgba(53,37,205,0.08)] ring-1 ring-slate-200/60 sm:p-5">
      <form method="get" action="/jobs" className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-end">
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
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200/80 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#3525cd]/35"
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
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200/80 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#3525cd]/35"
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
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200/80 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#3525cd]/35"
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
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200/80 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#3525cd]/35"
          />
          <p className="mt-1.5 text-[11px] leading-snug text-slate-500">Matches when the job lists a city.</p>
        </div>

        <div className="flex flex-wrap gap-2 xl:pb-0.5">
          <button
            type="submit"
            className="rounded-lg bg-[#3525cd] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f46e5]"
          >
            Search
          </button>
          <Link
            href="/jobs"
            className="inline-flex items-center rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200/80"
          >
            Reset
          </Link>
        </div>
      </form>
    </div>
  );
}
