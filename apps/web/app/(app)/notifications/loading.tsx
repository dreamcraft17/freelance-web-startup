import { NwLoadingHeader, NwSkeleton, NwSkeletonSoft } from "@/components/system/LoadingSkeleton";

export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-xl space-y-6 pb-12">
      <NwLoadingHeader compact />
      <div className="flex flex-wrap gap-2">
        <div className="nw-skeleton-chip w-24 rounded-full" />
        <div className="nw-skeleton-chip w-28 rounded-full" />
        <div className="nw-skeleton-chip w-24 rounded-full" />
      </div>
      <div className="nw-card divide-y divide-slate-100 overflow-hidden rounded-xl">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={`notif-skeleton-${idx}`} className="flex gap-2.5 px-3.5 py-3">
            <NwSkeleton className="h-10 w-10 rounded-xl" />
            <div className="min-w-0 flex-1">
              <NwSkeleton className="h-3.5 w-2/3" />
              <NwSkeletonSoft className="mt-1.5 h-3 w-full" />
              <NwSkeletonSoft className="mt-1 h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

