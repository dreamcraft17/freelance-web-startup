"use client";

import { Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthUserMenu } from "@/features/dashboard/components/AuthUserMenu";

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "Admin",
  SUPPORT_ADMIN: "Support",
  MODERATOR: "Moderator",
  FINANCE_ADMIN: "Finance"
};

type AdminTopBarProps = {
  pageTitle: string;
  staffRole: string;
  onOpenMobileNav: () => void;
};

export function AdminTopBar({ pageTitle, staffRole, onOpenMobileNav }: AdminTopBarProps) {
  const badge = ROLE_BADGE[staffRole] ?? staffRole;

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-slate-200/90 bg-white">
      <div className="flex h-12 items-center gap-3 px-3 sm:px-4">
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-slate-300 hover:text-slate-900 lg:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">NearWork · Internal</p>
          <h1 className="truncate text-base font-semibold leading-tight tracking-tight text-slate-900 sm:text-[17px]">
            {pageTitle}
          </h1>
        </div>

        <div
          role="search"
          aria-label="Workspace search (coming soon)"
          className={cn(
            "hidden max-w-[min(100%,20rem)] flex-1 items-center lg:flex",
            "rounded-md border border-slate-200/90 bg-slate-50/80 px-2.5 py-1.5 text-sm text-slate-400"
          )}
        >
          <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
          <span className="truncate text-[13px]">Search workspace…</span>
          <kbd className="ml-auto hidden shrink-0 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 sm:inline">
            Soon
          </kbd>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span
            className="max-w-[4.5rem] truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-700 sm:max-w-none sm:text-[11px]"
            title={badge}
          >
            {badge}
          </span>
          <AuthUserMenu compact variant="admin" />
        </div>
      </div>
    </header>
  );
}
