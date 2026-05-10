"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Bell, MessageSquare, Search } from "lucide-react";
import { LocaleSwitcher } from "@/features/i18n/LocaleSwitcher";
import { useI18n } from "@/features/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/features/shared/components/BrandLogo";
import { DashboardNav } from "./DashboardNav";
import { AuthUserMenu } from "./AuthUserMenu";
import { SidebarAccountActions } from "./SidebarAccountActions";
import { WorkspaceCommunitySidebarCard } from "./WorkspaceCommunitySidebarCard";
import type { DashboardNavItem } from "../nav-types";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import { withWorkspaceLocale } from "@/lib/i18n/workspace-path";

export type { DashboardNavItem };

type DashboardShellProps = {
  navItems: DashboardNavItem[];
  children: ReactNode;
  /** Optional class on main content area */
  className?: string;
  /** Optional banner above page content (e.g. early access + quota hints). */
  topBanner?: ReactNode;
  /** Freelancer-facing premium shell — floating sidebar, softer canvas. */
  appearance?: "default" | "premium";
  /** Desktop jobs keyword discovery (posts to `/jobs`). */
  workspaceSearch?: boolean;
  /** Navbar badge counts (awaiting reply threads; matches marketing nav semantics). */
  unreadMessages?: number;
  unreadNotifications?: number;
};

function badgeChip(n: number): string {
  return n > 9 ? "9+" : String(n);
}

/**
 * Shared responsive shell for freelancer/client/utility app sections.
 * Navigation is configuration-driven (pass `navItems` from route layout).
 */
export function DashboardShell({
  navItems,
  children,
  className,
  topBanner,
  appearance = "default",
  workspaceSearch = false,
  unreadMessages,
  unreadNotifications
}: DashboardShellProps) {
  const { t, locale } = useI18n();
  const showMessageBadge =
    unreadMessages !== undefined && typeof unreadMessages === "number" && unreadMessages > 0;
  const showNotifBadge =
    unreadNotifications !== undefined && typeof unreadNotifications === "number" && unreadNotifications > 0;

  return (
    <div className={cn("nw-page min-h-screen", appearance === "premium" ? "bg-[#f4f5fb]" : "")}>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)] md:hidden">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100/80 px-3 pb-2.5 pt-3">
          <div>
            <BrandLogo imageClassName="h-5 w-auto" alt="NearWork logo" />
            <p className="mt-0.5 text-[11px] text-slate-500">{t("workspace.label")}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LocaleSwitcher />
            <AuthUserMenu compact />
          </div>
        </div>
        <DashboardNav items={navItems} variant="mobile" appearance={appearance} />
      </header>

      <div className={cn("flex min-h-[100dvh] min-h-screen", appearance === "premium" ? "md:gap-0" : "")}>
        {appearance === "premium" ? (
          <aside
            className="sticky top-0 z-20 hidden shrink-0 self-start md:flex md:w-[18rem] lg:w-[18.5rem]"
            aria-label="Sidebar navigation"
          >
            <div className="mx-auto flex min-h-[100dvh] w-full justify-center px-4 py-7 lg:py-10">
              <div
                className={cn(
                  "flex max-h-[calc(100dvh-3.5rem)] w-full flex-col overflow-hidden rounded-3xl",
                  "border border-slate-200/65 bg-white/90 shadow-[12px_12px_48px_-24px_rgba(53,37,205,0.35)] backdrop-blur-md"
                )}
              >
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <DashboardNav items={navItems} variant="sidebar" appearance="premium" />
                </div>
                <WorkspaceCommunitySidebarCard />
                <SidebarAccountActions compact />
              </div>
            </div>
          </aside>
        ) : (
          <aside
            className="sticky top-0 z-20 hidden h-[100dvh] max-h-screen w-[15.5rem] shrink-0 border-r border-slate-200/80 bg-white md:flex md:flex-col"
            aria-label="Sidebar navigation"
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              <DashboardNav items={navItems} variant="sidebar" />
            </div>
            <SidebarAccountActions />
          </aside>
        )}

        <main
          className={cn(
            "relative flex min-h-0 min-w-0 flex-1 flex-col",
            appearance === "premium" ?
              cn("rounded-none bg-transparent", className)
            : cn(className)
          )}
        >
          <div
            className={cn(
              "relative mx-auto w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10",
              appearance === "premium" ? "max-w-[120rem] py-6 lg:px-14 lg:py-11" : "max-w-7xl lg:py-10"
            )}
          >
            <div
              className={cn(
                "mb-6 hidden flex-wrap items-center gap-x-3 gap-y-2 md:flex md:justify-end",
                workspaceSearch && "justify-between md:justify-between"
              )}
            >
              {workspaceSearch ? (
                <form
                  action={withPublicLocale(locale, "/jobs")}
                  method="get"
                  className="relative min-w-[220px] max-w-xl flex-1"
                  role="search"
                  aria-label={t("workspace.dashboardSearchAria")}
                >
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                  <input
                    type="search"
                    name="keyword"
                    placeholder={t("workspace.dashboardSearchPlaceholder")}
                    className={cn(
                      "w-full rounded-2xl border border-slate-200/85 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none ring-[#3525cd]/25 transition",
                      "placeholder:text-slate-400 focus-visible:border-[#3525cd]/55 focus-visible:ring-[3px]"
                    )}
                  />
                </form>
              ) : null}

              <div className={cn("flex flex-wrap items-center justify-end gap-2", workspaceSearch ? "sm:justify-end" : "")}>
                {unreadMessages !== undefined ? (
                  <Link
                    href={withWorkspaceLocale(locale, "/messages") as Route}
                    prefetch
                    className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-700 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.12)] transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3525cd]/35 focus-visible:ring-offset-2"
                    aria-label={t("workspace.inboxAria")}
                  >
                    <MessageSquare className="h-5 w-5" aria-hidden />
                    {showMessageBadge ? (
                      <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 translate-x-0.5 items-center justify-center rounded-full bg-[#3525cd] px-1 text-[10px] font-bold text-white shadow-sm">
                        {badgeChip(unreadMessages)}
                      </span>
                    ) : null}
                  </Link>
                ) : null}

                {unreadNotifications !== undefined ? (
                  <Link
                    href={withWorkspaceLocale(locale, "/notifications") as Route}
                    prefetch
                    className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-700 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.12)] transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3525cd]/35 focus-visible:ring-offset-2"
                    aria-label={t("workspace.notificationsAria")}
                  >
                    <Bell className="h-5 w-5" aria-hidden />
                    {showNotifBadge ? (
                      <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 translate-x-0.5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm">
                        {badgeChip(unreadNotifications)}
                      </span>
                    ) : null}
                  </Link>
                ) : null}

                <LocaleSwitcher />
                <AuthUserMenu />
              </div>
            </div>
            {topBanner ? (
              <div className="mb-8 lg:mb-10">
                <div
                  className={cn(
                    "overflow-hidden border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
                    appearance === "premium" ? "rounded-3xl" : "rounded-xl"
                  )}
                >
                  <div className="border-b border-slate-100 px-4 py-2 sm:px-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {t("workspace.bannerLabel")}
                    </p>
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
