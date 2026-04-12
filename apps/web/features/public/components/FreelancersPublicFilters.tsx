import Link from "next/link";

type WorkMode = "" | "REMOTE" | "ONSITE" | "HYBRID";

export type FreelancersFilterCategory = { id: string; name: string };

type FreelancersPublicFiltersProps = {
  keyword: string;
  city: string;
  workMode: WorkMode;
  categoryId: string;
  categories: FreelancersFilterCategory[];
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
  categories
}: FreelancersPublicFiltersProps) {
  return (
    <div className="mb-10 rounded-2xl bg-white/90 p-4 shadow-[0_2px_20px_-4px_rgba(53,37,205,0.08)] ring-1 ring-slate-200/60 sm:p-5">
      <form method="get" action="/freelancers" className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-end">
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
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200/80 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#3525cd]/35"
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
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200/80 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#3525cd]/35"
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
          <label htmlFor="fl-city" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            City
          </label>
          <input
            id="fl-city"
            name="city"
            type="text"
            defaultValue={city}
            placeholder="e.g. Jakarta"
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200/80 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#3525cd]/35"
          />
          <p className="mt-1.5 text-[11px] leading-snug text-slate-500">
            NearWork treats city as a first-class signal for on-site and hybrid work—add yours to discover nearby
            freelancers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 xl:pb-0.5">
          <button
            type="submit"
            className="rounded-lg bg-[#3525cd] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f46e5]"
          >
            Search
          </button>
          <Link
            href="/freelancers"
            className="inline-flex items-center rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200/80"
          >
            Reset
          </Link>
        </div>
      </form>
    </div>
  );
}
