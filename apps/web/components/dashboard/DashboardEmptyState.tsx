import type { Route } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardEmptyStateProps = {
  icon: LucideIcon;
  kicker?: string;
  title: string;
  description: string;
  action?: { label: string; href: Route };
  secondaryAction?: { label: string; href: Route };
  /** Richer treatment: icon well, white surface, clearer CTAs */
  tone?: "default" | "elevated";
};

export function DashboardEmptyState({
  icon: Icon,
  kicker,
  title,
  description,
  action,
  secondaryAction,
  tone = "default"
}: DashboardEmptyStateProps) {
  const elevated = tone === "elevated";

  return (
    <div
      className={cn(
        "rounded-lg border p-4 sm:p-5",
        elevated
          ? "border-slate-200/90 bg-white shadow-sm shadow-slate-900/[0.04] ring-1 ring-slate-100/90"
          : "border-slate-200 bg-slate-50/40"
      )}
    >
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-start sm:gap-4">
        {elevated ? (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#3525cd]/[0.08] text-[#3525cd] ring-1 ring-[#3525cd]/10">
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
        ) : (
          <Icon className="h-8 w-8 shrink-0 text-slate-400 sm:mt-0.5" strokeWidth={1.5} aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          {kicker ? (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{kicker}</p>
          ) : null}
          <h3
            className={cn(
              "font-semibold leading-snug text-slate-900",
              elevated ? "mt-1 text-base" : `text-[15px] ${kicker ? "mt-1" : ""}`
            )}
          >
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
          {(action ?? secondaryAction) ? (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              {action ? (
                <Link
                  href={action.href}
                  className={cn(
                    "inline-flex items-center justify-center rounded-md px-3.5 py-2.5 text-sm font-semibold text-white transition",
                    elevated
                      ? "bg-[#3525cd] shadow-sm shadow-[#3525cd]/25 hover:bg-[#2d1fb0]"
                      : "bg-[#3525cd] font-medium hover:bg-[#2d1fb0]"
                  )}
                >
                  {action.label}
                </Link>
              ) : null}
              {secondaryAction ? (
                <Link
                  href={secondaryAction.href}
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {secondaryAction.label}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
