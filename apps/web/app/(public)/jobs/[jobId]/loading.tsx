import { NwLoadingCardStack, NwSkeleton, NwSkeletonSoft } from "@/components/system/LoadingSkeleton";

export default function JobDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),320px] lg:items-start">
        <div className="space-y-5">
          <section className="nw-card p-5">
            <div className="flex flex-wrap gap-2">
              <div className="nw-skeleton-chip w-16" />
              <div className="nw-skeleton-chip w-24" />
              <div className="nw-skeleton-chip w-20" />
            </div>
            <NwSkeleton className="mt-3 h-8 w-5/6" />
            <NwSkeleton className="mt-2 h-6 w-48" />
            <NwSkeletonSoft className="mt-3 h-4 w-2/3" />
          </section>
          <section className="nw-skeleton-card">
            <NwSkeleton className="h-4 w-40" />
            <NwSkeletonSoft className="mt-2 h-4 w-2/3" />
            <NwSkeletonSoft className="mt-4 h-16 w-full" />
          </section>
          <NwLoadingCardStack rows={2} />
        </div>
        <aside className="nw-card-inset space-y-3 p-4">
          <NwSkeleton className="h-4 w-36" />
          <NwSkeletonSoft className="h-12 w-full" />
          <NwSkeletonSoft className="h-10 w-full" />
          <NwSkeletonSoft className="h-10 w-full" />
        </aside>
      </div>
    </div>
  );
}
