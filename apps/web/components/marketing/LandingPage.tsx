import { LandingHero } from "@/components/marketing/LandingHero";
import { LandingProductPreview } from "@/components/marketing/LandingProductPreview";
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
  const statsService = new PublicStatsService();
  const [pulse, panelActivity] = await Promise.all([
    statsService.getMarketplacePulse(),
    statsService.getHeroPanelActivity()
  ]);
  return (
    <main className="nw-page pb-16 text-[#071027] selection:bg-[#4f35e8]/15 selection:text-[#071027]">
      <LandingHero t={t} intent={intent} homePath={homePath} pulse={pulse} panelActivity={panelActivity} />
      <LandingCategoryChips t={t} />
      <LandingProductPreview t={t} />
      <LandingFinalCta t={t} />
    </main>
  );
}
