import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardStatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  /** Stronger surface for client / marketing-style dashboards */
  variant?: "default" | "emphasized";
};

export function DashboardStatCard({
  label,
  value,
  hint,
  icon: Icon,
  variant = "default"
}: DashboardStatCardProps) {
  if (variant === "emphasized") {
    return (
      <div
        className={cn(
          "group relative overflow-hidden rounded-lg border border-slate-200/95 bg-gradient-to-br from-white via-white to-slate-50/90 px-4 py-4 shadow-sm shadow-slate-900/[0.05] ring-1 ring-slate-100/90 transition",
          "hover:border-slate-300/90 hover:shadow-md hover:shadow-slate-900/[0.06] sm:px-5 sm:py-4"
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3525cd]/18 to-transparent"
          aria-hidden
        />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">{value}</p>
            {hint ? <p className="mt-1.5 text-xs leading-snug text-slate-500">{hint}</p> : null}
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#3525cd]/10 to-violet-600/8 text-[#3525cd] ring-1 ring-[#3525cd]/10">
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 transition-colors hover:border-slate-300/90">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{value}</p>
          {hint ? <p className="mt-1.5 text-xs leading-snug text-slate-500">{hint}</p> : null}
        </div>
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" strokeWidth={1.5} aria-hidden />
      </div>
    </div>
  );
}
