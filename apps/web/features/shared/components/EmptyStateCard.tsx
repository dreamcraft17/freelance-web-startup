import { cn } from "@/lib/utils";

type EmptyStateCardProps = {
  title: string;
  description: string;
  className?: string;
};

/** Presentational empty state — no data fetching or domain rules. */
export function EmptyStateCard({ title, description, className }: EmptyStateCardProps) {
  return (
    <div className={cn("nw-empty-state", className)}>
      <h3 className="text-base font-semibold leading-snug text-slate-900">{title}</h3>
      <p className="nw-type-body mt-2">{description}</p>
    </div>
  );
}
