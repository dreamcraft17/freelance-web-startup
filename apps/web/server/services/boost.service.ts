import { BOOST_PRODUCT_DEFS } from "@acme/config";
import type { Prisma } from "@acme/database";
import { BoostStatus, BoostTargetType, JobStatus, db } from "@acme/database";
import { NotFoundError, PolicyDeniedError } from "../errors/domain-errors";

function addDays(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export class BoostService {
  async ensureCatalogSeeded(): Promise<void> {
    for (const def of BOOST_PRODUCT_DEFS) {
      await db.boostProduct.upsert({
        where: { code: def.code },
        create: {
          code: def.code,
          name: def.name,
          type: def.type,
          durationDays: def.durationDays,
          priceCents: def.priceCents,
          currency: def.currency,
          isActive: true
        },
        update: {
          name: def.name,
          priceCents: def.priceCents,
          durationDays: def.durationDays,
          isActive: true
        }
      });
    }
  }

  async listProducts() {
    await this.ensureCatalogSeeded();
    return db.boostProduct.findMany({
      where: { isActive: true },
      orderBy: { priceCents: "asc" }
    });
  }

  async activateBoost(input: {
    userId: string;
    productCode: string;
    targetType: BoostTargetType;
    targetId: string;
    paymentTxnId?: string;
  }) {
    await this.ensureCatalogSeeded();
    const product = await db.boostProduct.findFirst({
      where: { code: input.productCode, isActive: true }
    });
    if (!product) throw new NotFoundError("Boost product not found");

    if (input.targetType === BoostTargetType.JOB) {
      const job = await db.job.findFirst({
        where: { id: input.targetId, deletedAt: null },
        include: { clientProfile: { select: { userId: true } } }
      });
      if (!job) throw new NotFoundError("Job not found");
      if (job.clientProfile.userId !== input.userId) {
        throw new PolicyDeniedError("Only the job owner can boost this job");
      }
    } else {
      const profile = await db.freelancerProfile.findFirst({
        where: { id: input.targetId, deletedAt: null }
      });
      if (!profile || profile.userId !== input.userId) {
        throw new PolicyDeniedError("You can only boost your own profile");
      }
    }

    const expiresAt = addDays(new Date(), product.durationDays);

    const boost = await db.boost.create({
      data: {
        userId: input.userId,
        productId: product.id,
        targetType: input.targetType,
        targetId: input.targetId,
        status: BoostStatus.ACTIVE,
        expiresAt,
        paymentTxnId: input.paymentTxnId
      }
    });

    if (input.targetType === BoostTargetType.JOB) {
      await db.job.update({
        where: { id: input.targetId },
        data: { isFeatured: true, featuredUntil: expiresAt }
      });
    } else {
      await db.freelancerProfile.update({
        where: { id: input.targetId },
        data: { isBoosted: true, boostedUntil: expiresAt, isFeatured: product.type === "TOP_FREELANCER_BADGE" }
      });
    }

    return boost;
  }

  async expireStaleBoosts(): Promise<{ jobs: number; profiles: number; boosts: number }> {
    const now = new Date();
    const expired = await db.boost.findMany({
      where: { status: BoostStatus.ACTIVE, expiresAt: { lte: now } },
      take: 200
    });

    let jobs = 0;
    let profiles = 0;

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
          jobs++;
        }
      } else {
        const stillActive = await db.boost.count({
          where: {
            targetType: BoostTargetType.PROFILE,
            targetId: b.targetId,
            status: BoostStatus.ACTIVE,
            expiresAt: { gt: now }
          }
        });
        if (stillActive === 0) {
          await db.freelancerProfile.update({
            where: { id: b.targetId },
            data: { isBoosted: false, boostedUntil: null }
          });
          profiles++;
        }
      }
    }

    return { jobs, profiles, boosts: expired.length };
  }

  async getActiveBoostsForJob(jobId: string) {
    return db.boost.findFirst({
      where: {
        targetType: BoostTargetType.JOB,
        targetId: jobId,
        status: BoostStatus.ACTIVE,
        expiresAt: { gt: new Date() }
      },
      include: { product: true }
    });
  }
}
