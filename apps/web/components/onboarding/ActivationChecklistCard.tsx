import Link from "next/link";
import type { Route } from "next";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActivationChecklistStepVm = {
  id: string;
  label: string;
  hint: string;
  href: Route;
  done: boolean;
};

type Props = {
  title: string;
  intro: string;
  steps: ActivationChecklistStepVm[];
  allCompleteBanner?: string | null;
  /** Premium journey presentation (desktop dashboards). */
  variant?: "default" | "journey";
};

/** Role-based onboarding progress from real persisted state — copy supplied by caller (EN/ID). */
export function ActivationChecklistCard({
  title,
  intro,
  steps,
  allCompleteBanner,
  variant = "default"
}: Props) {
  const remaining = steps.filter((s) => !s.done).length;
  const doneCount = steps.length - remaining;
  const progressPct = steps.length === 0 ? 0 : Math.round((doneCount / steps.length) * 100);

  if (remaining === 0 && allCompleteBanner) {
    return (
      <div
        className={cn(
          "flex items-start gap-3 border border-emerald-200/80 bg-emerald-50/55 px-3.5 py-2.5 md:px-4",
          variant === "journey" ? "rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]" : "rounded-xl"
        )}
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden />
        <p className="nw-type-body-strong text-emerald-900">{allCompleteBanner}</p>
      </div>
    );
  }

  if (remaining === 0) return null;

  return (
    <section
      aria-labelledby="nw-activation-checklist"
      className={cn(
        variant === "journey"
          ? "nw-card-elevated rounded-3xl border-slate-200/70 bg-gradient-to-b from-white to-slate-50/40 p-5 md:p-6"
          : "nw-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5"
      )}
    >
      <div className={cn("pb-4", variant === "journey" ? "border-b border-slate-200/60" : "border-b border-slate-100")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="nw-activation-checklist" className={cn("nw-type-title text-slate-900", variant === "journey" ? "text-[1.0625rem]" : "")}>
              {title}
            </h2>
            <p className="nw-type-body mt-1">{intro}</p>
          </div>
          {variant === "journey" ? (
            <p className="nw-chip nw-chip-brand shrink-0 normal-case tracking-normal">
              {doneCount}/{steps.length}
            </p>
          ) : null}
        </div>
        {variant === "journey" ? (
          <div className="mt-4">
            <div
              className="h-2 overflow-hidden rounded-full bg-slate-200/65"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPct}
              aria-labelledby="nw-activation-checklist"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#3525cd] to-indigo-500 transition-[width] duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] font-medium text-slate-500" aria-hidden>
              {progressPct}%
            </p>
          </div>
        ) : null}
      </div>
      <ol className="mt-5 space-y-3">
        {steps.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className={cn(
                "flex gap-3 transition",
                variant === "journey" ? "min-h-[52px]" : "",
                variant === "journey" ? "rounded-2xl border px-3 py-3.5 md:px-4 md:py-3" : "min-h-[52px] rounded-lg border px-3 py-3 md:min-h-0 md:px-4 md:py-2.5",
                step.done
                  ? "border-emerald-200/80 bg-emerald-50/[0.42] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                  : variant === "journey"
                    ? "border-slate-200/80 bg-white/95 shadow-[0_10px_32px_-30px_rgba(15,23,42,0.5)] hover:border-[#3525cd]/38 hover:bg-white hover:shadow-md"
                    : "border-slate-200 bg-slate-50/50 hover:border-[#433C93]/30 hover:bg-white active:bg-white"
              )}
            >
              <span className="mt-0.5 shrink-0" aria-hidden>
                {step.done ? (
                  <CheckCircle2 className={cn(variant === "journey" ? "h-[22px] w-[22px]" : "h-5 w-5", "text-emerald-600")} />
                ) : (
                  <Circle className={cn(variant === "journey" ? "h-[22px] w-[22px]" : "h-5 w-5", "text-slate-300")} />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn(variant === "journey" ? "text-[14px]" : "text-[13px]", "block font-semibold text-slate-900")}>
                  {step.label}
                </span>
                <span className={cn(variant === "journey" ? "mt-1 text-[12px] leading-snug" : "mt-0.5 text-[11px] leading-snug", "block text-slate-600")}>
                  {step.hint}
                </span>
              </span>
              {!step.done ? (
                <span className={cn(variant === "journey" ? "text-[#3525cd]" : "text-[#433C93]", "shrink-0 self-center text-xs font-semibold")}>
                  →
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
