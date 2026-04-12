import type { ReactNode } from "react";
import { MarketingNavBar } from "@/components/marketing/MarketingNavBar";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fb]">
      <MarketingNavBar />
      <div className="flex-1 pt-16 sm:pt-20">{children}</div>
      <MarketingSiteFooter />
    </div>
  );
}
