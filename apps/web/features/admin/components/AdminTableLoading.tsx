import { NwSkeleton, NwSkeletonSoft } from "@/components/system/LoadingSkeleton";

export function AdminTableLoading({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <NwSkeleton className="h-5 w-52" />
        <NwSkeletonSoft className="h-3 w-full max-w-xl" />
      </div>
      <div className="nw-card overflow-hidden rounded-lg p-0">
        <div className="border-b border-slate-100 px-3.5 py-3">
          <NwSkeleton className="h-8 w-full max-w-2xl" />
        </div>
        <div className="space-y-2 p-3.5">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="grid gap-3 rounded-md border border-slate-100 p-3 sm:grid-cols-4">
              <NwSkeletonSoft className="h-3 w-24" />
              <NwSkeletonSoft className="h-3 w-32" />
              <NwSkeletonSoft className="h-3 w-20" />
              <NwSkeletonSoft className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
