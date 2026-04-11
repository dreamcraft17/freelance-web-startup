import { db } from "@acme/database";

/**
 * Clears DB flags after `featuredUntil` / `boostedUntil` — keeps data aligned with ranking semantics.
 * Safe to run concurrently with app servers (idempotent clears).
 */
export async function clearExpiredPromotionFlags(at = new Date()) {
  const [jobs, freelancers] = await Promise.all([
    db.job.updateMany({
      where: {
        deletedAt: null,
        isFeatured: true,
        featuredUntil: { not: null, lt: at }
      },
      data: { isFeatured: false, featuredUntil: null }
    }),
    db.freelancerProfile.updateMany({
      where: {
        deletedAt: null,
        isBoosted: true,
        boostedUntil: { not: null, lt: at }
      },
      data: { isBoosted: false, boostedUntil: null }
    })
  ]);

  return { jobsUpdated: jobs.count, freelancersUpdated: freelancers.count };
}
