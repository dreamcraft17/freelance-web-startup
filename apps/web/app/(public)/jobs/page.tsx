import { PageHeader } from "@/features/shared/components/PageHeader";
import { JobService } from "@/server/services/job.service";
import { JobsBrowseGrid, type SerializableJobCard } from "@/features/saved/components/JobsBrowseGrid";

function toSerializableJob(job: {
  id: string;
  title: string;
  description: string;
  budgetMin: { toString(): string } | null;
  budgetMax: { toString(): string } | null;
  currency: string;
  budgetType: string;
  workMode: string;
  city: string | null;
}): SerializableJobCard {
  const min = job.budgetMin != null ? Number(job.budgetMin) : null;
  const max = job.budgetMax != null ? Number(job.budgetMax) : null;
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    budgetMin: Number.isFinite(min) ? min : null,
    budgetMax: Number.isFinite(max) ? max : null,
    currency: job.currency,
    budgetType: job.budgetType,
    workMode: job.workMode,
    city: job.city
  };
}

export default async function JobsBrowsePage() {
  const jobService = new JobService();
  const { items, total } = await jobService.listOpenJobs({ page: 1, limit: 24 });
  const jobs = items.map(toSerializableJob);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <PageHeader
        title="Browse jobs"
        description={`${total} open role${total === 1 ? "" : "s"} available. Refine results with search filters from the API when you add them to this page.`}
      />

      <div className="mt-8">
        <JobsBrowseGrid jobs={jobs} />
      </div>
    </div>
  );
}
