import { NwSkeleton, NwSkeletonSoft } from "@/components/system/LoadingSkeleton";

export default function AdminJobsLoading() {
  return (
    <div className="space-y-4">
      <div className="nw-card p-3.5">
        <NwSkeleton className="h-4 w-36" />
        <NwSkeletonSoft className="mt-2 h-3 w-60" />
      </div>
      <div className="nw-card overflow-hidden rounded-lg p-0">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={`admin-jobs-loading-${idx}`} className="grid gap-2 border-b border-slate-100 px-3.5 py-2.5 last:border-b-0 md:grid-cols-4">
            <NwSkeletonSoft className="h-3 w-24" />
            <NwSkeletonSoft className="h-3 w-40" />
            <NwSkeletonSoft className="h-3 w-20" />
            <NwSkeletonSoft className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

