import type { ReactNode } from "react";
import { PublicSiteHeader } from "@/features/public/components/PublicSiteHeader";

export default function PublicBrowseLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicSiteHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
