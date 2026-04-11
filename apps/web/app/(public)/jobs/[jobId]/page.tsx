import { PageHeader } from "@/features/shared/components/PageHeader";
import { EmptyStateCard } from "@/features/shared/components/EmptyStateCard";

type PageProps = {
  params: Promise<{ jobId: string }> | { jobId: string };
};

export default async function JobDetailPage({ params }: PageProps) {
  const { jobId } = await Promise.resolve(params);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <PageHeader title={`Job ${jobId}`} description="Load job details by id from JobService in a parent loader." />
      <EmptyStateCard title="Job detail" description="Render description, budget, and apply CTA from fetched data." />
    </div>
  );
}
