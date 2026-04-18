export type MarketplacePulseStats = {
  bidsLast24h: number;
  freelancersAvailable: number;
  openPublicJobs: number;
};

/**
 * One muted line of real aggregate stats — trust + “live board” without banners.
 */
export function MarketplacePulse({ pulse }: { pulse: MarketplacePulseStats }) {
  const parts: string[] = [];
  if (pulse.openPublicJobs > 0) {
    parts.push(
      pulse.openPublicJobs === 1 ? "1 open role on the board" : `${pulse.openPublicJobs} open roles on the board`
    );
  }
  if (pulse.bidsLast24h > 0) {
    parts.push(
      pulse.bidsLast24h === 1
        ? "1 new proposal in the last 24h"
        : `${pulse.bidsLast24h} new proposals in the last 24h`
    );
  }
  if (pulse.freelancersAvailable > 0) {
    parts.push(
      pulse.freelancersAvailable === 1
        ? "1 freelancer marked available"
        : `${pulse.freelancersAvailable} freelancers marked available`
    );
  }
  if (parts.length === 0) return null;
  return <p className="text-xs font-medium leading-snug text-slate-500">{parts.join(" · ")}</p>;
}
