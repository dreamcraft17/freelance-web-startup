import { BadgeCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  verified?: boolean;
  rating?: number | null;
  reviewCount?: number | null;
  className?: string;
  size?: "sm" | "md";
};

export function TrustBadge({ verified, rating, reviewCount, className, size = "md" }: Props) {
  const text = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {verified && (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border border-nw-teal/25 bg-nw-teal/10 px-2 py-0.5 font-medium text-nw-teal",
            text
          )}
        >
          <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Verified
        </span>
      )}
      {typeof rating === "number" && rating > 0 && (
        <span className={cn("inline-flex items-center gap-1 font-medium text-slate-800 dark:text-slate-100", text)}>
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
          <span>{rating.toFixed(1)}</span>
          {typeof reviewCount === "number" && reviewCount > 0 && (
            <span className="text-slate-500 dark:text-slate-400">({reviewCount.toLocaleString()})</span>
          )}
        </span>
      )}
    </div>
  );
}
