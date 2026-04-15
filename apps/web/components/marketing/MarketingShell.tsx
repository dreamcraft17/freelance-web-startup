import type { ReactNode } from "react";
import { MarketingNavBar } from "@/components/marketing/MarketingNavBar";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { getSessionFromCookies } from "@src/lib/auth";

/** Shared chrome for marketing + public discovery pages (matches landing). */
export async function MarketingShell({ children }: { children: ReactNode }) {
  const session = await getSessionFromCookies();

  return (
    <div className="nw-page flex min-h-screen flex-col selection:bg-indigo-100 selection:text-indigo-950">
      <MarketingNavBar session={session} />
      <div className="flex-1 pt-24 sm:pt-28">{children}</div>
      <MarketingSiteFooter />
    </div>
  );
}
