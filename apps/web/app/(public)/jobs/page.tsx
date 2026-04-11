import { PageHeader } from "@/features/shared/components/PageHeader";
import { EmptyStateCard } from "@/features/shared/components/EmptyStateCard";

export default function JobsBrowsePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <PageHeader title="Browse jobs" description="Filters and results should load via your search/jobs API." />
      <EmptyStateCard title="Job feed" description="Use server components or hooks to hydrate this list." />
    </div>
  );
}
