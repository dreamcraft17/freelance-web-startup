import { NwLoadingCardStack, NwLoadingHeader, NwSkeletonSoft } from "@/components/system/LoadingSkeleton";

export default function FreelancersBrowseLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <NwLoadingHeader />
      <div className="mt-5 lg:grid lg:grid-cols-[280px,minmax(0,1fr)] lg:gap-6">
        <aside className="hidden nw-card p-4 lg:block">
          <NwSkeletonSoft className="h-10 w-full rounded-lg" />
          <NwSkeletonSoft className="mt-2 h-10 w-full rounded-lg" />
          <NwSkeletonSoft className="mt-2 h-10 w-full rounded-lg" />
        </aside>
        <section className="space-y-3">
          <NwLoadingCardStack rows={5} />
        </section>
      </div>
    </div>
  );
}

