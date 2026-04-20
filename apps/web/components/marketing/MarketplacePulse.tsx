import type { Translator } from "@/lib/i18n/create-translator";

export type MarketplacePulseStats = {
  bidsLast24h: number;
  freelancersAvailable: number;
  openPublicJobs: number;
};

/**
 * One muted line of real aggregate stats — trust + “live board” without banners.
 */
export function MarketplacePulse({ pulse, t }: { pulse: MarketplacePulseStats; t: Translator }) {
  const parts: string[] = [];
  if (pulse.openPublicJobs > 0) {
    parts.push(
      pulse.openPublicJobs === 1 ? t("pulse.openRoleOne") : t("pulse.openRoles", { count: pulse.openPublicJobs })
    );
  }
  if (pulse.bidsLast24h > 0) {
    parts.push(pulse.bidsLast24h === 1 ? t("pulse.proposalOne") : t("pulse.proposals", { count: pulse.bidsLast24h }));
  }
  if (pulse.freelancersAvailable > 0) {
    parts.push(
      pulse.freelancersAvailable === 1
        ? t("pulse.freelancerOne")
        : t("pulse.freelancers", { count: pulse.freelancersAvailable })
    );
  }
  if (parts.length === 0) return null;
  return <p className="text-xs font-medium leading-snug text-slate-500">{parts.join(" · ")}</p>;
}
