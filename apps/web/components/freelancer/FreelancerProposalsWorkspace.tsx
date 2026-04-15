"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";
import { BidStatus } from "@acme/types";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
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

const FILTERS: { key: FilterKey; label: string; statuses: BidStatus[] | null }[] = [
  { key: "all", label: "All", statuses: null },
  { key: "submitted", label: "Submitted", statuses: [BidStatus.SUBMITTED] },
  { key: "shortlisted", label: "Shortlisted", statuses: [BidStatus.SHORTLISTED] },
  { key: "accepted", label: "Accepted", statuses: [BidStatus.ACCEPTED] },
  { key: "rejected", label: "Rejected", statuses: [BidStatus.REJECTED] }
];

function money(amount: number, currency: string): string {
  if (!Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(d);
}

function humanizeStatus(status: string): string {
  return status.replace(/_/g, " ").toLowerCase();
}

function rowVisual(status: string): string {
  switch (status) {
    case BidStatus.ACCEPTED:
      return "border-emerald-200/90 bg-emerald-50/60";
    case BidStatus.SHORTLISTED:
      return "border-[#3525cd]/25 bg-[#3525cd]/[0.05]";
    case BidStatus.REJECTED:
      return "border-red-200/80 bg-red-50/40";
    default:
      return "border-slate-200/90 bg-white";
  }
}

function statusPill(status: string): string {
  switch (status) {
    case BidStatus.ACCEPTED:
      return "bg-emerald-100 text-emerald-900 ring-emerald-200/80";
    case BidStatus.SHORTLISTED:
      return "bg-[#3525cd]/15 text-[#3525cd] ring-[#3525cd]/20";
    case BidStatus.REJECTED:
      return "bg-red-100 text-red-900 ring-red-200/70";
    case BidStatus.SUBMITTED:
      return "bg-slate-100 text-slate-800 ring-slate-200/80";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200/70";
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
  proposals
}: {
  hasProfile: boolean;
  proposals: FreelancerProposalRow[];
}) {
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
    const def = FILTERS.find((f) => f.key === filter);
    const pool = !def?.statuses ? proposals : proposals.filter((p) => def.statuses!.includes(p.status as BidStatus));
    return [...pool].sort((a, b) => {
      const order = statusOrder(a.status) - statusOrder(b.status);
      if (order !== 0) return order;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [proposals, filter]);

  if (!hasProfile) {
    return (
      <DashboardEmptyState
        tone="elevated"
        kicker="Profile"
        icon={FileText}
        title="Proposals live on your freelancer profile"
        description="Create your profile and send bids on open jobs—every proposal you submit will show up here with status and amounts."
        action={{ label: "Complete profile", href: "/freelancer/profile" }}
        secondaryAction={{ label: "Browse jobs", href: "/jobs" }}
      />
    );
  }

  if (proposals.length === 0) {
    return (
      <DashboardEmptyState
        tone="elevated"
        kicker="Inbox"
        icon={Inbox}
        title="No proposals yet"
        description="When you respond to a job with a bid, it appears here so you can track client decisions in one workspace."
        action={{ label: "Browse open jobs", href: "/jobs" }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">Filter by client response. Other statuses (e.g. withdrawn) stay in “All”.</p>
      </div>

      <div role="tablist" aria-label="Proposal status" className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-1">
        {FILTERS.map((f) => {
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
                "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3525cd]/30",
                active
                  ? "bg-white text-[#3525cd] ring-1 ring-slate-200/90"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
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
        <div className="rounded-xl border border-slate-200/90 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-900">Nothing in this view</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            No proposals match “{FILTERS.find((x) => x.key === filter)?.label}”. Try another tab or browse new roles.
          </p>
          <Link
            href={"/jobs" as Route}
            className="mt-4 inline-flex text-sm font-semibold text-[#3525cd] underline-offset-4 hover:underline"
          >
            Browse jobs
          </Link>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((p) => (
            <li key={p.id}>
              <Link
                href={`/jobs/${p.job.id}` as Route}
                className={cn(
                  "block rounded-lg border p-4 transition hover:border-slate-300 md:p-5",
                  rowVisual(p.status)
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Job</p>
                    <p className="mt-1 text-base font-semibold leading-snug text-slate-900">{p.job.title}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      Submitted <time dateTime={p.createdAt}>{formatDate(p.createdAt)}</time>
                      {p.estimatedDays != null ? ` · ~${p.estimatedDays} day timeline` : null}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                    <span
                      className={cn(
                        "inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold capitalize ring-1",
                        statusPill(p.status)
                      )}
                    >
                      {humanizeStatus(p.status)}
                    </span>
                    <p className="text-lg font-semibold tabular-nums text-slate-900">
                      {money(p.amount, p.currency)}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
