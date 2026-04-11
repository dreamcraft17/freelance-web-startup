import { PageHeader } from "@/features/shared/components/PageHeader";
import { EmptyStateCard } from "@/features/shared/components/EmptyStateCard";

type PageProps = {
  params: Promise<{ username: string }> | { username: string };
};

export default async function FreelancerPublicProfilePage({ params }: PageProps) {
  const { username } = await Promise.resolve(params);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title={`@${username}`}
        description="Public profile content is loaded outside this presentational shell."
      />
      <EmptyStateCard title="Portfolio & reviews" description="Compose from freelancer profile and review APIs." />
    </div>
  );
}
