"use client";

import type { Route } from "next";
import Link from "next/link";
import { Building2, Clock3, Users } from "lucide-react";
import { JobCard } from "@/components/design-system/JobCard";
import { Badge } from "@/components/ui/badge";
import { SaveJobButton } from "@/features/saved/components/SaveJobButton";
import { useI18n } from "@/features/i18n/I18nProvider";
import { normalizeCurrencyCode } from "@/lib/format-money";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import type { JobsPublicCard } from "@/features/public/components/JobsPublicList";

type Props = {
  job: JobsPublicCard;
  savedJobIds?: string[];
  statusBadge?: "new" | "urgent" | "few" | "competitive" | null;
  budgetLabel: string;
  timeAgoLabel: string;
  workModeLabel: string;
};

export function JobsPublicJobCard({
  job,
  savedJobIds,
  statusBadge,
  budgetLabel,
  timeAgoLabel,
  workModeLabel
}: Props) {
  const { t, locale } = useI18n();
  const href = withPublicLocale(locale, `/jobs/${job.id}`) as Route;

  const budgetAmount =
    job.budgetMax ?? job.budgetMin != null ? Math.max(job.budgetMin ?? 0, job.budgetMax ?? 0) : null;

  const saved =
    savedJobIds != null
      ? { known: true as const, value: savedJobIds.includes(job.id) }
      : { known: false as const, value: false };

  return (
    <li>
      <div className="relative">
        <JobCard
          title={job.title}
          href={href}
          budgetCents={budgetAmount}
          currency={normalizeCurrencyCode(job.currency)}
          category={job.categoryName}
          location={job.city ?? undefined}
          workMode={workModeLabel}
          skills={job.skillNames.slice(0, 4)}
          clientVerified={job.clientVerified}
        />
        <div className="absolute right-3 top-3 flex max-w-[50%] flex-wrap justify-end gap-1">
          {statusBadge === "new" ? <Badge variant="success">{t("public.jobs.badgeNew")}</Badge> : null}
          {statusBadge === "urgent" ? <Badge variant="warning">{t("public.jobs.badgeUrgent")}</Badge> : null}
          {job.shortlistedCount > 0 ? (
            <Badge variant="brand">
              {job.shortlistedCount === 1
                ? t("public.jobs.badgeInterviewingOne")
                : t("public.jobs.badgeInterviewingMany", { count: job.shortlistedCount })}
            </Badge>
          ) : null}
        </div>
      </div>
      <div className="mt-2 space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/40">
        <p className="line-clamp-2 text-sm text-slate-600">{job.description}</p>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
            <Building2 className="h-3.5 w-3.5" aria-hidden />
            {job.clientDisplayName}
          </span>
          <span className="nw-v2-price font-semibold text-slate-900">{budgetLabel}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1 text-slate-600">
            <Users className="h-3.5 w-3.5 text-nw-brand" aria-hidden />
            {job.bidCount === 1 ? t("public.jobs.proposalsSingular") : t("public.jobs.proposalsCount", { count: job.bidCount })}
          </span>
          <span className="inline-flex items-center gap-1 text-slate-500">
            <Clock3 className="h-3.5 w-3.5" aria-hidden />
            {timeAgoLabel}
          </span>
          <SaveJobButton jobId={job.id} initialSaved={saved.known ? saved.value : undefined} appearance="icon" />
        </div>
      </div>
    </li>
  );
}
