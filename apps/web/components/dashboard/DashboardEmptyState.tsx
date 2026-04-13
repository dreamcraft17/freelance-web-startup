import type { Route } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type DashboardEmptyStateProps = {
  icon: LucideIcon;
  kicker?: string;
  title: string;
  description: string;
  action?: { label: string; href: Route };
  secondaryAction?: { label: string; href: Route };
};

/** Notion-like empty row: calm surface, readable hierarchy, restrained accent. */
export function DashboardEmptyState({
  icon: Icon,
  kicker,
  title,
  description,
  action,
  secondaryAction
}: DashboardEmptyStateProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <Icon className="h-8 w-8 shrink-0 text-slate-400 sm:mt-0.5" strokeWidth={1.5} aria-hidden />
        <div className="min-w-0 flex-1">
          {kicker ? (
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{kicker}</p>
          ) : null}
          <h3 className={`text-[15px] font-semibold leading-snug text-slate-900 ${kicker ? "mt-1" : ""}`}>
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
          {(action ?? secondaryAction) ? (
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              {action ? (
                <Link
                  href={action.href}
                  className="inline-flex items-center justify-center rounded-md bg-[#3525cd] px-3.5 py-2 text-sm font-medium text-white transition hover:bg-[#2d1fb0]"
                >
                  {action.label}
                </Link>
              ) : null}
              {secondaryAction ? (
                <Link
                  href={secondaryAction.href}
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
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
