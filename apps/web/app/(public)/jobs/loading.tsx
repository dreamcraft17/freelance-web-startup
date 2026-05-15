import { NwLoadingCardStack, NwLoadingHeader, NwSkeleton, NwSkeletonSoft } from "@/components/system/LoadingSkeleton";

export default function JobsBrowseLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <NwLoadingHeader />
      <div className="mt-5 lg:grid lg:grid-cols-[280px,minmax(0,1fr)] lg:gap-6">
        <aside className="hidden nw-card p-4 lg:block">
          <NwSkeleton className="h-4 w-28" />
          <NwSkeletonSoft className="mt-2 h-4 w-2/3" />
          <div className="mt-4 space-y-2">
            <NwSkeletonSoft className="h-10 w-full rounded-lg" />
            <NwSkeletonSoft className="h-10 w-full rounded-lg" />
            <NwSkeletonSoft className="h-10 w-full rounded-lg" />
          </div>
        </aside>
        <section className="space-y-3">
          <div className="nw-card p-3.5">
            <NwSkeleton className="h-4 w-44" />
            <NwSkeletonSoft className="mt-2 h-3 w-40" />
          </div>
          <NwLoadingCardStack rows={5} />
        </section>
      </div>
    </div>
  );
}

