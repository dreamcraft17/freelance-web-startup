import {
  expireStaleBoosts,
  processBatchPayouts,
  processEscrowAutoReleases,
  db
} from "@acme/database";
import { JobStatus } from "@acme/database";

function addDays(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** Delegates to @acme/database money-jobs (canonical escrow + holdback). */
export async function processEscrowAutoReleasesJob() {
  return processEscrowAutoReleases();
}

/** Delegates to @acme/database money-jobs (jobs + profile boosts). */
export async function processBoostExpiry() {
  return expireStaleBoosts();
}

export async function processDailyRecommendations() {
  const freelancers = await db.freelancerProfile.findMany({
    where: { deletedAt: null },
    include: { skills: { include: { skill: { select: { slug: true } } } } },
    take: 200
  });

  let created = 0;
  const now = new Date();

  for (const f of freelancers) {
    const skillSlugs = f.skills.map((s) => s.skill.slug);
    const bids = await db.bid.findMany({ where: { freelancerId: f.id }, select: { jobId: true } });
    const bidJobIds = new Set(bids.map((b) => b.jobId));

    const jobs = await db.job.findMany({
      where: { status: JobStatus.OPEN, deletedAt: null, moderationHiddenAt: null },
      include: { skills: { include: { skill: { select: { slug: true } } } } },
      take: 50
    });

    for (const j of jobs) {
      if (bidJobIds.has(j.id)) continue;
      const jobSlugs = j.skills.map((s) => s.skill.slug);
      const overlap = skillSlugs.filter((s) => jobSlugs.includes(s)).length;
      const score = Math.min(100, 40 + overlap * 15 + (f.averageReviewRating ?? 0) * 10);
      if (score < 50) continue;

      await db.recommendation.upsert({
        where: { freelancerId_jobId: { freelancerId: f.userId, jobId: j.id } },
        create: {
          freelancerId: f.userId,
          jobId: j.id,
          score,
          matchReasons: overlap > 0 ? [`${overlap} skill match`] : ["Marketplace fit"],
          expiresAt: addDays(now, 30)
        },
        update: { score, expiresAt: addDays(now, 30) }
      });
      created++;
    }
  }

  return { freelancersProcessed: freelancers.length, recommendationsCreated: created };
}

/** Only sends admin-approved (PROCESSING) payouts — never auto-SENT from PENDING. */
export async function processBatchPayoutsJob() {
  return processBatchPayouts();
}

// Re-export canonical names expected by main.ts
export { processEscrowAutoReleasesJob as processEscrowAutoReleases, processBatchPayoutsJob as processBatchPayouts };
