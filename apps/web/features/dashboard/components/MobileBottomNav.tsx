"use client";

import type { Route } from "next";
import Link from "next/link";
import {
  Bell,
  Briefcase,
  FileText,
  LayoutDashboard,
  LayoutGrid,
  MapPin,
  MessageSquare,
  Search,
  Settings,
  UserRound
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/features/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import { withWorkspaceLocale, pathnameForWorkspaceNavMatch } from "@/lib/i18n/workspace-path";
import { getActiveNavHref } from "@/features/dashboard/lib/dashboard-nav-active";
import type { DashboardNavIconKey, DashboardNavItem } from "@/features/dashboard/nav-types";

const NAV_ICONS: Record<DashboardNavIconKey, typeof LayoutDashboard> = {
  overview: LayoutGrid,
  profile: UserRound,
  proposals: FileText,
  nearby: MapPin,
  messages: MessageSquare,
  notifications: Bell,
  settings: Settings,
  clientOverview: LayoutDashboard,
  clientJobs: Briefcase,
  clientNearby: MapPin
};

type Props = {
  navItems: DashboardNavItem[];
  unreadMessages?: number;
};

function badge(n: number) {
  return n > 9 ? "9+" : String(n);
}

/** Mobile bottom navigation — 44px+ touch targets. */
export function MobileBottomNav({ navItems, unreadMessages = 0 }: Props) {
  const pathname = usePathname() ?? "";
  const { t, locale } = useI18n();
  const navMatchPath = pathnameForWorkspaceNavMatch(pathname);
  const activeHref = getActiveNavHref(navMatchPath, "", navItems);

  const primary = navItems.slice(0, 3);
  const jobsHref = withPublicLocale(locale, "/jobs") as Route;
  const messagesHref = withWorkspaceLocale(locale, "/messages") as Route;

  const tabs: Array<{
    key: string;
    href: Route;
    label: string;
    icon: typeof LayoutDashboard;
    badge: number;
    external?: boolean;
  }> = [
    ...primary.map((item) => ({
      key: item.href,
      href: withWorkspaceLocale(locale, item.href) as Route,
      label: t(item.labelKey),
      icon: item.iconKey ? NAV_ICONS[item.iconKey] : LayoutGrid,
      badge: 0
    })),
    {
      key: "browse-jobs",
      href: jobsHref,
      label: t("dashboardNav.freelancer.browseJobs") || "Jobs",
      icon: Search,
      badge: 0,
      external: true
    },
    {
      key: "messages",
      href: messagesHref,
      label: t("dashboardNav.shared.messages"),
      icon: MessageSquare,
      badge: unreadMessages
    }
  ].slice(0, 5);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden dark:border-slate-700 dark:bg-slate-950"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = !tab.external && (tab.href === activeHref || pathname.startsWith(`${tab.href}/`));
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors",
                  active ? "text-nw-brand" : "text-slate-600 dark:text-slate-400"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="max-w-full truncate">{tab.label}</span>
                {tab.badge > 0 ? (
                  <span className="absolute right-2 top-1 rounded-full bg-nw-danger px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {badge(tab.badge)}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
