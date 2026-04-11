import Link from "next/link";
import { PageHeader } from "@/features/shared/components/PageHeader";

export default function JobNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title="Job not found"
        description="This job may have been filled, closed, or the link is incorrect."
      />
      <p className="text-muted-foreground mt-6 text-sm">
        <Link href="/jobs" className="text-foreground font-medium underline-offset-4 hover:underline">
          Back to browse jobs
        </Link>
      </p>
    </div>
  );
}
