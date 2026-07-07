import { db, JobStatus } from "@acme/database";

function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a.map((s) => s.toLowerCase()));
  const setB = new Set(b.map((s) => s.toLowerCase()));
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function locationScore(
  fLat: number | null,
  fLng: number | null,
  jLat: number | null,
  jLng: number | null
): number {
  if (fLat == null || fLng == null || jLat == null || jLng == null) return 0.5;
  const km = haversineKm(fLat, fLng, jLat, jLng);
  if (km <= 50) return 1;
  if (km <= 100) return 0.7;
  if (km <= 500) return 0.3;
  return 0.1;
}

function addDays(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export class RecommendationService {
  async listForFreelancer(freelancerUserId: number | string, limit = 5) {
    const userId = String(freelancerUserId);
    const now = new Date();
    const rows = await db.recommendation.findMany({
      where: {
        freelancerId: userId,
        expiresAt: { gt: now }
      },
      orderBy: { score: "desc" },
      take: limit,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            budgetMin: true,
            budgetMax: true,
            currency: true,
            city: true,
            workMode: true,
            createdAt: true
          }
        }
      }
    });

    return rows.map((r) => ({
      id: r.id,
      jobId: r.jobId,
      score: r.score,
      matchReasons: r.matchReasons,
      job: r.job,
      viewedAt: r.viewedAt?.toISOString() ?? null,
      clickedAt: r.clickedAt?.toISOString() ?? null
    }));
  }

  async markClicked(recommendationId: string, userId: string) {
    await db.recommendation.updateMany({
      where: { id: recommendationId, freelancerId: userId },
      data: { clickedAt: new Date(), viewedAt: new Date() }
    });
  }

  async generateDailyBatch(): Promise<{ freelancersProcessed: number; recommendationsCreated: number }> {
    const freelancers = await db.freelancerProfile.findMany({
      where: { deletedAt: null },
      include: {
        skills: { include: { skill: { select: { slug: true, name: true } } } },
        user: { select: { id: true } }
      },
      take: 500
    });

    let recommendationsCreated = 0;
    const now = new Date();

    for (const f of freelancers) {
      const skillSlugs = f.skills.map((s) => s.skill.slug);
      const fLat = f.lat != null ? Number(f.lat) : null;
      const fLng = f.lng != null ? Number(f.lng) : null;
      const rating = f.averageReviewRating ?? 0;

      const existingBids = await db.bid.findMany({
        where: { freelancerId: f.id },
        select: { jobId: true }
      });
      const bidJobIds = new Set(existingBids.map((b) => b.jobId));

      const openJobs = await db.job.findMany({
        where: {
          status: JobStatus.OPEN,
          deletedAt: null,
          moderationHiddenAt: null,
          OR: [{ bidDeadline: null }, { bidDeadline: { gt: now } }]
        },
        include: { skills: { include: { skill: { select: { slug: true } } } } },
        take: 200
      });

      const scored = openJobs
        .filter((j) => !bidJobIds.has(j.id))
        .map((j) => {
          const jobSkillSlugs = j.skills.map((s) => s.skill.slug);
          const skillScore = jaccardSimilarity(skillSlugs, jobSkillSlugs) * 40;
          const categoryScore = 15;
          const locScore =
            locationScore(fLat, fLng, j.lat != null ? Number(j.lat) : null, j.lng != null ? Number(j.lng) : null) *
            20;
          const experienceScore = (rating / 5) * 10;
          const total = Math.round(skillScore + categoryScore + locScore + experienceScore);
          const reasons: string[] = [];
          const overlap = skillSlugs.filter((s) => jobSkillSlugs.includes(s)).length;
          if (overlap > 0) reasons.push(`${overlap} skill match`);
          if (locScore >= 0.7) reasons.push("nearby fit");
          if (rating >= 4) reasons.push("strong reviews");
          return { jobId: j.id, score: total, reasons };
        })
        .filter((s) => s.score >= 50)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      for (const item of scored) {
        const recent = await db.recommendation.findFirst({
          where: {
            freelancerId: f.userId,
            jobId: item.jobId,
            createdAt: { gt: addDays(now, -7) }
          }
        });
        if (recent) continue;

        await db.recommendation.upsert({
          where: {
            freelancerId_jobId: { freelancerId: f.userId, jobId: item.jobId }
          },
          create: {
            freelancerId: f.userId,
            jobId: item.jobId,
            score: item.score,
            matchReasons: item.reasons.length ? item.reasons : ["Good marketplace fit"],
            expiresAt: addDays(now, 30)
          },
          update: {
            score: item.score,
            matchReasons: item.reasons.length ? item.reasons : ["Good marketplace fit"],
            expiresAt: addDays(now, 30)
          }
        });
        recommendationsCreated++;
      }
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    await db.recommendationMetric.upsert({
      where: { date: today },
      create: {
        date: today,
        totalGenerated: recommendationsCreated,
        totalViewed: 0,
        totalClicked: 0,
        totalBids: 0
      },
      update: {
        totalGenerated: { increment: recommendationsCreated }
      }
    });

    return { freelancersProcessed: freelancers.length, recommendationsCreated };
  }
}
