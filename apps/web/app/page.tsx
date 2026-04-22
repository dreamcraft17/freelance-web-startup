import { LandingPage } from "@/components/marketing/LandingPage";
import { resolveLandingIntent } from "@/components/marketing/LandingPage";
import { MarketingShell } from "@/components/marketing/MarketingShell";

/** Public home — no redirect. Middleware treats "/" as public (browse-first). */
export default async function HomePage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearch = searchParams ? await searchParams : undefined;
  const intentValue = resolvedSearch?.intent;
  const intent = resolveLandingIntent(Array.isArray(intentValue) ? intentValue[0] : intentValue);

  return (
    <MarketingShell>
      <LandingPage intent={intent} homePath="/" />
    </MarketingShell>
  );
}
