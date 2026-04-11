import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageHeader } from "@/features/shared/components/PageHeader";
import { EmptyStateCard } from "@/features/shared/components/EmptyStateCard";

export default function ClientJobsPage() {
  return (
    <>
      <PageHeader
        title="My jobs"
        description="List jobs you own. Data comes from your jobs service."
        actions={
          <Button asChild>
            <Link href="/client/jobs/new">Post a job</Link>
          </Button>
        }
      />
      <EmptyStateCard title="No jobs listed" description="Fetch and render job cards from the server layer." />
    </>
  );
}
