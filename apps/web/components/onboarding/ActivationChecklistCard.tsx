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
};

/** Role-based onboarding progress from real persisted state — copy supplied by caller (EN/ID). */
export function ActivationChecklistCard({ title, intro, steps, allCompleteBanner }: Props) {
  const remaining = steps.filter((s) => !s.done).length;

  if (remaining === 0 && allCompleteBanner) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/50 px-4 py-3 md:px-5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden />
        <p className="text-sm font-medium leading-relaxed text-emerald-900">{allCompleteBanner}</p>
      </div>
    );
  }

  if (remaining === 0) return null;

  return (
    <section
      aria-labelledby="nw-activation-checklist"
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-6"
    >
      <div className="border-b border-slate-100 pb-4">
        <h2 id="nw-activation-checklist" className="text-base font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{intro}</p>
      </div>
      <ol className="mt-4 space-y-3">
        {steps.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className={cn(
                "flex min-h-[52px] gap-3 rounded-lg border px-3 py-3.5 transition md:min-h-0 md:px-4 md:py-3",
                step.done
                  ? "border-emerald-200/70 bg-emerald-50/40"
                  : "border-slate-200 bg-slate-50/50 hover:border-[#433C93]/30 hover:bg-white active:bg-white"
              )}
            >
              <span className="mt-0.5 shrink-0" aria-hidden>
                {step.done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-300" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-semibold text-slate-900">{step.label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">{step.hint}</span>
              </span>
              {!step.done ? (
                <span className="shrink-0 self-center text-xs font-semibold text-[#433C93]">→</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
