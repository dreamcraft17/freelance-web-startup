import type { LucideIcon } from "lucide-react";

type DashboardStatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
};

/** Linear-style KPI: border-only surface, muted icon, semibold figure. */
export function DashboardStatCard({ label, value, hint, icon: Icon }: DashboardStatCardProps) {
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
