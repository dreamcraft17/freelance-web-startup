import { NwLoadingCardStack, NwLoadingHeader, NwSkeleton, NwSkeletonSoft } from "@/components/system/LoadingSkeleton";

export default function ClientDashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl nw-page-stack">
      <NwLoadingHeader />
      <section className="nw-card-elevated p-5 md:p-6">
        <NwSkeleton className="h-4 w-24" />
        <NwSkeleton className="mt-2 h-8 w-2/3" />
        <NwSkeletonSoft className="mt-2 h-4 w-1/2" />
      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={`client-stat-${idx}`} className="nw-card p-4">
            <NwSkeleton className="h-3 w-20" />
            <NwSkeletonSoft className="mt-2 h-6 w-16" />
          </div>
        ))}
      </div>
      <NwLoadingCardStack rows={3} />
    </div>
  );
}

