import { NwSkeleton, NwSkeletonSoft } from "@/components/system/LoadingSkeleton";

export default function AdminReportsLoading() {
  return (
    <div className="nw-card overflow-hidden rounded-lg p-0">
      <div className="border-b border-slate-100 px-3.5 py-2.5">
        <NwSkeleton className="h-4 w-48" />
      </div>
      <div className="space-y-2 p-3.5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={`admin-report-skeleton-${idx}`} className="grid gap-2 rounded-md border border-slate-100 p-2.5 md:grid-cols-4">
            <NwSkeletonSoft className="h-3 w-24" />
            <NwSkeletonSoft className="h-3 w-20" />
            <NwSkeletonSoft className="h-3 w-40 md:col-span-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
