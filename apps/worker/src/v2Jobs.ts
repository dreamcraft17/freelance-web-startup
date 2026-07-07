import {
  BoostStatus,
  BoostTargetType,
  ContractStatus,
  EscrowStatus,
  EscrowTransactionType,
  JobStatus,
  PayoutRequestStatus,
  db
} from "@acme/database";

function addDays(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export async function processEscrowAutoReleases() {
  const now = new Date();
  let processed = 0;

  const staleReview = await db.contract.findMany({
    where: {
      status: ContractStatus.IN_REVIEW,
      workReviewDeadline: { lte: now },
      escrowStatus: EscrowStatus.LOCKED,
      deletedAt: null
    },
    take: 50
  });

  for (const c of staleReview) {
    const amount = c.escrowAmountCents ?? 0;
    const releaseAmount = Math.round(amount * 0.8);
    await db.$transaction(async (tx) => {
      await tx.contract.update({
        where: { id: c.id },
        data: { status: ContractStatus.COMPLETED, escrowStatus: EscrowStatus.PARTIAL_RELEASED }
      });
      await tx.escrowTransaction.create({
        data: {
          contractId: c.id,
          type: EscrowTransactionType.PARTIAL_RELEASE,
          amount: releaseAmount,
          reason: "Auto-release after review window",
          createdBy: "system"
        }
      });
      await tx.freelancerWallet.upsert({
        where: { userId: c.freelancerUserId },
        create: { userId: c.freelancerUserId, balanceCents: releaseAmount, currency: c.currency ?? "IDR" },
        update: { balanceCents: { increment: releaseAmount } }
      });
    });
    processed++;
  }

  return { processed };
}

export async function processBoostExpiry() {
  const now = new Date();
  const expired = await db.boost.findMany({
    where: { status: BoostStatus.ACTIVE, expiresAt: { lte: now } },
    take: 200
  });

  for (const b of expired) {
    await db.boost.update({
      where: { id: b.id },
      data: { status: BoostStatus.EXPIRED, expiredAt: now }
    });
    if (b.targetType === BoostTargetType.JOB) {
      const stillActive = await db.boost.count({
        where: {
          targetType: BoostTargetType.JOB,
          targetId: b.targetId,
          status: BoostStatus.ACTIVE,
          expiresAt: { gt: now }
        }
      });
      if (stillActive === 0) {
        await db.job.update({
          where: { id: b.targetId },
          data: { isFeatured: false, featuredUntil: null }
        });
      }
    }
  }

  return { boosts: expired.length };
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

export async function processBatchPayouts() {
  const pending = await db.payoutRequest.findMany({
    where: { status: PayoutRequestStatus.PENDING },
    take: 100
  });

  let processed = 0;
  for (const p of pending) {
    await db.payoutRequest.update({
      where: { id: p.id },
      data: {
        status: PayoutRequestStatus.SENT,
        sentAt: new Date(),
        processedAt: new Date(),
        receiptId: `MOCK-${p.id.slice(0, 8)}`
      }
    });
    processed++;
  }

  return { processed, failed: 0 };
}
