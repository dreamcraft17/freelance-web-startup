import type { ReactNode } from "react";
import { AccountStatus } from "@acme/types";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { freelancerNavItems } from "@/features/dashboard/nav/freelancer-nav";
import { FreelancerLaunchStrip } from "@/features/monetization/components/FreelancerLaunchStrip";
import { getSessionFromCookies } from "@src/lib/auth";
import {
  getAwaitingReplyThreadCountCached,
  getUnreadNotificationCountCached
} from "@/lib/server/navigation-badges-cache";

export default async function FreelancerDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSessionFromCookies();

  let unreadNotifications: number | undefined;
  let unreadMessages: number | undefined;
  if (session?.accountStatus === AccountStatus.ACTIVE) {
    unreadNotifications = await getUnreadNotificationCountCached(session.userId);
    unreadMessages = await getAwaitingReplyThreadCountCached(session.userId);
  }

  return (
    <DashboardShell
      navItems={freelancerNavItems}
      topBanner={session ? <FreelancerLaunchStrip userId={session.userId} /> : null}
      className="bg-transparent"
      appearance="premium"
      workspaceSearch
      unreadNotifications={unreadNotifications}
      unreadMessages={unreadMessages}
    >
      {children}
    </DashboardShell>
  );
}
