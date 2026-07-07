import type { Route } from "next";
import Link from "next/link";
import { TrustBadge } from "@/components/design-system/TrustBadge";
import { SkillTag } from "@/components/design-system/SkillTag";
import { PriceDisplay } from "@/components/design-system/PriceDisplay";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  headline?: string | null;
  href?: Route | string;
  avatarUrl?: string | null;
  verified?: boolean;
  rating?: number | null;
  reviewCount?: number | null;
  skills?: string[];
  rateCents?: number | null;
  currency?: string;
  actionLabel?: string;
  actionHref?: Route | string;
  className?: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfileCard({
  name,
  headline,
  href,
  avatarUrl,
  verified,
  rating,
  reviewCount,
  skills = [],
  rateCents,
  currency = "IDR",
  actionLabel = "View profile",
  actionHref,
  className
}: Props) {
  const content = (
    <div className={cn("nw-card flex gap-4 p-4", className)}>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-nw-brand/10 text-lg font-semibold text-nw-brand">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          initials(name)
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-slate-900 dark:text-slate-50">{name}</p>
        {headline && <p className="mt-0.5 truncate text-sm text-slate-600 dark:text-slate-400">{headline}</p>}
        <TrustBadge verified={verified} rating={rating ?? undefined} reviewCount={reviewCount ?? undefined} size="sm" className="mt-2" />
        {typeof rateCents === "number" && (
          <PriceDisplay amountCents={rateCents} currency={currency} size="sm" label="From" className="mt-2" />
        )}
        {skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {skills.slice(0, 3).map((skill) => (
              <SkillTag key={skill} label={skill} />
            ))}
          </div>
        )}
        {actionHref && (
          <span className="nw-link-action mt-3 inline-flex text-sm">{actionLabel}</span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href as Route} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {content}
      </Link>
    );
  }

  return content;
}
