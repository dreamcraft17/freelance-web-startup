import { NwSkeletonSoft } from "@/components/system/LoadingSkeleton";

export default function AdminUsersLoading() {
  return (
    <div className="nw-card overflow-hidden rounded-lg p-0">
      {Array.from({ length: 7 }).map((_, idx) => (
        <div key={`admin-users-loading-${idx}`} className="grid gap-2 border-b border-slate-100 px-3.5 py-2.5 last:border-b-0 md:grid-cols-4">
          <NwSkeletonSoft className="h-3 w-24" />
          <NwSkeletonSoft className="h-3 w-52" />
          <NwSkeletonSoft className="h-3 w-16" />
          <NwSkeletonSoft className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

