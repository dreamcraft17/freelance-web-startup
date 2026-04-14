"use client";

import Link from "next/link";
import type { Route } from "next";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/features/shared/components/BrandLogo";
import { ADMIN_NAV_GROUP_ORDER, type AdminNavGroup, type AdminNavItem } from "./admin-nav-config";

type AdminSidebarProps = {
  items: AdminNavItem[];
  pathname: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

function groupLabel(group: AdminNavGroup): string {
  switch (group) {
    case "Core":
      return "Core";
    case "Operations":
      return "Operations";
    case "Finance":
      return "Finance";
    case "Platform":
      return "Platform";
    default:
      return group;
  }
}

export function AdminSidebar({ items, pathname, mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const grouped = ADMIN_NAV_GROUP_ORDER.map((group) => ({
    group,
    items: items.filter((item) => item.group === group)
  }));

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-2 rounded-md border border-transparent px-2.5 py-1.5 text-[13px] leading-snug transition-colors",
      active
        ? "border-[#3525cd]/25 bg-[#3525cd]/[0.08] font-semibold text-[#2d1fa8]"
        : "font-medium text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
    );

  const NavInner = (
    <>
      <div className="flex h-[52px] shrink-0 items-center justify-between gap-2 border-b border-slate-200/90 px-3">
        <div className="min-w-0">
          <BrandLogo href={"/admin" as Route} imageClassName="h-6 w-auto opacity-95" alt="NearWork" />
          <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Internal admin
          </p>
        </div>
        <button
          type="button"
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          onClick={onCloseMobile}
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {grouped.map(({ group, items: groupItems }) =>
          groupItems.length ? (
            <div key={group} className="mb-4 last:mb-0">
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {groupLabel(group)}
              </p>
              <ul className="space-y-0.5">
                {groupItems.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin" || pathname === "/admin/"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href as Route}
                        className={linkClass(active)}
                        aria-current={active ? "page" : undefined}
                        onClick={onCloseMobile}
                      >
                        {active ? (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#3525cd]" aria-hidden />
                        ) : (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-transparent" aria-hidden />
                        )}
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null
        )}
      </nav>
    </>
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-[1px] transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!mobileOpen}
        onClick={onCloseMobile}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-slate-200 bg-white shadow-sm transition-transform duration-200 ease-out lg:static lg:z-0 lg:translate-x-0 lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Admin navigation"
      >
        {NavInner}
      </aside>
    </>
  );
}
