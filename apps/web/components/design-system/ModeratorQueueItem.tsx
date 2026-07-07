import { Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/design-system/StatusBadge";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  category: string;
  urgency: "low" | "medium" | "high";
  slaHoursRemaining?: number | null;
  subject: string;
  summary: string;
  status: string;
  onApprove?: () => void;
  onDeny?: () => void;
  busy?: boolean;
  className?: string;
};

const URGENCY_STYLES = {
  low: "border-slate-200 bg-slate-50 text-slate-700",
  medium: "border-nw-warning/30 bg-nw-warning/10 text-amber-900",
  high: "border-nw-danger/30 bg-nw-danger/10 text-red-900"
};

export function ModeratorQueueItem({
  category,
  urgency,
  slaHoursRemaining,
  subject,
  summary,
  status,
  onApprove,
  onDeny,
  busy,
  className
}: Props) {
  const slaLabel =
    typeof slaHoursRemaining === "number"
      ? slaHoursRemaining <= 0
        ? "SLA breached"
        : `${Math.ceil(slaHoursRemaining)}h left`
      : null;

  return (
    <li className={cn("rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase", URGENCY_STYLES[urgency])}>
              {urgency}
            </span>
            <span className="text-xs font-medium text-slate-500">{category}</span>
            {slaLabel && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium",
                  typeof slaHoursRemaining === "number" && slaHoursRemaining <= 0 ? "text-nw-danger" : "text-slate-600"
                )}
              >
                {typeof slaHoursRemaining === "number" && slaHoursRemaining <= 0 ? (
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                )}
                {slaLabel}
              </span>
            )}
          </div>
          <p className="mt-2 font-medium text-slate-900 dark:text-slate-50">{subject}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{summary}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      {(onApprove || onDeny) && status === "PENDING" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {onApprove && (
            <Button size="sm" disabled={busy} onClick={onApprove} className="min-h-11">
              Approve
            </Button>
          )}
          {onDeny && (
            <Button size="sm" variant="outline" disabled={busy} onClick={onDeny} className="min-h-11">
              Deny
            </Button>
          )}
        </div>
      )}
    </li>
  );
}
