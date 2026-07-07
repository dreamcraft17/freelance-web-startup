import type { Route } from "next";
import Link from "next/link";
import { PriceDisplay } from "@/components/design-system/PriceDisplay";
import { ProfileCard } from "@/components/design-system/ProfileCard";
import { StatusBadge } from "@/components/design-system/StatusBadge";
import { cn } from "@/lib/utils";

type Props = {
  freelancerName: string;
  freelancerHref?: Route | string;
  bidAmountCents: number;
  currency?: string;
  messagePreview?: string | null;
  status?: string;
  etaLabel?: string | null;
  className?: string;
};

export function BidCard({
  freelancerName,
  freelancerHref,
  bidAmountCents,
  currency = "IDR",
  messagePreview,
  status = "PENDING",
  etaLabel,
  className
}: Props) {
  return (
    <article className={cn("nw-card space-y-4 p-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <ProfileCard name={freelancerName} href={freelancerHref} className="border-0 p-0 shadow-none" />
        <StatusBadge status={status} />
      </div>
      <PriceDisplay amountCents={bidAmountCents} currency={currency} label="Bid amount" />
      {etaLabel && <p className="text-sm text-slate-600 dark:text-slate-400">Timeline: {etaLabel}</p>}
      {messagePreview && (
        <p className="line-clamp-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {messagePreview}
        </p>
      )}
      {freelancerHref && (
        <Link href={freelancerHref as Route} className="nw-link-action inline-flex text-sm">
          Open freelancer profile
        </Link>
      )}
    </article>
  );
}
