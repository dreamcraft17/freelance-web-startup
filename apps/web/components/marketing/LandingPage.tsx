import { LandingHero } from "@/components/marketing/LandingHero";
import { LandingActivityStrip } from "@/components/marketing/LandingActivityStrip";
import { LandingProductPreview } from "@/components/marketing/LandingProductPreview";
import { LandingUseCases } from "@/components/marketing/LandingUseCases";
import { LandingCategoryChips } from "@/components/marketing/LandingCategoryChips";
import { LandingFinalCta } from "@/components/marketing/LandingFinalCta";
import { getServerTranslator } from "@/lib/i18n/server-translator";
import { PublicStatsService } from "@/server/services/public-stats.service";

export type LandingIntent = "hire" | "work";

export function resolveLandingIntent(intent: string | undefined): LandingIntent {
  return intent === "work" ? "work" : "hire";
}

export async function LandingPage({
  intent = "hire",
  homePath = "/"
}: {
  intent?: LandingIntent;
  homePath?: string;
}) {
  const { t } = await getServerTranslator();
  const pulse = await new PublicStatsService().getMarketplacePulse();
  return (
    <main className="nw-page pb-16 text-[#191c1e] selection:bg-[#3525cd]/15 selection:text-slate-950">
      <LandingHero t={t} intent={intent} homePath={homePath} pulse={pulse} />
      <LandingActivityStrip t={t} intent={intent} />
      <LandingCategoryChips t={t} />
      <LandingProductPreview t={t} />
      <LandingUseCases t={t} />
      <LandingFinalCta t={t} />
    </main>
  );
}
