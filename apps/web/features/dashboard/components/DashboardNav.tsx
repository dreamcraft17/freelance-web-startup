"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/features/shared/components/BrandLogo";
import { getActiveNavHref } from "../lib/dashboard-nav-active";
import type { DashboardNavItem } from "../nav-types";

type DashboardNavProps = {
  items: DashboardNavItem[];
  variant: "sidebar" | "mobile";
};

export function DashboardNav({ items, variant }: DashboardNavProps) {
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
          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href as Route}
              prefetch
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-[#3525cd] text-white shadow-sm shadow-[#3525cd]/25"
                  : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/90 hover:text-slate-900"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  let lastSection: string | undefined;
  return (
    <nav className="flex flex-col gap-0.5 px-3 py-4" aria-label="Workspace">
      <div className="mb-2 border-b border-slate-100/90 px-2 pb-4">
        <BrandLogo imageClassName="h-6 w-auto" alt="NearWork logo" />
        <p className="mt-1 text-xs leading-snug text-slate-500">Workspace</p>
      </div>
      {items.map((item, index) => {
        const section = item.section;
        const showHeading = Boolean(section && section !== lastSection);
        if (section) lastSection = section;
        const isActive = item.href === activeHref;

        return (
          <div key={`${item.href}-${item.label}`}>
            {showHeading ? (
              <p
                className={cn(
                  "mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400",
                  index === 0 ? "mt-0.5" : "mt-5"
                )}
              >
                {section}
              </p>
            ) : null}
            <Link
              href={item.href as Route}
              prefetch
              className={cn(
                "block rounded-lg py-2 pl-3 pr-2.5 text-[13px] font-medium leading-snug transition-colors",
                isActive
                  ? "border-l-[3px] border-l-[#3525cd] bg-[#3525cd]/[0.09] font-semibold text-[#3525cd] shadow-sm ring-1 ring-[#3525cd]/10"
                  : "border-l-[3px] border-l-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {item.label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
