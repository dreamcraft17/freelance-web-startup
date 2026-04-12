import { LandingPage } from "@/components/marketing/LandingPage";
import { MarketingNavBar } from "@/components/marketing/MarketingNavBar";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";

export default function HomePage() {
  return (
    <>
      <MarketingNavBar />
      <LandingPage />
      <MarketingSiteFooter />
    </>
  );
}
