import { PageHeader } from "@/features/shared/components/PageHeader";
import { EmptyStateCard } from "@/features/shared/components/EmptyStateCard";

export default function FreelancerProposalsPage() {
  return (
    <>
      <PageHeader title="Proposals" description="Track bids and responses from the proposals service." />
      <EmptyStateCard title="No proposals loaded" description="Render rows from your bids API or server components." />
    </>
  );
}
