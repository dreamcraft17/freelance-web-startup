export default function GlobalLoading() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 pb-10 pt-6 md:px-6 md:pt-8">
      <div className="mb-5 h-3 w-40 animate-pulse rounded bg-slate-200" />
      <div className="h-9 w-72 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-4 w-[28rem] max-w-full animate-pulse rounded bg-slate-200" />

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.9fr),minmax(0,1fr),minmax(0,1fr),auto]">
          <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[260px,minmax(0,1fr),280px] lg:gap-6">
        <div className="hidden rounded-2xl border border-slate-200 bg-white p-4 lg:block">
          {[1, 2, 3, 4].map((row) => (
            <div key={`left-${row}`} className="mb-3 border-t border-slate-100 pt-3">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-3 w-36 animate-pulse rounded bg-slate-100" />
              <div className="mt-1.5 h-3 w-28 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={`center-${row}`} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
              <div className="mt-4 h-4 w-40 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 flex gap-2">
                <div className="h-8 w-24 animate-pulse rounded bg-slate-100" />
                <div className="h-8 w-24 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 hidden space-y-3 lg:mt-0 lg:block">
          {[1, 2, 3].map((row) => (
            <div key={`right-${row}`} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-3 w-44 animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-3 w-36 animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-3 w-40 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
