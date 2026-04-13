import { LandingPage } from "@/components/marketing/LandingPage";
import { MarketingShell } from "@/components/marketing/MarketingShell";

/** Public home — no redirect. Middleware treats "/" as public (browse-first). */
export default function HomePage() {
  return (
    <MarketingShell>
      <LandingPage />
    </MarketingShell>
  );
}
