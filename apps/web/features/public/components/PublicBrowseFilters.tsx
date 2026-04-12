import Link from "next/link";

type WorkMode = "" | "REMOTE" | "ONSITE" | "HYBRID";

type PublicBrowseFiltersProps = {
  action: "/jobs" | "/freelancers";
  keyword: string;
  city: string;
  workMode: WorkMode;
  /** When true, show a short nearby hint under the city field label area */
  nearbyHint?: boolean;
};

const workModes: { value: WorkMode; label: string }[] = [
  { value: "", label: "Any work mode" },
  { value: "REMOTE", label: "Remote" },
  { value: "ONSITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" }
];

export function PublicBrowseFilters({ action, keyword, city, workMode, nearbyHint }: PublicBrowseFiltersProps) {
  return (
    <div className="mb-10 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-5">
      <form method="get" action={action} className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="min-w-0 flex-1 lg:max-w-xs">
          <label htmlFor="kw" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Keyword
          </label>
          <input
            id="kw"
            name="keyword"
            type="search"
            defaultValue={keyword}
            placeholder="Skill, title, or name"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[#3525cd]/30 focus:ring-2"
          />
        </div>
        <div className="min-w-0 flex-1 lg:max-w-[220px]">
          <label htmlFor="city" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            City
          </label>
          <input
            id="city"
            name="city"
            type="text"
            defaultValue={city}
            placeholder="e.g. Jakarta"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[#3525cd]/30 focus:ring-2"
          />
          {nearbyHint ? (
            <p className="mt-1.5 text-[11px] leading-snug text-slate-500">
              Add a city to bias toward freelancers who list that area—nearby is a first-class filter.
            </p>
          ) : null}
        </div>
        <div className="min-w-0 lg:w-44">
          <label htmlFor="wm" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Work mode
          </label>
          <select
            id="wm"
            name="workMode"
            defaultValue={workMode}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[#3525cd]/30 focus:ring-2"
          >
            {workModes.map((o) => (
              <option key={o.value || "any"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2 lg:pb-0.5">
          <button
            type="submit"
            className="rounded-lg bg-[#3525cd] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#4f46e5]"
          >
            Apply filters
          </button>
          <Link
            href={action}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Clear
          </Link>
        </div>
      </form>
    </div>
  );
}
