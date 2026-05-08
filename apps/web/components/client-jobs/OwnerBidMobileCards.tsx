"use client";

import Link from "next/link";
import type { Route } from "next";
import { BidDecisionAction } from "@/components/client-jobs/BidDecisionAction";
import { BidConversationAction } from "@/components/client-jobs/BidConversationAction";
import { ModerationReportButton } from "@/features/moderation/components/ModerationReportButton";
import type { BidStatus } from "@acme/types";
import { cn } from "@/lib/utils";

export type OwnerBidMobileVm = {
  bidId: string;
  jobId: string;
  freelancerName: string;
  freelancerUsername: string;
  freelancerUserId: string;
  amountLine: string;
  daysLine: string | null;
  completenessPct: number;
  completenessFine: boolean;
  completenessThin: boolean;
  profilePctLine: string;
  profileStrengthHint: string;
  locationLine: string;
  locationFootnote: string | null;
  bidStatusDisplay: string;
  bidDecisionHint: string;
  submittedLine: string;
  isAccepted: boolean;
  isMutedAfterAccept: boolean;
  convoThreadId: string | null;
  conversationAwaitingReply: boolean;
  conversationTitle: string;
  conversationDetail: string;
  conversationMeta: string;
  bidStatusRaw: BidStatus | string;
};

type CopyBag = {
  compareKicker: string;
  priceLabel: string;
  completenessLabel: string;
  proposalFine: string;
  proposalMedium: string;
  proposalThin: string;
  profileLabel: string;
  locationLabel: string;
  discussHint: string;
  quickActionsLabel: string;
  /** Short note under compare kicker: reporting is intentional secondary */
  reportSecondaryNote?: string;
  navigateJobLabel: string;
  browseFreelancerLabel: string;
  hiredLabel: string;
};

export function OwnerBidMobileCards({
  bids,
  copy,
  freelancerProfileAriaName
}: {
  bids: OwnerBidMobileVm[];
  copy: CopyBag;
  freelancerProfileAriaName: string;
}) {
  return (
    <div className="space-y-3 md:hidden">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{copy.compareKicker}</p>
      {copy.reportSecondaryNote ? (
        <p className="text-[11px] leading-relaxed text-slate-500">{copy.reportSecondaryNote}</p>
      ) : null}
      {bids.map((bid) => {
        const pctColor = bid.completenessFine
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : bid.completenessThin
            ? "border-amber-200 bg-amber-50/80 text-amber-950"
            : "border-slate-200 bg-slate-50 text-slate-800";

        return (
          <article
            key={bid.bidId}
            className={cn(
              "rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-900/[0.02]",
              bid.isMutedAfterAccept && "opacity-60"
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="min-w-0">
                <Link
                  href={`/freelancers/${bid.freelancerUsername}` as Route}
                  className="block truncate text-base font-semibold text-slate-900 hover:text-[#3525cd]"
                  aria-label={`${freelancerProfileAriaName} @${bid.freelancerUsername}`}
                >
                  {bid.freelancerName}
                </Link>
                <p className="text-xs text-slate-500">@{bid.freelancerUsername}</p>
                {bid.isAccepted ? (
                  <span className="mt-2 inline-flex rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    {copy.hiredLabel}
                  </span>
                ) : null}
              </div>
              <p className="shrink-0 text-xs text-slate-500">{bid.submittedLine}</p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{copy.priceLabel}</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{bid.amountLine}</p>
                {bid.daysLine ? <p className="text-[11px] text-slate-600">{bid.daysLine}</p> : null}
              </div>
              <div className={cn("rounded-lg border px-3 py-2", pctColor)}>
                <p className="text-[10px] font-semibold uppercase tracking-wide opacity-90">{copy.completenessLabel}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{bid.completenessPct}%</p>
                <p className="text-[11px] leading-snug opacity-90">
                  {bid.completenessFine ? copy.proposalFine : bid.completenessThin ? copy.proposalThin : copy.proposalMedium}
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{copy.profileLabel}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{bid.profilePctLine}</p>
                <p className="text-[11px] leading-snug text-slate-600">{bid.profileStrengthHint}</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{copy.locationLabel}</p>
                <p className="mt-1 text-sm font-semibold leading-snug text-slate-900">{bid.locationLine}</p>
                {bid.locationFootnote ? (
                  <p className="text-[11px] leading-snug text-slate-500">{bid.locationFootnote}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#3525cd]/25 bg-[#3525cd]/[0.04] px-3 py-3">
              <p className="text-xs font-semibold text-[#3525cd]">{copy.quickActionsLabel}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{copy.discussHint}</p>
              <p
                className={cn(
                  "mt-2 text-xs font-semibold",
                  bid.conversationAwaitingReply ? "text-[#433C93]" : "text-slate-800"
                )}
              >
                {bid.conversationTitle}
              </p>
              {bid.conversationDetail ? (
                <p className="mt-0.5 text-[11px] leading-snug text-slate-600">{bid.conversationDetail}</p>
              ) : null}
              {bid.conversationMeta ? (
                <p className="mt-0.5 text-[11px] text-slate-500">{bid.conversationMeta}</p>
              ) : null}
              <div className="mt-3">
                <BidConversationAction
                  threadId={bid.convoThreadId}
                  jobId={bid.jobId}
                  freelancerUserId={bid.freelancerUserId}
                  prominence="primary"
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">
                {bid.bidStatusDisplay}
              </span>
              <p className="basis-full text-[11px] text-slate-500">{bid.bidDecisionHint}</p>
            </div>

            <div className="mt-2 border-t border-slate-50 pt-3">
              <BidDecisionAction bidId={bid.bidId} currentStatus={bid.bidStatusRaw as BidStatus} />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-dashed border-slate-200 pt-3">
              <ModerationReportButton
                intent="bid"
                variant="text"
                density="compact"
                target={{ subjectType: "BID", subjectBidId: bid.bidId }}
                className="touch-manipulation min-h-[44px] shrink-0"
              />
              <Link
                href={`/freelancers/${bid.freelancerUsername}` as Route}
                className="touch-manipulation text-[11px] font-semibold text-[#433C93]"
              >
                {copy.browseFreelancerLabel}
              </Link>
              <Link
                href={`/jobs/${bid.jobId}` as Route}
                className="touch-manipulation text-[11px] font-semibold text-slate-600"
              >
                {copy.navigateJobLabel}
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
