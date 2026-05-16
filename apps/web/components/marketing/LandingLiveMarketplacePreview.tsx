import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Camera, PenSquare } from "lucide-react";
import { getServerTranslator } from "@/lib/i18n/server-translator";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import { formatMoneyAmount, defaultFreelancerRateCurrency } from "@/lib/format-money";
import { SearchService } from "@/server/services/search.service";

/**
 * Homepage strip: real open jobs + freelancer directory rows (same filters as public boards),
 * or honest empty/process copy when the marketplace is still quiet.
 */
export async function LandingLiveMarketplacePreview() {
  const { t, locale } = await getServerTranslator();
  const search = new SearchService();
  const [jobsRes, flRes] = await Promise.all([
    search.listPublicOpenJobsPaginated({ page: 1, limit: 3 }, locale),
    search.searchFreelancers({ page: 1, limit: 3 })
  ]);

  const jobsBase = withPublicLocale(locale, "/jobs");
  const freelancersBase = withPublicLocale(locale, "/freelancers");

  const hasJobs = jobsRes.items.length > 0;
  const hasFreelancers = flRes.items.length > 0;

  if (!hasJobs && !hasFreelancers) {
    return (
      <section className="mx-auto max-w-[1280px] px-4 pb-8 pt-2 sm:px-6 sm:pb-10 sm:pt-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="nw-section-title">{t("landing.livePreview.emptyKicker")}</p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-[#071027] sm:text-2xl">{t("landing.livePreview.emptyTitle")}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">{t("landing.livePreview.emptyBody")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={jobsBase as Route}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#3525cd] px-5 text-sm font-semibold text-white transition hover:bg-[#2b1da8]"
            >
              {t("landing.livePreview.ctaJobs")}
            </Link>
            <Link
              href={freelancersBase as Route}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              {t("landing.livePreview.ctaFreelancers")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-8 pt-2 sm:px-6 sm:pb-10 sm:pt-4">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="nw-section-title">{t("landing.livePreview.kicker")}</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-[#071027] sm:text-2xl">{t("landing.livePreview.title")}</h2>
        </div>
        <Link href={jobsBase as Route} className="text-xs font-semibold text-[#4f35e8] hover:underline">
          {t("landing.preview.seeAllArrow")}
        </Link>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <PreviewCard
          title={t("landing.preview.activeFreelancersTitle")}
          icon={Camera}
          ctaLabel={t("landing.preview.ctaFreelancers")}
          ctaHref={freelancersBase as Route}
        >
          {hasFreelancers ? (
            flRes.items.map((f) => (
              <li key={f.id} className="px-4 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{f.fullName}</p>
                    <p className="text-xs text-slate-600">{f.headline?.trim() || t("landing.livePreview.noHeadline")}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {[f.primaryCategoryName, f.city].filter(Boolean).join(" · ") || t("landing.livePreview.metaFallback")}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                    <span className="text-xs font-semibold text-slate-700">{f.workMode}</span>
                    {f.hourlyRate != null ? (
                      <span className="text-xs font-bold text-slate-900">
                        {formatMoneyAmount(f.hourlyRate, defaultFreelancerRateCurrency(), {
                          locale,
                          maximumFractionDigits: 0
                        })}
                        <span className="font-normal text-slate-500"> / hr</span>
                      </span>
                    ) : null}
                    <Link
                      href={withPublicLocale(locale, `/freelancers/${f.username}`) as Route}
                      className="text-[11px] font-semibold text-[#3525cd] hover:underline"
                    >
                      {t("landing.preview.rowActionOpen")}
                    </Link>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-6 text-sm text-slate-600">{t("landing.livePreview.noFreelancersYet")}</li>
          )}
        </PreviewCard>

        <PreviewCard
          title={t("landing.preview.recentJobsTitle")}
          icon={PenSquare}
          ctaLabel={t("landing.preview.ctaJobs")}
          ctaHref={jobsBase as Route}
        >
          {hasJobs ? (
            jobsRes.items.map((j) => (
              <li key={j.id} className="px-4 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{j.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">{j.description}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{j.clientDisplayName}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                    <span className="text-xs font-semibold text-slate-700">{j.workMode}</span>
                    <Link
                      href={withPublicLocale(locale, `/jobs/${j.slug}`) as Route}
                      className="text-[11px] font-semibold text-[#3525cd] hover:underline"
                    >
                      {t("landing.preview.rowActionOpen")}
                    </Link>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-6 text-sm text-slate-600">{t("landing.livePreview.noJobsYet")}</li>
          )}
        </PreviewCard>
      </div>
    </section>
  );
}

function PreviewCard({
  title,
  icon: Icon,
  ctaLabel,
  ctaHref,
  children
}: {
  title: string;
  icon: typeof Camera;
  ctaLabel: string;
  ctaHref: Route;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Icon className="h-4 w-4 text-[#3525cd]" aria-hidden />
          {title}
        </p>
        <Link href={ctaHref} className="text-xs font-semibold text-[#3525cd] hover:underline">
          {ctaLabel}
        </Link>
      </div>
      <ul className="divide-y divide-slate-100">{children}</ul>
    </div>
  );
}
