import { NwSkeletonSoft } from "@/components/system/LoadingSkeleton";

export default function AdminVerificationLoading() {
  return (
    <div className="nw-card overflow-hidden rounded-lg p-0">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={`admin-verification-loading-${idx}`}
          className="grid gap-2 border-b border-slate-100 px-3.5 py-2.5 last:border-b-0 md:grid-cols-5"
        >
          <NwSkeletonSoft className="h-3 w-24" />
          <NwSkeletonSoft className="h-3 w-44" />
          <NwSkeletonSoft className="h-3 w-20" />
          <NwSkeletonSoft className="h-3 w-24" />
          <NwSkeletonSoft className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

