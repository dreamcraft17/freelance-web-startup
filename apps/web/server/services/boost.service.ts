import { BOOST_PRODUCT_DEFS } from "@acme/config";
import {
  BoostStatus,
  BoostTargetType,
  PaymentIntentKind,
  PaymentIntentStatus,
  expireStaleBoosts as runExpireStaleBoosts,
  db
} from "@acme/database";
import { DomainError, NotFoundError, PolicyDeniedError } from "../errors/domain-errors";
import { PaymentService } from "./payment.service";
import { assertBoostRouteEnabled } from "@/server/lib/monetization-guard";

function addDays(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function allowMockPayments(): boolean {
  return process.env.NODE_ENV !== "production";
}

export class BoostService {
  constructor(private readonly payments = new PaymentService()) {}

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

  async purchaseBoost(input: {
    userId: string;
    productCode: string;
    targetType: BoostTargetType;
    targetId: string;
    paymentMethod: "stripe" | "midtrans" | "mock";
  }) {
    assertBoostRouteEnabled(input.targetType);
    await this.ensureCatalogSeeded();
    const product = await db.boostProduct.findFirst({
      where: { code: input.productCode, isActive: true }
    });
    if (!product) throw new NotFoundError("Boost product not found");

    await this.assertMayBoostTarget(input.userId, input.targetType, input.targetId);

    if (input.paymentMethod === "mock") {
      if (!allowMockPayments()) {
        throw new DomainError("Mock payment is not allowed in production", "MOCK_PAYMENT_FORBIDDEN", 403);
      }
      return {
        paymentRequired: false,
        boost: await this.activateBoost({
          userId: input.userId,
          productCode: input.productCode,
          targetType: input.targetType,
          targetId: input.targetId,
          paymentTxnId: `mock_${Date.now()}`,
          requirePaidProof: true
        })
      };
    }

    const session = await this.payments.createPendingCheckoutSession({
      userId: input.userId,
      kind: PaymentIntentKind.BOOST_PURCHASE,
      amountCents: product.priceCents,
      currency: product.currency,
      metadata: {
        productCode: product.code,
        targetType: input.targetType,
        targetId: input.targetId,
        paymentMethod: input.paymentMethod
      }
    });

    return {
      paymentRequired: true,
      checkoutUrl: session.checkoutUrl,
      paymentIntentId: session.paymentIntentId
    };
  }

  private async assertMayBoostTarget(userId: string, targetType: BoostTargetType, targetId: string) {
    if (targetType === BoostTargetType.JOB) {
      const job = await db.job.findFirst({
        where: { id: targetId, deletedAt: null },
        include: { clientProfile: { select: { userId: true } } }
      });
      if (!job) throw new NotFoundError("Job not found");
      if (job.clientProfile.userId !== userId) {
        throw new PolicyDeniedError("Only the job owner can boost this job");
      }
    } else {
      const profile = await db.freelancerProfile.findFirst({
        where: { id: targetId, deletedAt: null }
      });
      if (!profile || profile.userId !== userId) {
        throw new PolicyDeniedError("You can only boost your own profile");
      }
    }
  }

  async activateBoost(input: {
    userId: string;
    productCode: string;
    targetType: BoostTargetType;
    targetId: string;
    paymentTxnId?: string;
    requirePaidProof?: boolean;
  }) {
    await this.ensureCatalogSeeded();
    const product = await db.boostProduct.findFirst({
      where: { code: input.productCode, isActive: true }
    });
    if (!product) throw new NotFoundError("Boost product not found");

    await this.assertMayBoostTarget(input.userId, input.targetType, input.targetId);

    const requirePaid = input.requirePaidProof !== false;
    if (requirePaid) {
      const txnId = input.paymentTxnId?.trim();
      if (!txnId) {
        throw new DomainError("Paid boost requires a successful payment", "BOOST_PAYMENT_REQUIRED", 402);
      }
      if (!txnId.startsWith("mock_")) {
        const intent = await db.paymentIntent.findFirst({
          where: {
            id: txnId,
            userId: input.userId,
            status: PaymentIntentStatus.SUCCEEDED
          }
        });
        if (!intent) {
          throw new DomainError("Boost payment not confirmed", "BOOST_PAYMENT_NOT_CONFIRMED", 402);
        }
      } else if (!allowMockPayments()) {
        throw new DomainError("Mock payment is not allowed in production", "MOCK_PAYMENT_FORBIDDEN", 403);
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
        data: {
          isBoosted: true,
          boostedUntil: expiresAt,
          isFeatured: product.type === "TOP_FREELANCER_BADGE"
        }
      });
    }

    return boost;
  }

  async expireStaleBoosts(): Promise<{ jobs: number; profiles: number; boosts: number }> {
    return runExpireStaleBoosts();
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
