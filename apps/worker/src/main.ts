import "./load-env";
import { clearExpiredPromotionFlags } from "./promotionSweep";

const DEFAULT_SWEEP_MS = 6 * 60 * 60 * 1000;
const sweepIntervalMs = Number(process.env.PROMOTION_SWEEP_INTERVAL_MS);
const intervalMs =
  Number.isFinite(sweepIntervalMs) && sweepIntervalMs > 0 ? sweepIntervalMs : DEFAULT_SWEEP_MS;

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

  console.log("[promotionSweep]", new Date().toISOString(), first);
  setInterval(sweep, intervalMs);
  console.log(`Worker started; promotion expiry sweep every ${intervalMs}ms (set PROMOTION_SWEEP_INTERVAL_MS to override)`);
}

runWorker().catch((error) => {
  console.error("Worker failed", error);
  process.exit(1);
});
