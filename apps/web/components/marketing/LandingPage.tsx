import { LandingHero } from "@/components/marketing/LandingHero";

export type LandingIntent = "hire" | "work" | "neutral";

export function resolveLandingIntent(intent: string | undefined): LandingIntent {
  if (intent === "hire") return "hire";
  if (intent === "work") return "work";
  return "neutral";
}

export async function LandingPage({
  intent = "neutral",
  homePath = "/"
}: {
  intent?: LandingIntent;
  homePath?: string;
}) {
  return (
    <main className="nw-page pb-16 text-[#071027] selection:bg-[#4f35e8]/15 selection:text-[#071027]">
      <LandingHero intent={intent} homePath={homePath} />
    </main>
  );
}
