import type { Route } from "next";
import Link from "next/link";
import { searchJobsSchema } from "@acme/validators";
import { JobsPublicEmpty } from "@/features/public/components/JobsPublicEmpty";
import { JobsPublicFilters } from "@/features/public/components/JobsPublicFilters";
import { JobsPublicList, type JobsPublicCard } from "@/features/public/components/JobsPublicList";
import { CategoryService } from "@/server/services/category.service";
import { JobService } from "@/server/services/job.service";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function pick(sp: SearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (v === undefined) continue;
    out[k] = Array.isArray(v) ? (v[0] ?? "") : v;
  }
  return out;
}

function toPublicJobCard(job: {
  id: string;
  title: string;
  description: string;
  budgetMin: { toString(): string } | null;
  budgetMax: { toString(): string } | null;
  currency: string;
  budgetType: string;
  workMode: string;
  city: string | null;
}): JobsPublicCard {
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

function jobsQueryString(args: {
  keyword: string;
  city: string;
  workMode: string;
  categoryId: string;
  page: number;
}): string {
  const u = new URLSearchParams();
  if (args.keyword.trim()) u.set("keyword", args.keyword.trim());
  if (args.city.trim()) u.set("city", args.city.trim());
  if (args.workMode) u.set("workMode", args.workMode);
  if (args.categoryId.trim()) u.set("categoryId", args.categoryId.trim());
  if (args.page > 1) u.set("page", String(args.page));
  const s = u.toString();
  return s ? `?${s}` : "";
}

export default async function JobsBrowsePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = pick(await searchParams);
  const parsed = searchJobsSchema.safeParse({
    page: raw.page ?? 1,
    limit: 24,
    keyword: raw.keyword,
    city: raw.city,
    workMode: raw.workMode === "" ? undefined : raw.workMode,
    categoryId: raw.categoryId
  });
  const query = parsed.success ? parsed.data : { page: 1, limit: 24 as const };

  let categories: { id: string; name: string }[] = [];
  try {
    const catRes = await new CategoryService().list({ page: 1, limit: 100 });
    if (catRes.mode === "categories") {
      categories = catRes.items.map((c) => ({ id: c.id, name: c.name }));
    }
  } catch {
    categories = [];
  }

  const jobService = new JobService();
  const { items, total } = await jobService.listOpenJobs(query);
  const jobs = items.map(toPublicJobCard);

  const keyword = query.keyword ?? "";
  const city = query.city ?? "";
  const workMode = (query.workMode ?? "") as "" | "REMOTE" | "ONSITE" | "HYBRID";
  const categoryId = query.categoryId ?? "";
  const page = query.page;
  const totalPages = Math.max(1, Math.ceil(total / query.limit));

  const hasFilters =
    Boolean(keyword.trim()) || Boolean(city.trim()) || Boolean(workMode) || Boolean(categoryId.trim());
  const categorySelected = Boolean(categoryId.trim());

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Find work on NearWork</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
          Open briefs from clients—nearby, hybrid, or remote. Filter by what matters to you; everything here is live
          data from the marketplace.
        </p>
      </header>

      <JobsPublicFilters
        keyword={keyword}
        city={city}
        workMode={workMode}
        categoryId={categoryId}
        categories={categories}
      />

      {total > 0 ? (
        <p className="mb-6 text-sm text-slate-600">
          {total === 1 ? "One open role matches your filters." : `${total} open roles match your filters.`}
        </p>
      ) : null}

      {jobs.length === 0 ? (
        <JobsPublicEmpty categorySelected={categorySelected} hasFilters={hasFilters} />
      ) : (
        <JobsPublicList jobs={jobs} />
      )}

      {totalPages > 1 ? (
        <nav
          className="mt-10 flex items-center justify-between border-t border-slate-200/80 pt-6 text-sm"
          aria-label="Pagination"
        >
          {page > 1 ? (
            <Link
              href={`/jobs${jobsQueryString({ keyword, city, workMode, categoryId, page: page - 1 })}` as Route}
              className="font-semibold text-[#3525cd] hover:underline"
            >
              ← Previous
            </Link>
          ) : (
            <span className="text-slate-300">← Previous</span>
          )}
          <span className="text-slate-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/jobs${jobsQueryString({ keyword, city, workMode, categoryId, page: page + 1 })}` as Route}
              className="font-semibold text-[#3525cd] hover:underline"
            >
              Next →
            </Link>
          ) : (
            <span className="text-slate-300">Next →</span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
