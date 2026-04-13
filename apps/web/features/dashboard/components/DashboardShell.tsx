import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DashboardNav } from "./DashboardNav";
import type { DashboardNavItem } from "../nav-types";

export type { DashboardNavItem };

type DashboardShellProps = {
  navItems: DashboardNavItem[];
  children: ReactNode;
  /** Optional class on main content area */
  className?: string;
  /** Optional banner above page content (e.g. early access + quota hints). */
  topBanner?: ReactNode;
};

/**
 * Shared responsive shell for freelancer/client/utility app sections.
 * Navigation is configuration-driven (pass `navItems` from route layout).
 */
export function DashboardShell({ navItems, children, className, topBanner }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[#f4f4f5]">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-md md:hidden">
        <div className="border-b border-slate-100/80 px-3 pb-2.5 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#3525cd]">NearWork</p>
          <p className="mt-0.5 text-[11px] text-slate-500">Workspace</p>
        </div>
        <DashboardNav items={navItems} variant="mobile" />
      </header>

      <div className="flex min-h-[100dvh] min-h-screen">
        <aside
          className="sticky top-0 z-20 hidden h-[100dvh] max-h-screen w-[15.5rem] shrink-0 overflow-y-auto border-r border-slate-200/80 bg-white md:block"
          aria-label="Sidebar navigation"
        >
          <DashboardNav items={navItems} variant="sidebar" />
        </aside>

        <main className={cn("relative flex min-h-0 min-w-0 flex-1 flex-col", className)}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/80 to-transparent md:h-40" aria-hidden />

          <div className="relative mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            {topBanner ? (
              <div className="mb-8 lg:mb-10">
                <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm shadow-slate-900/[0.04] ring-1 ring-slate-900/[0.02]">
                  <div className="border-b border-slate-100/90 bg-gradient-to-r from-slate-50/90 via-white to-[#3525cd]/[0.03] px-4 py-2 sm:px-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Workspace</p>
                  </div>
                  <div className="p-4 sm:p-5">{topBanner}</div>
                </div>
              </div>
            ) : null}

            <div>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
