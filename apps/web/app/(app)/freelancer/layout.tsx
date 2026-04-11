import type { ReactNode } from "react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { freelancerNavItems } from "@/features/dashboard/nav/freelancer-nav";

export default function FreelancerDashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell navItems={freelancerNavItems}>{children}</DashboardShell>;
}
