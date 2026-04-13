import type { ReactNode } from "react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { utilityNavItems } from "@/features/dashboard/nav/utility-nav";

export default function NotificationsLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell navItems={utilityNavItems} className="bg-[#fafafa]">
      {children}
    </DashboardShell>
  );
}
