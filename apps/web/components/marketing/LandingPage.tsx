import { LandingHero } from "@/components/marketing/LandingHero";
import { LandingFeaturesBento } from "@/components/marketing/LandingFeaturesBento";
import { LandingHowItWorks } from "@/components/marketing/LandingHowItWorks";
import { LandingCategoriesGrid } from "@/components/marketing/LandingCategoriesGrid";
import { LandingSpotlight } from "@/components/marketing/LandingSpotlight";
import { LandingFinalCta } from "@/components/marketing/LandingFinalCta";

export function LandingPage() {
  return (
    <main className="bg-[#f7f9fb] text-slate-900 antialiased">
      <LandingHero />
      <LandingFeaturesBento />
      <LandingHowItWorks />
      <LandingCategoriesGrid />
      <LandingSpotlight />
      <LandingFinalCta />
    </main>
  );
}
