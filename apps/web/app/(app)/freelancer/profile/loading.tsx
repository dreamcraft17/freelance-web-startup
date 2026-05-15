import { NwLoadingHeader, NwSkeleton, NwSkeletonSoft } from "@/components/system/LoadingSkeleton";

export default function FreelancerProfileEditorLoading() {
  return (
    <div className="mx-auto max-w-3xl nw-page-stack pb-24">
      <NwLoadingHeader compact />
      <section className="nw-card p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <NwSkeletonSoft className="h-11 rounded-lg" />
          <NwSkeletonSoft className="h-11 rounded-lg" />
          <NwSkeletonSoft className="h-11 rounded-lg sm:col-span-2" />
          <NwSkeletonSoft className="h-24 rounded-lg sm:col-span-2" />
        </div>
        <div className="mt-4 flex gap-2">
          <NwSkeleton className="h-10 w-32 rounded-lg" />
          <NwSkeletonSoft className="h-10 w-28 rounded-lg" />
        </div>
      </section>
    </div>
  );
}

