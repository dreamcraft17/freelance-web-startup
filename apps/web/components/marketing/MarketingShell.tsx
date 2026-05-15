import type { ReactNode } from "react";
import { MarketingNavBar } from "@/components/marketing/MarketingNavBar";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { getSessionFromCookies } from "@src/lib/auth";
import {
  getAwaitingReplyThreadCountCached,
  getUnreadNotificationCountCached
} from "@/lib/server/navigation-badges-cache";

/** Shared chrome for marketing + public discovery pages (matches landing). */
export async function MarketingShell({ children }: { children: ReactNode }) {
  const session = await getSessionFromCookies();
  let unreadNotifications = 0;
  let unreadMessages = 0;
  if (session && session.accountStatus === "ACTIVE") {
    // Sequential + per-request cache: avoids parallel badge queries against small session pools.
    unreadNotifications = await getUnreadNotificationCountCached(session.userId);
    unreadMessages = await getAwaitingReplyThreadCountCached(session.userId);
  }

  return (
    <div className="nw-page flex min-h-screen flex-col selection:bg-indigo-100 selection:text-indigo-950">
      <MarketingNavBar
        session={session}
        unreadNotifications={unreadNotifications}
        unreadMessages={unreadMessages}
      />
      <div className="flex-1 pt-24 sm:pt-28">{children}</div>
      <MarketingSiteFooter />
    </div>
  );
}
