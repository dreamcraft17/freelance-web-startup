import { PageHeader } from "@/features/shared/components/PageHeader";
import { EmptyStateCard } from "@/features/shared/components/EmptyStateCard";

export default function FreelancerProfilePage() {
  return (
    <>
      <PageHeader title="Profile" description="Edit visibility, skills, and portfolio from your API." />
      <EmptyStateCard title="Profile editor" description="Mount a form that posts to your profile endpoints." />
    </>
  );
}
