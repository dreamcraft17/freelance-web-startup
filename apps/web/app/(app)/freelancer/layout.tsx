import type { ReactNode } from "react";
import { AccountStatus } from "@acme/types";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { freelancerNavItems } from "@/features/dashboard/nav/freelancer-nav";
import { FreelancerLaunchStrip } from "@/features/monetization/components/FreelancerLaunchStrip";
import { getSessionFromCookies } from "@src/lib/auth";
import { MessageService } from "@/server/services/message.service";
import { NotificationService } from "@/server/services/notification.service";

export default async function FreelancerDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSessionFromCookies();

  let unreadNotifications: number | undefined;
  let unreadMessages: number | undefined;
  if (session?.accountStatus === AccountStatus.ACTIVE) {
    // Sequential (not Promise.all): avoids paired connection checkouts against small session pools.
    unreadNotifications = await new NotificationService().countUnreadForUser(session.userId);
    unreadMessages = await new MessageService().countAwaitingReplyThreadsForUser(session.userId);
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
