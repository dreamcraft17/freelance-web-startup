import { LandingHero } from "@/components/marketing/LandingHero";
import { LandingUseCases } from "@/components/marketing/LandingUseCases";
import { LandingCategoryChips } from "@/components/marketing/LandingCategoryChips";
import { LandingFinalCta } from "@/components/marketing/LandingFinalCta";

export function LandingPage() {
  return (
    <main className="bg-[#f7f9fb] pb-8 pt-28 text-[#191c1e] antialiased selection:bg-indigo-100 selection:text-indigo-950 sm:pt-32">
      <LandingHero />
      <LandingUseCases />
      <LandingCategoryChips />
      <LandingFinalCta />
    </main>
  );
}
