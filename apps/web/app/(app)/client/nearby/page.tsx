import { PageHeader } from "@/features/shared/components/PageHeader";
import { EmptyStateCard } from "@/features/shared/components/EmptyStateCard";

export default function ClientNearbyTalentPage() {
  return (
    <>
      <PageHeader
        title="Nearby talent"
        description="Discover freelancers by location via your search/geo services."
      />
      <EmptyStateCard title="Results area" description="Pass freelancer cards from a data loader, not inline mocks." />
    </>
  );
}
