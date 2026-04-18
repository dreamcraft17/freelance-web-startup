import type { ReactNode } from "react";
import { MarketingNavBar } from "@/components/marketing/MarketingNavBar";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { getSessionFromCookies } from "@src/lib/auth";
import { NotificationService } from "@/server/services/notification.service";

/** Shared chrome for marketing + public discovery pages (matches landing). */
export async function MarketingShell({ children }: { children: ReactNode }) {
  const session = await getSessionFromCookies();
  const unreadNotifications =
    session && session.accountStatus === "ACTIVE"
      ? await new NotificationService().countUnreadForUser(session.userId)
      : 0;

  return (
    <div className="nw-page flex min-h-screen flex-col selection:bg-indigo-100 selection:text-indigo-950">
      <MarketingNavBar session={session} unreadNotifications={unreadNotifications} />
      <div className="flex-1 pt-24 sm:pt-28">{children}</div>
      <MarketingSiteFooter />
    </div>
  );
}
