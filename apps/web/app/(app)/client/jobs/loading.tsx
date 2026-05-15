import { NwLoadingHeader, NwLoadingCardStack } from "@/components/system/LoadingSkeleton";

export default function ClientJobsLoading() {
  return (
    <div className="mx-auto max-w-5xl nw-page-stack pb-10">
      <NwLoadingHeader compact />
      <NwLoadingCardStack rows={5} />
    </div>
  );
}

