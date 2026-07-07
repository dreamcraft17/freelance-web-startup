"use client";

import Link from "next/link";
import type { Route } from "next";
import { BidSubmitModal } from "@/features/public/components/BidSubmitModal";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";

type Labels = React.ComponentProps<typeof BidSubmitModal>["labels"];

type Props = {
  jobId: string;
  currency: string;
  userId?: string | null;
  clientUserId?: string | null;
  isFreelancerViewer: boolean;
  proposalAnchor: Route;
  registerHref: Route;
  labels: Labels;
  sendProposalLabel: string;
  discussLabel: string;
  registerLabel: string;
};

export function JobDetailMobileApplyBar({
  jobId,
  currency,
  userId,
  clientUserId,
  isFreelancerViewer,
  proposalAnchor,
  registerHref,
  labels,
  sendProposalLabel,
  discussLabel,
  registerLabel
}: Props) {
  if (isFreelancerViewer) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.14)] md:hidden dark:border-slate-700 dark:bg-slate-950">
        <div className="mx-auto flex max-w-lg flex-col gap-2">
          <BidSubmitModal
            jobId={jobId}
            currency={currency}
            userId={userId}
            clientUserId={clientUserId}
            labels={labels}
            triggerLabel={sendProposalLabel}
          />
          <Link
            href={proposalAnchor}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900"
          >
            {discussLabel}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.14)] md:hidden">
      <div className="mx-auto flex max-w-lg gap-2">
        <AuthAwareCtaLink
          href={proposalAnchor}
          intent="submit-bid"
          unauthenticatedTo="register"
          registerRoleHint="freelancer"
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-nw-brand px-4 text-sm font-bold text-white"
        >
          {sendProposalLabel}
        </AuthAwareCtaLink>
        <Link
          href={registerHref}
          className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-3 text-xs font-bold text-slate-900"
        >
          {registerLabel}
        </Link>
      </div>
    </div>
  );
}
