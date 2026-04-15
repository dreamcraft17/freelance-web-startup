import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/features/shared/components/BrandLogo";
import { DashboardNav } from "./DashboardNav";
import { AuthUserMenu } from "./AuthUserMenu";
import { SidebarAccountActions } from "./SidebarAccountActions";
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
    <div className="nw-page min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)] md:hidden">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100/80 px-3 pb-2.5 pt-3">
          <div>
            <BrandLogo imageClassName="h-5 w-auto" alt="NearWork logo" />
            <p className="mt-0.5 text-[11px] text-slate-500">Workspace</p>
          </div>
          <AuthUserMenu compact />
        </div>
        <DashboardNav items={navItems} variant="mobile" />
      </header>

      <div className="flex min-h-[100dvh] min-h-screen">
        <aside
          className="sticky top-0 z-20 hidden h-[100dvh] max-h-screen w-[15.5rem] shrink-0 border-r border-slate-200/80 bg-white md:flex md:flex-col"
          aria-label="Sidebar navigation"
        >
          <div className="min-h-0 flex-1 overflow-y-auto">
            <DashboardNav items={navItems} variant="sidebar" />
          </div>
          <SidebarAccountActions />
        </aside>

        <main className={cn("relative flex min-h-0 min-w-0 flex-1 flex-col", className)}>
          <div className="relative mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            <div className="mb-5 hidden justify-end md:flex">
              <AuthUserMenu />
            </div>
            {topBanner ? (
              <div className="mb-8 lg:mb-10">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <div className="border-b border-slate-100 px-4 py-2 sm:px-5">
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
