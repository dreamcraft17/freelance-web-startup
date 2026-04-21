import type { Route } from "next";
import Link from "next/link";
import { searchJobsSchema } from "@acme/validators";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { JobsPublicEmpty } from "@/features/public/components/JobsPublicEmpty";
import { JobsPublicFilters } from "@/features/public/components/JobsPublicFilters";
import { JobsPublicList, type JobsPublicCard } from "@/features/public/components/JobsPublicList";
import { MarketplacePulse } from "@/components/marketing/MarketplacePulse";
import { getServerTranslator } from "@/lib/i18n/server-translator";
import { CategoryService } from "@/server/services/category.service";
import { JobService } from "@/server/services/job.service";
import { PublicStatsService } from "@/server/services/public-stats.service";

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
  translationSource: "en" | "id";
  isTranslated: boolean;
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
    translationSource: job.translationSource,
    isTranslated: job.isTranslated,
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
  const { t, locale } = await getServerTranslator();
  const [{ items, total }, categories, pulse] = await Promise.all([
    jobService.listOpenJobs(query, locale),
    loadCategories(),
    new PublicStatsService().getMarketplacePulse()
  ]);
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
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <header className="nw-page-header">
        <p className="nw-section-title">{t("public.jobs.sectionTitle")}</p>
        <h1 className="nw-page-title">{t("public.jobs.pageTitle")}</h1>
        <p className="nw-page-description">{t("public.jobs.pageDescription")}</p>
        <div className="mt-2">
          <MarketplacePulse pulse={pulse} t={t} />
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr),min(100%,22rem)] lg:items-start lg:gap-8">
        <div className="order-2 min-w-0 space-y-6 lg:order-1">
          {total > 0 ? (
            <div className="nw-results-toolbar">
              <span className="text-[15px] font-bold text-slate-950">
                {total === 1 ? t("public.jobs.resultOne") : t("public.jobs.resultMany", { count: total })}
              </span>
              <span className="max-w-[14rem] text-right text-xs font-medium leading-snug text-slate-600 sm:max-w-none sm:text-left">
                {t("public.jobs.resultHint")}
              </span>
            </div>
          ) : null}

          {jobs.length === 0 ? (
            <JobsPublicEmpty categorySelected={categorySelected} hasFilters={hasFilters} />
          ) : (
            <JobsPublicList jobs={jobs} />
          )}

          {totalPages > 1 ? (
            <nav
              className="flex items-center justify-between border-t border-slate-200 pt-6 text-sm"
              aria-label={t("public.pagination.label")}
            >
              {page > 1 ? (
                <Link
                  href={`/jobs${jobsQueryString({ keyword, city, workMode, categoryId, page: page - 1 })}` as Route}
                  className="font-bold text-[#3525cd] hover:underline"
                >
                  {t("public.pagination.previous")}
                </Link>
              ) : (
                <span className="text-slate-300">{t("public.pagination.previous")}</span>
              )}
              <span className="text-xs font-semibold text-slate-600">
                {t("public.pagination.pageOf", { page, total: totalPages })}
              </span>
              {page < totalPages ? (
                <Link
                  href={`/jobs${jobsQueryString({ keyword, city, workMode, categoryId, page: page + 1 })}` as Route}
                  className="font-bold text-[#3525cd] hover:underline"
                >
                  {t("public.pagination.next")}
                </Link>
              ) : (
                <span className="text-slate-300">{t("public.pagination.next")}</span>
              )}
            </nav>
          ) : null}
        </div>

        <aside className="order-1 mb-8 min-w-0 space-y-5 lg:order-2 lg:mb-0 lg:sticky lg:top-28">
          <JobsPublicFilters
            keyword={keyword}
            city={city}
            workMode={workMode}
            categoryId={categoryId}
            categories={categories}
          />
          <div className="nw-surface-soft space-y-3 border-t-[3px] border-t-[#3525cd] p-4 text-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600">{t("public.jobs.sidebarKicker")}</p>
            <p className="text-base font-bold text-slate-950">{t("public.jobs.sidebarTitle")}</p>
            <p className="font-medium text-slate-600">{t("public.jobs.sidebarBody")}</p>
            <AuthAwareCtaLink
              href={"/client/jobs/new" as Route}
              intent="post-job"
              unauthenticatedTo="register"
              registerRoleHint="client"
              className="nw-cta-primary flex w-full justify-center py-3 text-center"
            >
              {t("public.jobs.sidebarPrimary")}
            </AuthAwareCtaLink>
            <Link
              href="/freelancers"
              className="block text-center text-xs font-bold text-[#3525cd] hover:underline"
            >
              {t("public.jobs.sidebarSecondary")}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
