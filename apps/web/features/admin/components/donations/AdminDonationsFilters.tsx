type AdminDonationsFiltersProps = {
  provider?: string;
  currency?: string;
  q?: string;
  providerOptions: string[];
  currencyOptions: string[];
};

export function AdminDonationsFilters({
  provider,
  currency,
  q,
  providerOptions,
  currencyOptions
}: AdminDonationsFiltersProps) {
  return (
    <form
      method="get"
      action="/admin/donations"
      className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <label className="flex min-w-[8rem] flex-1 flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Provider</span>
        <select
          name="provider"
          defaultValue={provider ?? ""}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-[#3525cd] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
        >
          <option value="">All</option>
          {providerOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-[8rem] flex-1 flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Currency</span>
        <select
          name="currency"
          defaultValue={currency ?? ""}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-[#3525cd] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
        >
          <option value="">All</option>
          {currencyOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-[12rem] flex-[1.2] flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">User email contains</span>
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Donor email…"
          autoComplete="off"
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-[#3525cd] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
        />
      </label>

      <div className="flex flex-wrap gap-2 sm:pb-0.5">
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Apply
        </button>
        <a
          href="/admin/donations"
          className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Reset
        </a>
      </div>
    </form>
  );
}
