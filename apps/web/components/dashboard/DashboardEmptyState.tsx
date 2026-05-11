import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardEmptyStateProps = {
  icon: LucideIcon;
  kicker?: string;
  title: string;
  description: ReactNode;
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
        "rounded-xl border p-4 sm:p-5",
        elevated
          ? "nw-card nw-card-hover border-slate-200/90 ring-1 ring-slate-100/80"
          : "border-slate-200 bg-slate-50/50"
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
          {kicker ? <p className="nw-type-micro">{kicker}</p> : null}
          <h3
            className={cn(
              "font-semibold leading-snug text-slate-900",
              elevated ? "mt-1 text-base" : `text-[15px] ${kicker ? "mt-1" : ""}`
            )}
          >
            {title}
          </h3>
          <div className="nw-type-body mt-2">{description}</div>
          {(action ?? secondaryAction) ? (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              {action ? (
                <Link
                  href={action.href}
                  className={cn(
                    "inline-flex min-h-10 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200",
                    elevated ? "nw-cta-primary shadow-sm shadow-[#3525cd]/20" : "bg-[#3525cd] hover:bg-[#2d1fb0]"
                  )}
                >
                  {action.label}
                </Link>
              ) : null}
              {secondaryAction ? (
                <Link
                  href={secondaryAction.href}
                  className="nw-cta-secondary inline-flex min-h-10 items-center justify-center px-4 py-2.5 text-sm font-semibold"
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
