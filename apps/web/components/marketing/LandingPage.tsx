import { LandingHero } from "@/components/marketing/LandingHero";
import { LandingProductPreview } from "@/components/marketing/LandingProductPreview";
import { LandingUseCases } from "@/components/marketing/LandingUseCases";
import { LandingCategoryChips } from "@/components/marketing/LandingCategoryChips";
import { LandingFinalCta } from "@/components/marketing/LandingFinalCta";

export function LandingPage() {
  return (
    <main className="nw-page pb-16 text-[#191c1e] selection:bg-[#3525cd]/15 selection:text-slate-950">
      <LandingHero />
      <LandingCategoryChips />
      <LandingProductPreview />
      <LandingUseCases />
      <LandingFinalCta />
    </main>
  );
}
