"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Briefcase,
  FileText,
  LayoutDashboard,
  LayoutGrid,
  MapPin,
  MessageSquare,
  Settings,
  UserRound
} from "lucide-react";
import { useI18n } from "@/features/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/features/shared/components/BrandLogo";
import { getActiveNavHref } from "../lib/dashboard-nav-active";
import type { DashboardNavIconKey, DashboardNavItem } from "../nav-types";

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

type DashboardNavProps = {
  items: DashboardNavItem[];
  variant: "sidebar" | "mobile";
  appearance?: "default" | "premium";
};

export function DashboardNav({ items, variant, appearance = "default" }: DashboardNavProps) {
  const { t } = useI18n();
  const pathname = usePathname() ?? "";
  const [hash, setHash] = useState("");

  useEffect(() => {
    setHash(typeof window !== "undefined" ? window.location.hash : "");
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [pathname]);

  const activeHref = getActiveNavHref(pathname, hash, items);

  if (variant === "mobile") {
    return (
      <nav className="flex gap-1.5 overflow-x-auto px-3 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const isActive = item.href === activeHref;
          const Icon = item.iconKey ? NAV_ICONS[item.iconKey] : null;
          return (
            <Link
              key={`${item.href}-${item.labelKey}`}
              href={item.href as Route}
              prefetch
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-[#3525cd] text-white shadow-sm shadow-[#3525cd]/25"
                  : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/90 hover:text-slate-900"
              )}
            >
              {Icon ? <Icon className="h-3.5 w-3.5 opacity-90" aria-hidden /> : null}
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    );
  }

  let lastSection: string | undefined;
  return (
    <nav className={cn("flex flex-col gap-1 px-2 py-4", appearance === "premium" ? "px-3" : "")} aria-label="Workspace">
      <div
        className={cn(
          "mb-1 border-b border-slate-100/90 px-2 pb-4",
          appearance === "premium" ? "mx-2 border-slate-200/60 pb-5" : ""
        )}
      >
        <BrandLogo imageClassName="h-6 w-auto" alt="NearWork logo" />
        <p className="mt-1 text-xs leading-snug text-slate-500">{t("workspace.label")}</p>
      </div>
      {items.map((item, index) => {
        const section = item.sectionKey ? t(item.sectionKey) : undefined;
        const showHeading = Boolean(section && section !== lastSection);
        if (section) lastSection = section;
        const isActive = item.href === activeHref;
        const Icon = item.iconKey ? NAV_ICONS[item.iconKey] : null;

        return (
          <div key={`${item.href}-${item.labelKey}`}>
            {showHeading ? (
              <p
                className={cn(
                  "mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider",
                  appearance === "premium" ? "text-[#3525cd]/65" : "text-slate-400",
                  index === 0 ? (appearance === "premium" ? "mt-3" : "mt-0.5") : "mt-5"
                )}
              >
                {section}
              </p>
            ) : null}
            <Link
              href={item.href as Route}
              prefetch
              className={cn(
                "flex items-center gap-3 rounded-xl py-2.5 pl-3 pr-2.5 text-[13px] font-medium leading-snug transition-colors",
                appearance === "premium" &&
                  "border border-transparent hover:border-slate-200/80 hover:bg-slate-50/90",
                isActive
                  ? appearance === "premium"
                    ? "border-[#3525cd]/22 bg-gradient-to-r from-[#3525cd]/13 to-transparent font-semibold text-[#3525cd] shadow-sm shadow-[#3525cd]/14"
                    : "border-l-[3px] border-l-[#3525cd] bg-[#3525cd]/[0.09] font-semibold text-[#3525cd] shadow-sm ring-1 ring-[#3525cd]/10"
                  : appearance === "default"
                    ? "border-l-[3px] border-l-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    : "text-slate-600 hover:border-slate-200/70 hover:bg-white hover:text-slate-900",
                appearance === "default" && !isActive && "rounded-lg py-2"
              )}
            >
              {Icon ? (
                <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-[#3525cd]" : "text-slate-400")} aria-hidden />
              ) : null}
              <span className={cn(variant === "sidebar" ? "truncate" : "")}>{t(item.labelKey)}</span>
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
