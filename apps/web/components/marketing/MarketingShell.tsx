import type { ReactNode } from "react";
import { MarketingNavBar } from "@/components/marketing/MarketingNavBar";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";

/** Shared chrome for marketing + public discovery pages (matches landing). */
export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fb] text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-950">
      <MarketingNavBar />
      <div className="flex-1 pt-24 sm:pt-28">{children}</div>
      <MarketingSiteFooter />
    </div>
  );
}
