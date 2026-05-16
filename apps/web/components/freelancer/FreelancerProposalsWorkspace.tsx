"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";
import { BidStatus } from "@acme/types";
import { ModerationReportButton } from "@/features/moderation/components/ModerationReportButton";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import type { AppLocale } from "@/lib/i18n/types";
import { useI18n } from "@/features/i18n/I18nProvider";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import { withWorkspaceLocale } from "@/lib/i18n/workspace-path";
import { formatMoneyAmount, normalizeCurrencyCode } from "@/lib/format-money";
import { cn } from "@/lib/utils";
import { FileText, Inbox } from "lucide-react";

export type FreelancerProposalRow = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
  estimatedDays: number | null;
  job: { id: string; title: string };
};

type FilterKey = "all" | "submitted" | "shortlisted" | "accepted" | "rejected";

type FilterDef = {
  key: FilterKey;
  label: string;
  statuses: BidStatus[] | null;
};

function formatDate(iso: string, locale: AppLocale): string {
  const tag = locale === "id" ? "id-ID" : "en-US";
  return new Intl.DateTimeFormat(tag, { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

function rowTone(status: string): string {
  switch (status) {
    case BidStatus.ACCEPTED:
      return "border-emerald-200/90 bg-emerald-50/50";
    case BidStatus.SHORTLISTED:
      return "border-[#3525cd]/20 bg-[#3525cd]/[0.05]";
    case BidStatus.REJECTED:
      return "border-red-200/80 bg-red-50/45";
    default:
      return "border-slate-200/90 bg-white";
  }
}

function statusChipClass(status: string): string {
  switch (status) {
    case BidStatus.ACCEPTED:
      return "nw-chip-success normal-case tracking-normal";
    case BidStatus.SHORTLISTED:
      return "nw-chip-brand normal-case tracking-normal";
    case BidStatus.REJECTED:
      return "inline-flex items-center rounded-md border border-red-200/80 bg-red-100 px-2.5 py-0.5 text-xs font-semibold normal-case text-red-900";
    case BidStatus.SUBMITTED:
      return "nw-chip nw-chip-muted normal-case tracking-normal";
    default:
      return "nw-chip nw-chip-muted normal-case tracking-normal";
  }
}

function statusOrder(status: string): number {
  switch (status) {
    case BidStatus.SHORTLISTED:
      return 1;
    case BidStatus.SUBMITTED:
      return 2;
    case BidStatus.ACCEPTED:
      return 3;
    case BidStatus.REJECTED:
      return 4;
    default:
      return 9;
  }
}

export function FreelancerProposalsWorkspace({
  hasProfile,
  proposals,
  emptyOnboarding
}: {
  hasProfile: boolean;
  proposals: FreelancerProposalRow[];
  emptyOnboarding?: { step1: string; step2: string; step3: string };
}) {
  const { t, locale } = useI18n();
  const jobsBrowseRoot = withPublicLocale(locale, "/jobs");
  const wp = (path: string) => withWorkspaceLocale(locale, path) as Route;

  const filterDefs: FilterDef[] = useMemo(
    () => [
      { key: "all", label: t("dashboard.freelancer.proposalsFilterAll"), statuses: null },
      {
        key: "submitted",
        label: t("dashboard.freelancer.proposalsFilterSubmitted"),
        statuses: [BidStatus.SUBMITTED]
      },
      {
        key: "shortlisted",
        label: t("dashboard.freelancer.proposalsFilterShortlisted"),
        statuses: [BidStatus.SHORTLISTED]
      },
      { key: "accepted", label: t("dashboard.freelancer.proposalsFilterAccepted"), statuses: [BidStatus.ACCEPTED] },
      { key: "rejected", label: t("dashboard.freelancer.proposalsFilterRejected"), statuses: [BidStatus.REJECTED] }
    ],
    [t]
  );

  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: proposals.length,
      submitted: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0
    };
    for (const p of proposals) {
      if (p.status === BidStatus.SUBMITTED) c.submitted += 1;
      if (p.status === BidStatus.SHORTLISTED) c.shortlisted += 1;
      if (p.status === BidStatus.ACCEPTED) c.accepted += 1;
      if (p.status === BidStatus.REJECTED) c.rejected += 1;
    }
    return c;
  }, [proposals]);

  const filtered = useMemo(() => {
    const def = filterDefs.find((f) => f.key === filter);
    const statuses = def?.statuses;
    const pool = !statuses ? proposals : proposals.filter((p) => statuses.includes(p.status as BidStatus));
    return [...pool].sort((a, b) => {
      const order = statusOrder(a.status) - statusOrder(b.status);
      if (order !== 0) return order;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [proposals, filter, filterDefs]);

  const statusLabel = (s: string) => t(`dashboard.client.bidStatus.${s}`);

  if (!hasProfile) {
    return (
      <DashboardEmptyState
        tone="elevated"
        kicker={t("dashboard.freelancer.proposalsEmptyProfileKicker")}
        icon={FileText}
        title={t("dashboard.freelancer.proposalsEmptyProfileTitle")}
        description={t("dashboard.freelancer.proposalsEmptyProfileBody")}
        action={{ label: t("dashboard.freelancer.proposalsEmptyProfilePrimary"), href: wp("/freelancer/profile") }}
        secondaryAction={{
          label: t("dashboard.freelancer.proposalsEmptyProfileSecondary"),
          href: jobsBrowseRoot as Route
        }}
      />
    );
  }

  if (proposals.length === 0) {
    return (
      <DashboardEmptyState
        tone="elevated"
        kicker={t("dashboard.freelancer.proposalsEmptyInboxKicker")}
        icon={Inbox}
        title={t("dashboard.freelancer.proposalsEmptyInboxTitle")}
        description={
          <>
            <p>{t("dashboard.freelancer.proposalsEmptyInboxLead")}</p>
            {emptyOnboarding ? (
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 marker:font-semibold">
                <li>{emptyOnboarding.step1}</li>
                <li>{emptyOnboarding.step2}</li>
                <li>{emptyOnboarding.step3}</li>
              </ol>
            ) : null}
          </>
        }
        action={{ label: t("dashboard.freelancer.proposalsEmptyInboxPrimary"), href: jobsBrowseRoot as Route }}
      />
    );
  }

  const activeFilterLabel = filterDefs.find((f) => f.key === filter)?.label ?? "";

  return (
    <div className="nw-stack">
      <p className="nw-type-body">{t("dashboard.freelancer.proposalsFilterHint")}</p>

      <div
        role="tablist"
        aria-label={t("dashboard.freelancer.proposalsFilterAria")}
        className="nw-card flex gap-1 overflow-x-auto p-1"
      >
        {filterDefs.map((f) => {
          const active = filter === f.key;
          const count = counts[f.key];
          return (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.key)}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3525cd]/30",
                active ? "bg-white text-[#3525cd] shadow-sm ring-1 ring-slate-200/90" : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
              )}
            >
              {f.label}
              <span className={cn("ml-1.5 tabular-nums text-xs", active ? "text-[#3525cd]/80" : "text-slate-400")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="nw-empty-state text-center">
          <p className="text-sm font-semibold text-slate-900">{t("dashboard.freelancer.proposalsFilterEmptyTitle")}</p>
          <p className="nw-type-body mx-auto mt-2 max-w-md">
            {t("dashboard.freelancer.proposalsFilterEmptyBody", { filter: activeFilterLabel })}
          </p>
          <Link href={jobsBrowseRoot as Route} className={cn("nw-link-action mt-4 inline-flex justify-center font-semibold")}>
            {t("dashboard.freelancer.proposalsFilterEmptyBrowse")}
          </Link>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((p) => {
            const submitted = formatDate(p.createdAt, locale);
            const eta =
              p.estimatedDays != null ? t("dashboard.freelancer.proposalsRowEstimated", { days: p.estimatedDays }) : "";
            return (
              <li key={p.id}>
                <div className={cn("nw-card nw-card-hover rounded-xl border p-4 md:p-5", rowTone(p.status))}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <Link
                      href={`${jobsBrowseRoot}/${p.job.id}` as Route}
                      className="min-w-0 flex-1 transition-opacity hover:opacity-90"
                    >
                      <p className="nw-type-micro">{t("dashboard.freelancer.proposalsRowJobKicker")}</p>
                      <p className="mt-1 text-base font-semibold leading-snug text-slate-900">{p.job.title}</p>
                      <p className="nw-type-body mt-2">
                        {t("dashboard.freelancer.proposalsRowSubmitted", { date: submitted })}
                        {eta ? ` · ${eta}` : null}
                      </p>
                    </Link>
                    <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                      <span className={cn("inline-flex px-2.5 py-0.5 text-xs font-semibold normal-case", statusChipClass(p.status))}>
                        {statusLabel(p.status)}
                      </span>
                      <p className="text-lg font-semibold tabular-nums text-slate-900">
                        {formatMoneyAmount(p.amount, p.currency, {
                          locale,
                          maximumFractionDigits: normalizeCurrencyCode(p.currency) === "IDR" ? 0 : 2
                        })}
                      </p>
                      <ModerationReportButton intent="bid" target={{ subjectType: "BID", subjectBidId: p.id }} />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
