import { clearExpiredPromotionFlags } from "./promotionSweep";

const DEFAULT_SWEEP_MS = 6 * 60 * 60 * 1000;
const sweepIntervalMs = Number(process.env.PROMOTION_SWEEP_INTERVAL_MS);
const intervalMs =
  Number.isFinite(sweepIntervalMs) && sweepIntervalMs > 0 ? sweepIntervalMs : DEFAULT_SWEEP_MS;

async function runWorker() {
  const sweep = async () => {
    try {
      const result = await clearExpiredPromotionFlags();
      console.log("[promotionSweep]", new Date().toISOString(), result);
    } catch (error) {
      console.error("[promotionSweep] failed", error);
    }
  };

  await sweep();
  setInterval(sweep, intervalMs);

  console.log(`Worker started; promotion expiry sweep every ${intervalMs}ms (set PROMOTION_SWEEP_INTERVAL_MS to override)`);
}

runWorker().catch((error) => {
  console.error("Worker failed", error);
  process.exit(1);
});
