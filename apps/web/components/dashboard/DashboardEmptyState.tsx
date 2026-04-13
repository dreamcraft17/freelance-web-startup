import type { Route } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type DashboardEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: Route };
  secondaryAction?: { label: string; href: Route };
};

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction
}: DashboardEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center sm:px-10">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
        <Icon className="h-7 w-7 text-[#3525cd]" aria-hidden />
      </span>
      <h3 className="mt-5 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">{description}</p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
        {action ? (
          <Link
            href={action.href}
            className="inline-flex items-center justify-center rounded-xl bg-[#3525cd] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4f46e5]"
          >
            {action.label}
          </Link>
        ) : null}
        {secondaryAction ? (
          <Link
            href={secondaryAction.href}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {secondaryAction.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
