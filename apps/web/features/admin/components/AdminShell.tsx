"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@acme/types";
import { AuthUserMenu } from "@/features/dashboard/components/AuthUserMenu";
import { allowedSectionsForRole, type AdminSectionKey } from "../lib/access";

type AdminShellProps = {
  role: UserRole;
  children: ReactNode;
};

type NavItem = {
  href: Route;
  label: string;
  section: AdminSectionKey;
};

const navItems: NavItem[] = [
  { href: "/admin", label: "Overview", section: "overview" },
  { href: "/admin/users", label: "Users", section: "users" },
  { href: "/admin/jobs", label: "Jobs", section: "jobs" },
  { href: "/admin/bids", label: "Bids", section: "bids" },
  { href: "/admin/contracts", label: "Contracts", section: "contracts" },
  { href: "/admin/verification", label: "Verification", section: "verification" },
  { href: "/admin/reviews", label: "Reviews", section: "reviews" },
  { href: "/admin/reports", label: "Reports", section: "reports" },
  { href: "/admin/donations", label: "Donations", section: "donations" },
  { href: "/admin/subscriptions", label: "Subscriptions", section: "subscriptions" },
  { href: "/admin/feature-flags", label: "Feature Flags", section: "feature-flags" },
  { href: "/admin/settings", label: "Settings", section: "settings" }
];

const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  SUPPORT_ADMIN: "Support",
  MODERATOR: "Moderator",
  FINANCE_ADMIN: "Finance"
};

export function AdminShell({ role, children }: AdminShellProps) {
  const pathname = usePathname() ?? "/admin";
  const allowed = new Set(allowedSectionsForRole(role));
  const visibleNav = navItems.filter((item) => allowed.has(item.section));
  const currentLabel = visibleNav.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-slate-950 text-slate-100 lg:block">
          <div className="border-b border-slate-800 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">NearWork</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Internal Admin</h2>
          </div>
          <nav className="space-y-1 px-3 py-4">
            {visibleNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm transition",
                    active ? "bg-slate-800 font-semibold text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Internal tools</p>
                <h1 className="text-lg font-semibold text-slate-900">{currentLabel ?? "Admin"}</h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {roleLabel[role] ?? role}
                </span>
                <AuthUserMenu compact />
              </div>
            </div>
          </header>
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

