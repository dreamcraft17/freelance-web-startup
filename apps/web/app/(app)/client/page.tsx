import { EmptyStateCard } from "@/features/shared/components/EmptyStateCard";
import { PageHeader } from "@/features/shared/components/PageHeader";

export default function ClientDashboardPage() {
  return (
    <>
      <PageHeader
        title="Client overview"
        description="Hiring pipeline widgets belong in server components or hooks backed by real APIs."
      />
      <EmptyStateCard
        title="No hiring data yet"
        description="Load open jobs, invites, and spend summaries from your backend."
      />
    </>
  );
}
