/**
 * Clears DB flags after `featuredUntil` / `boostedUntil` — keeps data aligned with ranking semantics.
 * Safe to run concurrently with app servers (idempotent clears).
 */
export async function clearExpiredPromotionFlags(at = new Date()) {
  if (!process.env.DATABASE_URL?.trim()) {
    return { jobsUpdated: 0, freelancersUpdated: 0, skippedNoDatabase: true as const };
  }

  const { db } = await import("@acme/database");
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
