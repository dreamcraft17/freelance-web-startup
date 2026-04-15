import type { Route } from "next";
import Link from "next/link";
import { searchJobsSchema } from "@acme/validators";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { JobsPublicEmpty } from "@/features/public/components/JobsPublicEmpty";
import { JobsPublicFilters } from "@/features/public/components/JobsPublicFilters";
import { JobsPublicList, type JobsPublicCard } from "@/features/public/components/JobsPublicList";
import { CategoryService } from "@/server/services/category.service";
import { JobService } from "@/server/services/job.service";

export const revalidate = 60;

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

async function loadCategories(): Promise<{ id: string; name: string }[]> {
  try {
    const catRes = await new CategoryService().list({ page: 1, limit: 100 });
    if (catRes.mode !== "categories") return [];
    return catRes.items.map((c) => ({ id: c.id, name: c.name }));
  } catch {
    return [];
  }
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

  const jobService = new JobService();
  const [{ items, total }, categories] = await Promise.all([jobService.listOpenJobs(query), loadCategories()]);
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
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <header className="nw-page-header">
        <p className="nw-section-title">Jobs discovery</p>
        <h1 className="nw-page-title md:text-4xl">Browse open jobs</h1>
        <p className="nw-page-description text-base">
          Review active briefs from clients. Filter by category, location, and work mode to narrow to jobs that match how
          you work.
        </p>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr),14.5rem] lg:items-start lg:gap-8">
        <div className="min-w-0 space-y-5">
          <JobsPublicFilters
            keyword={keyword}
            city={city}
            workMode={workMode}
            categoryId={categoryId}
            categories={categories}
          />

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 lg:hidden">
            <p className="font-medium text-slate-900">Hiring?</p>
            <p className="mt-0.5 text-slate-600">Post a brief and collect bids on NearWork.</p>
            <AuthAwareCtaLink
              href={"/client/jobs/new" as Route}
              intent="post-job"
              unauthenticatedTo="register"
              registerRoleHint="client"
              className="nw-cta-primary mt-3 inline-flex w-full justify-center py-2.5"
            >
              Post a job
            </AuthAwareCtaLink>
          </div>

          {total > 0 ? (
            <div className="nw-results-toolbar">
              <span className="font-medium text-slate-900">
                {total === 1 ? "1 open role" : `${total} open roles`}
              </span>
              <span className="text-slate-500">Scan title + budget, then open for full brief.</span>
            </div>
          ) : null}

          {jobs.length === 0 ? (
            <JobsPublicEmpty categorySelected={categorySelected} hasFilters={hasFilters} />
          ) : (
            <JobsPublicList jobs={jobs} />
          )}

          {totalPages > 1 ? (
            <nav
              className="flex items-center justify-between border-t border-slate-200 pt-5 text-sm"
              aria-label="Pagination"
            >
              {page > 1 ? (
                <Link
                  href={`/jobs${jobsQueryString({ keyword, city, workMode, categoryId, page: page - 1 })}` as Route}
                  className="font-semibold text-[#433C93] hover:underline"
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
                  className="font-semibold text-[#433C93] hover:underline"
                >
                  Next →
                </Link>
              ) : (
                <span className="text-slate-300">Next →</span>
              )}
            </nav>
          ) : null}
        </div>

        <aside className="mt-2 hidden min-w-0 lg:sticky lg:top-28 lg:mt-0 lg:block">
          <div className="nw-surface-soft space-y-3 p-4 text-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">For clients</p>
            <p className="font-semibold text-slate-900">Need talent listed here?</p>
            <p className="text-slate-600">Post a brief with budget and location so the right freelancers can bid.</p>
            <AuthAwareCtaLink
              href={"/client/jobs/new" as Route}
              intent="post-job"
              unauthenticatedTo="register"
              registerRoleHint="client"
              className="nw-cta-primary flex w-full justify-center py-2.5 text-center"
            >
              Post a job
            </AuthAwareCtaLink>
            <Link href="/freelancers" className="block text-center text-xs font-semibold text-[#433C93] hover:underline">
              Browse freelancers instead
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
