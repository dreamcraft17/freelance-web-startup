import { cn } from "@/lib/utils";

export type ContractStatusKind =
  | "OPEN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DISPUTED"
  | "PENDING"
  | "CANCELLED"
  | string;

const STATUS_STYLES: Record<string, string> = {
  OPEN: "border-nw-info/30 bg-nw-info/10 text-blue-800 dark:text-blue-200",
  IN_PROGRESS: "border-nw-warning/30 bg-nw-warning/10 text-amber-900 dark:text-amber-200",
  COMPLETED: "border-nw-success/30 bg-nw-success/10 text-emerald-900 dark:text-emerald-200",
  DISPUTED: "border-nw-danger/30 bg-nw-danger/10 text-red-900 dark:text-red-200",
  PENDING: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200",
  CANCELLED: "border-slate-300 bg-slate-50 text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400"
};

type Props = {
  status: ContractStatusKind;
  label?: string;
  className?: string;
};

export function StatusBadge({ status, label, className }: Props) {
  const key = status.toUpperCase();
  const style = STATUS_STYLES[key] ?? STATUS_STYLES.PENDING;

  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        style,
        className
      )}
    >
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}
