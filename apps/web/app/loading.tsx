import { NwLoadingCardStack, NwLoadingHeader, NwSkeleton, NwSkeletonSoft } from "@/components/system/LoadingSkeleton";

export default function GlobalLoading() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 pb-10 pt-6 md:px-6 md:pt-8">
      <NwLoadingHeader />

      <div className="nw-card mt-5 rounded-2xl p-4 md:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.9fr),minmax(0,1fr),minmax(0,1fr),auto]">
          <NwSkeletonSoft className="h-11 rounded-lg" />
          <NwSkeletonSoft className="h-11 rounded-lg" />
          <NwSkeletonSoft className="h-11 rounded-lg" />
          <NwSkeletonSoft className="h-11 rounded-lg" />
        </div>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[260px,minmax(0,1fr),280px] lg:gap-6">
        <div className="hidden nw-card rounded-2xl p-4 lg:block">
          {[1, 2, 3, 4].map((row) => (
            <div key={`left-${row}`} className="mb-3 border-t border-slate-100 pt-3">
              <NwSkeleton className="h-4 w-24" />
              <NwSkeletonSoft className="mt-2 h-3 w-36" />
              <NwSkeletonSoft className="mt-1.5 h-3 w-28" />
            </div>
          ))}
        </div>

        <NwLoadingCardStack rows={5} />

        <div className="mt-4 hidden space-y-3 lg:mt-0 lg:block">
          {[1, 2, 3].map((row) => (
            <div key={`right-${row}`} className="nw-card rounded-2xl p-4">
              <NwSkeleton className="h-4 w-24" />
              <NwSkeletonSoft className="mt-3 h-3 w-44" />
              <NwSkeletonSoft className="mt-2 h-3 w-36" />
              <NwSkeletonSoft className="mt-2 h-3 w-40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
