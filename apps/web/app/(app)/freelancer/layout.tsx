import type { ReactNode } from "react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { freelancerNavItems } from "@/features/dashboard/nav/freelancer-nav";
import { FreelancerLaunchStrip } from "@/features/monetization/components/FreelancerLaunchStrip";
import { getSessionFromCookies } from "@src/lib/auth";

export default async function FreelancerDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSessionFromCookies();

  return (
    <DashboardShell
      navItems={freelancerNavItems}
      topBanner={session ? <FreelancerLaunchStrip userId={session.userId} /> : null}
      className="bg-[#fafafa]"
    >
      {children}
    </DashboardShell>
  );
}
