"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { UserRole } from "@acme/types";
import { allowedSectionsForRole } from "../lib/access";
import { ADMIN_NAV_ITEMS } from "./admin-nav-config";
import { AdminMainContent } from "./AdminMainContent";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";

type AdminShellProps = {
  role: UserRole;
  children: ReactNode;
};

export function AdminShell({ role, children }: AdminShellProps) {
  const pathname = usePathname() ?? "/admin";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  const allowed = new Set(allowedSectionsForRole(role));
  const visibleNav = ADMIN_NAV_ITEMS.filter((item) => allowed.has(item.section));

  const currentLabel = visibleNav.find((item) =>
    item.href === "/admin"
      ? pathname === "/admin" || pathname === "/admin/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`)
  )?.label;

  const pageTitle = currentLabel ?? "Admin";

  return (
    <div className="nw-page min-h-screen">
      <div className="flex min-h-screen">
        <AdminSidebar
          items={visibleNav}
          pathname={pathname}
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-0">
          <AdminTopBar pageTitle={pageTitle} staffRole={role} onOpenMobileNav={() => setMobileNavOpen(true)} />
          <AdminMainContent>{children}</AdminMainContent>
        </div>
      </div>
    </div>
  );
}
