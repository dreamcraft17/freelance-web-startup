import "./load-env";
import { clearExpiredPromotionFlags } from "./promotionSweep";
import { escalateOverdueModerationReports } from "./moderationEscalationSweep";
import {
  processBatchPayouts,
  processBoostExpiry,
  processDailyRecommendations,
  processEscrowAutoReleases
} from "./v2Jobs";

const DEFAULT_SWEEP_MS = 6 * 60 * 60 * 1000;
const sweepIntervalMs = Number(process.env.PROMOTION_SWEEP_INTERVAL_MS);
const intervalMs =
  Number.isFinite(sweepIntervalMs) && sweepIntervalMs > 0 ? sweepIntervalMs : DEFAULT_SWEEP_MS;
const DEFAULT_MODERATION_SWEEP_MS = 5 * 60 * 1000;
const configuredModerationSweepMs = Number(process.env.MODERATION_ESCALATION_SWEEP_INTERVAL_MS);
const moderationSweepMs =
  Number.isFinite(configuredModerationSweepMs) && configuredModerationSweepMs > 0
    ? configuredModerationSweepMs
    : DEFAULT_MODERATION_SWEEP_MS;

async function runWorker() {
  const first = await clearExpiredPromotionFlags();
  if ("skippedNoDatabase" in first && first.skippedNoDatabase) {
    console.warn(
      "[worker] DATABASE_URL not set (after loading repo-root `.env` / `.env.local`). Promotion sweep disabled."
    );
    console.warn("[worker] Tip: run only the web app with `pnpm --filter @acme/web dev`, or set DATABASE_URL at the monorepo root.");
    setInterval(() => {}, 24 * 60 * 60 * 1000);
    return;
  }

  const firstModeration = await escalateOverdueModerationReports();

  const v2Sweep = async () => {
    try {
      const [escrow, boosts, recommendations] = await Promise.all([
        processEscrowAutoReleases(),
        processBoostExpiry(),
        processDailyRecommendations()
      ]);
      console.log("[v2Sweep]", new Date().toISOString(), { escrow, boosts, recommendations });
    } catch (error) {
      console.error("[v2Sweep] failed", error);
    }
  };

  const payoutSweep = async () => {
    try {
      const result = await processBatchPayouts();
      console.log("[payoutSweep]", new Date().toISOString(), result);
    } catch (error) {
      console.error("[payoutSweep] failed", error);
    }
  };

  await v2Sweep();

  const sweep = async () => {
    try {
      const result = await clearExpiredPromotionFlags();
      if ("skippedNoDatabase" in result && result.skippedNoDatabase) {
        return;
      }
      console.log("[promotionSweep]", new Date().toISOString(), result);
    } catch (error) {
      console.error("[promotionSweep] failed", error);
    }
  };

  const moderationSweep = async () => {
    try {
      const result = await escalateOverdueModerationReports();
      if (!("skippedNoDatabase" in result)) {
        console.log("[moderationEscalationSweep]", new Date().toISOString(), result);
      }
    } catch (error) {
      console.error("[moderationEscalationSweep] failed", error);
    }
  };

  console.log("[promotionSweep]", new Date().toISOString(), first);
  console.log("[moderationEscalationSweep]", new Date().toISOString(), firstModeration);
  setInterval(sweep, intervalMs);
  setInterval(moderationSweep, moderationSweepMs);
  setInterval(v2Sweep, intervalMs);
  setInterval(payoutSweep, 24 * 60 * 60 * 1000);
  console.log(`Worker started; promotion expiry sweep every ${intervalMs}ms (set PROMOTION_SWEEP_INTERVAL_MS to override)`);
  console.log(`Moderation escalation sweep every ${moderationSweepMs}ms (set MODERATION_ESCALATION_SWEEP_INTERVAL_MS to override)`);
}

runWorker().catch((error) => {
  console.error("Worker failed", error);
  process.exit(1);
});
