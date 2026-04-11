import { PageHeader } from "@/features/shared/components/PageHeader";
import { EmptyStateCard } from "@/features/shared/components/EmptyStateCard";

export default function FreelancersDirectoryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <PageHeader title="Find freelancers" description="Directory powered by search/freelancers and filters." />
      <EmptyStateCard title="Directory" description="Populate cards from your search index or database layer." />
    </div>
  );
}
