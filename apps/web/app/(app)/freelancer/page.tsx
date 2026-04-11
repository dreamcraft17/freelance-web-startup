import { EmptyStateCard } from "@/features/shared/components/EmptyStateCard";
import { PageHeader } from "@/features/shared/components/PageHeader";

export default function FreelancerDashboardPage() {
  return (
    <>
      <PageHeader
        title="Freelancer overview"
        description="Dashboard metrics and shortcuts will be composed from server-loaded data."
      />
      <EmptyStateCard
        title="No overview data yet"
        description="Connect this view to your analytics or job feed services in the data layer."
      />
    </>
  );
}
