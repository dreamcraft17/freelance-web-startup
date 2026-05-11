import { cn } from "@/lib/utils";

export function NwSkeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("nw-skeleton", className)} />;
}

export function NwSkeletonSoft({ className }: { className?: string }) {
  return <div aria-hidden className={cn("nw-skeleton-soft", className)} />;
}

export function NwLoadingHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className={cn("border-b border-slate-200/80", compact ? "pb-4" : "pb-5")}>
      <NwSkeleton className="h-3 w-24" />
      <NwSkeleton className={cn("mt-2 h-8 w-56", compact && "h-7 w-48")} />
      <NwSkeletonSoft className="mt-2 h-4 w-[26rem] max-w-full" />
    </header>
  );
}

export function NwLoadingCardStack({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={`row-${idx}`} className="nw-skeleton-row">
          <NwSkeleton className="h-4 w-44 max-w-[70%]" />
          <NwSkeletonSoft className="mt-2 h-3 w-full" />
          <NwSkeletonSoft className="mt-1.5 h-3 w-4/5" />
          <div className="mt-3 flex flex-wrap gap-1.5">
            <div className="nw-skeleton-chip w-20" />
            <div className="nw-skeleton-chip w-24" />
            <div className="nw-skeleton-chip w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

