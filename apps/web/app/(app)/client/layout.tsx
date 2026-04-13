import type { ReactNode } from "react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { clientNavItems } from "@/features/dashboard/nav/client-nav";

export default function ClientDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell navItems={clientNavItems} className="bg-[#fafafa]">
      {children}
    </DashboardShell>
  );
}
