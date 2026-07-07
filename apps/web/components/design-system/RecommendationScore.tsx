import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  score: number;
  reasons?: string[];
  className?: string;
  compact?: boolean;
};

function barTone(score: number) {
  if (score >= 80) return "bg-nw-teal";
  if (score >= 60) return "bg-nw-brand";
  if (score >= 40) return "bg-nw-warning";
  return "bg-slate-400";
}

export function RecommendationScore({ score, reasons = [], className, compact }: Props) {
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-nw-brand">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Match
        </span>
        <span className="nw-v2-price text-sm font-bold text-slate-900 dark:text-slate-50">{clamped}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Match score ${clamped} percent`}
      >
        <div className={cn("h-full rounded-full transition-all duration-300", barTone(clamped))} style={{ width: `${clamped}%` }} />
      </div>
      {!compact && reasons.length > 0 && (
        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
          {reasons.map((reason) => (
            <li key={reason} className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-nw-brand" aria-hidden />
              {reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
