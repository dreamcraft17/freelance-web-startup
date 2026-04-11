import { PageHeader } from "@/features/shared/components/PageHeader";
import { EmptyStateCard } from "@/features/shared/components/EmptyStateCard";

export default function FreelancerNearbyPage() {
  return (
    <>
      <PageHeader
        title="Nearby opportunities"
        description="Surface jobs within radius using your geo search service — not in this component."
      />
      <EmptyStateCard
        title="Map and list"
        description="Compose map + list from search results passed in as props or RSC data fetchers."
      />
    </>
  );
}
