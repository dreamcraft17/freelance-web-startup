import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  selected?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
};

export function SkillTag({ label, selected, removable, onRemove, onClick, className }: Props) {
  const interactive = Boolean(onClick);

  return (
    <span
      className={cn(
        "inline-flex min-h-8 max-w-full items-center gap-1 rounded-lg border px-2.5 py-1 text-sm font-medium transition-colors",
        selected
          ? "border-nw-brand/35 bg-nw-brand/10 text-nw-brand"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200",
        interactive && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {interactive ? (
        <button type="button" onClick={onClick} className="truncate text-left">
          {label}
        </button>
      ) : (
        <span className="truncate">{label}</span>
      )}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="nw-touch-target -mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800"
          aria-label={`Remove ${label}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </span>
  );
}
