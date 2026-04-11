import { PageHeader } from "@/features/shared/components/PageHeader";
import { EmptyStateCard } from "@/features/shared/components/EmptyStateCard";

export default function ClientNewJobPage() {
  return (
    <>
      <PageHeader title="Post a job" description="Multi-step job wizard should post to your jobs API." />
      <EmptyStateCard title="Job form placeholder" description="Replace with a validated form module in features/jobs." />
    </>
  );
}
