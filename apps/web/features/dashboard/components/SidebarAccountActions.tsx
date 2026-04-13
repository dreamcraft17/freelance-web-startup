"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./LogoutButton";

export function SidebarAccountActions() {
  const pathname = usePathname() ?? "";
  const settingsActive = pathname === "/settings" || pathname.startsWith("/settings/");

  return (
    <div className="border-t border-slate-100/90 px-3 py-3">
      <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Account</p>
      <div className="space-y-1.5">
        <Link
          href={"/settings" as Route}
          className={cn(
            "flex items-center gap-2 rounded-lg py-2 pl-3 pr-2.5 text-[13px] font-medium leading-snug transition-colors",
            settingsActive
              ? "border-l-[3px] border-l-[#3525cd] bg-[#3525cd]/[0.09] font-semibold text-[#3525cd] shadow-sm ring-1 ring-[#3525cd]/10"
              : "border-l-[3px] border-l-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" aria-hidden />
          Settings
        </Link>
        <LogoutButton compact className="pt-0.5" />
      </div>
    </div>
  );
}
