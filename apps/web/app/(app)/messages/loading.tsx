import { NwLoadingHeader, NwSkeleton, NwSkeletonSoft } from "@/components/system/LoadingSkeleton";

export default function MessagesLoading() {
  return (
    <div className="mx-auto max-w-6xl nw-page-stack">
      <NwLoadingHeader compact />
      <div className="nw-card flex min-h-[min(82dvh,860px)] overflow-hidden rounded-xl">
        <aside className="w-full border-r border-slate-200/80 md:max-w-[360px]">
          <div className="border-b border-slate-100 px-4 py-3">
            <NwSkeleton className="h-4 w-28" />
            <NwSkeletonSoft className="mt-2 h-3 w-36" />
          </div>
          <div className="space-y-2 p-3">
            {Array.from({ length: 7 }).map((_, idx) => (
              <div key={`thread-skeleton-${idx}`} className="rounded-lg border border-slate-100 p-2.5">
                <NwSkeleton className="h-3.5 w-2/3" />
                <NwSkeletonSoft className="mt-1.5 h-3 w-full" />
              </div>
            ))}
          </div>
        </aside>
        <section className="hidden flex-1 flex-col md:flex">
          <div className="border-b border-slate-200/90 px-4 py-3">
            <NwSkeleton className="h-4 w-40" />
          </div>
          <div className="flex-1 space-y-3 p-4">
            <NwSkeletonSoft className="h-12 w-2/3" />
            <NwSkeletonSoft className="h-12 w-1/2" />
            <NwSkeletonSoft className="ml-auto h-12 w-2/5" />
          </div>
        </section>
      </div>
    </div>
  );
}

