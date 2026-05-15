import { NwLoadingCardStack, NwSkeleton, NwSkeletonSoft } from "@/components/system/LoadingSkeleton";

export default function FreelancerProfileLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),320px] lg:items-start">
        <main className="space-y-5">
          <section className="nw-card p-5">
            <div className="flex gap-4">
              <NwSkeleton className="h-20 w-20 rounded-2xl" />
              <div className="min-w-0 flex-1">
                <NwSkeleton className="h-7 w-2/3" />
                <NwSkeletonSoft className="mt-2 h-4 w-3/4" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <div className="nw-skeleton-chip w-20" />
                  <div className="nw-skeleton-chip w-24" />
                  <div className="nw-skeleton-chip w-16" />
                </div>
              </div>
            </div>
          </section>
          <NwLoadingCardStack rows={4} />
        </main>
        <aside className="nw-card-inset space-y-3 p-4">
          <NwSkeleton className="h-4 w-28" />
          <NwSkeletonSoft className="h-10 w-full" />
          <NwSkeletonSoft className="h-10 w-full" />
          <NwSkeletonSoft className="h-10 w-full" />
          <NwSkeletonSoft className="h-10 w-full" />
        </aside>
      </div>
    </div>
  );
}

