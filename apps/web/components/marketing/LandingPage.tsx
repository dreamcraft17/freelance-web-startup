import { LandingHero, type LandingCategoryOption } from "@/components/marketing/LandingHero";
import { LandingHomeSections } from "@/components/marketing/LandingHomeSections";
import { LandingLiveMarketplacePreview } from "@/components/marketing/LandingLiveMarketplacePreview";
import {
  LandingV2CategoryBrowse,
  LandingV2CtaFaq,
  LandingV2SocialProof,
  LandingV2TrustSafety
} from "@/components/marketing/LandingV2Sections";
import { CategoryService } from "@/server/services/category.service";
import { PublicStatsService } from "@/server/services/public-stats.service";

export type LandingIntent = "hire" | "work" | "neutral";

export function resolveLandingIntent(intent: string | undefined): LandingIntent {
  if (intent === "hire") return "hire";
  if (intent === "work") return "work";
  return "hire";
}

async function loadLandingCategories(): Promise<LandingCategoryOption[]> {
  try {
    const catRes = await new CategoryService().list({ page: 1, limit: 100 });
    if (catRes.mode !== "categories") return [];
    return catRes.items.map((c) => ({ id: c.id, name: c.name }));
  } catch {
    return [];
  }
}

export async function LandingPage({
  intent = "hire",
  homePath = "/"
}: {
  intent?: LandingIntent;
  homePath?: string;
}) {
  const categories = await loadLandingCategories();
  const marketplaceMomentum = await new PublicStatsService().getMarketplaceMomentumSnapshot();

  return (
    <main className="nw-page pb-16 text-[#071027] selection:bg-nw-brand/15 selection:text-[#071027] dark:text-slate-100">
      <LandingHero intent={intent} homePath={homePath} categories={categories} marketplaceMomentum={marketplaceMomentum} />
      <LandingV2CategoryBrowse categories={categories} />
      <LandingLiveMarketplacePreview />
      <LandingHomeSections />
      <LandingV2SocialProof momentum={marketplaceMomentum} />
      <LandingV2TrustSafety />
      <LandingV2CtaFaq />
    </main>
  );
}
