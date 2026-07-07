import { Check, Clock, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

export type EscrowPhase = "locked" | "in_review" | "released" | "disputed" | "pending";

const PHASE_META: Record<
  EscrowPhase,
  { label: string; icon: typeof Lock; tone: string; step: number }
> = {
  pending: { label: "Awaiting payment", icon: Clock, tone: "text-slate-600", step: 0 },
  locked: { label: "Funds in escrow", icon: Lock, tone: "text-nw-brand", step: 1 },
  in_review: { label: "Work under review", icon: Clock, tone: "text-nw-warning", step: 2 },
  released: { label: "Released to freelancer", icon: Unlock, tone: "text-nw-success", step: 3 },
  disputed: { label: "Dispute open", icon: Lock, tone: "text-nw-danger", step: 2 }
};

type Props = {
  phase: EscrowPhase;
  className?: string;
  showTimeline?: boolean;
};

export function EscrowStatus({ phase, className, showTimeline = true }: Props) {
  const meta = PHASE_META[phase];
  const Icon = meta.icon;
  const steps = ["Payment", "Escrow", "Review", "Release"];

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900", className)}>
      <div className="flex items-start gap-3">
        <span className={cn("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800", meta.tone)}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Escrow protection</p>
          <p className={cn("mt-0.5 text-sm", meta.tone)}>{meta.label}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Payment is held safely until work is delivered and approved.
          </p>
        </div>
      </div>
      {showTimeline && (
        <ol className="mt-4 flex gap-1" aria-label="Escrow timeline">
          {steps.map((step, idx) => {
            const done = idx < meta.step;
            const current = idx === meta.step;
            return (
              <li key={step} className="flex-1">
                <div
                  className={cn(
                    "h-1.5 rounded-full",
                    done || current ? "bg-nw-brand" : "bg-slate-200 dark:bg-slate-700"
                  )}
                  aria-hidden
                />
                <span className="mt-1 flex items-center gap-1 text-[10px] font-medium text-slate-500">
                  {done && <Check className="h-3 w-3 text-nw-success" aria-hidden />}
                  {step}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
