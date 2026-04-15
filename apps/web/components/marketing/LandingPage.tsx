import { LandingHero } from "@/components/marketing/LandingHero";
import { LandingProductPreview } from "@/components/marketing/LandingProductPreview";
import { LandingUseCases } from "@/components/marketing/LandingUseCases";
import { LandingCategoryChips } from "@/components/marketing/LandingCategoryChips";
import { LandingFinalCta } from "@/components/marketing/LandingFinalCta";

export function LandingPage() {
  return (
    <main className="nw-page pb-12 pt-3 text-[#191c1e] selection:bg-indigo-100 selection:text-indigo-950 sm:pt-4">
      <LandingHero />
      <LandingProductPreview />
      <LandingUseCases />
      <LandingCategoryChips />
      <LandingFinalCta />
    </main>
  );
}
