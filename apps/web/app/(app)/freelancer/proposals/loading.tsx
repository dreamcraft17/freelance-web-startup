import { NwLoadingHeader, NwLoadingCardStack } from "@/components/system/LoadingSkeleton";

export default function FreelancerProposalsLoading() {
  return (
    <div className="mx-auto max-w-5xl nw-page-stack pb-12">
      <NwLoadingHeader compact />
      <NwLoadingCardStack rows={4} />
    </div>
  );
}

