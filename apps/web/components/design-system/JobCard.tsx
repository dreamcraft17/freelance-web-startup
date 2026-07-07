import type { Route } from "next";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { PriceDisplay } from "@/components/design-system/PriceDisplay";
import { SkillTag } from "@/components/design-system/SkillTag";
import { TrustBadge } from "@/components/design-system/TrustBadge";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  href: Route | string;
  budgetCents?: number | null;
  currency?: string;
  category?: string | null;
  location?: string | null;
  workMode?: string | null;
  skills?: string[];
  saved?: boolean;
  onSaveToggle?: () => void;
  clientRating?: number | null;
  clientReviewCount?: number | null;
  clientVerified?: boolean;
  className?: string;
};

export function JobCard({
  title,
  href,
  budgetCents,
  currency = "IDR",
  category,
  location,
  workMode,
  skills = [],
  saved,
  onSaveToggle,
  clientRating,
  clientReviewCount,
  clientVerified,
  className
}: Props) {
  return (
    <article className={cn("nw-card group p-4 transition-shadow hover:shadow-nw-card-hover", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link href={href as Route} className="nw-v2-h3 block truncate text-xl text-slate-900 hover:text-nw-brand dark:text-slate-50">
            {title}
          </Link>
          {(clientRating || clientReviewCount || clientVerified) && (
            <TrustBadge
              verified={clientVerified}
              rating={clientRating ?? undefined}
              reviewCount={clientReviewCount ?? undefined}
              size="sm"
              className="mt-2"
            />
          )}
        </div>
        {onSaveToggle && (
          <button
            type="button"
            onClick={onSaveToggle}
            className="nw-touch-target shrink-0 rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-nw-brand/30 hover:text-nw-brand dark:border-slate-600"
            aria-label={saved ? "Unsave job" : "Save job"}
            aria-pressed={saved}
          >
            <Heart className={cn("h-4 w-4", saved && "fill-nw-brand text-nw-brand")} />
          </button>
        )}
      </div>

      {typeof budgetCents === "number" && (
        <PriceDisplay amountCents={budgetCents} currency={currency} size="sm" className="mt-3" label="Budget" />
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
        {category && <span className="nw-chip-brand normal-case tracking-normal">{category}</span>}
        {workMode && <span>{workMode}</span>}
        {location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" aria-hidden />
            {location}
          </span>
        )}
      </div>

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((skill) => (
            <SkillTag key={skill} label={skill} />
          ))}
        </div>
      )}

      <Link href={href as Route} className="nw-link-action mt-4 inline-flex text-sm">
        View job
      </Link>
    </article>
  );
}
