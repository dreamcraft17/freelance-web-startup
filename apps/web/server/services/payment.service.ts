import { MONETIZATION_PRICING_PLACEHOLDER } from "@acme/config";
import type { Prisma } from "@acme/database";
import { db, PaymentIntentKind, PaymentIntentStatus } from "@acme/database";
import { NotFoundError, PolicyDeniedError } from "../errors/domain-errors";

export type CreatePendingCheckoutInput = {
  userId: string;
  kind: PaymentIntentKind;
  amountCents: number;
  currency: string;
  metadata?: Record<string, unknown>;
};

export type PendingCheckoutSession = {
  paymentIntentId: string;
  checkoutUrl: string;
  status: PaymentIntentStatus;
  provider: string;
  kind: PaymentIntentKind;
  amountCents: number;
  currency: string;
};

function checkoutBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel}`.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

function buildMockCheckoutUrl(paymentIntentId: string): string {
  const base = checkoutBaseUrl();
  const q = new URLSearchParams({ paymentIntentId });
  return `${base}/checkout/mock?${q.toString()}`;
}

function addDays(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export type SimulatedJobFeaturedPurchaseResult = {
  paymentIntentId: string;
  checkoutUrl: string;
  jobId: string;
  featuredUntil: string;
  amountCents: number;
  currency: string;
};

export type SimulatedFreelancerBoostPurchaseResult = {
  paymentIntentId: string;
  checkoutUrl: string;
  freelancerProfileId: string;
  boostedUntil: string;
  amountCents: number;
  currency: string;
};

/**
 * PSP-agnostic checkout: persists a **PENDING** payment intent and returns a mock redirect URL.
 * Swap `createPendingCheckoutSession` for hosted PSP session creation when integrating a provider.
 */
export class PaymentService {
  async createPendingCheckoutSession(input: CreatePendingCheckoutInput): Promise<PendingCheckoutSession> {
    const meta =
      input.metadata === undefined ? undefined : (input.metadata as Prisma.InputJsonValue);

    const row = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.paymentIntent.create({
        data: {
          userId: input.userId,
          kind: input.kind,
          status: PaymentIntentStatus.PENDING,
          provider: "MOCK",
          currency: input.currency.slice(0, 3).toUpperCase(),
          amountCents: Math.max(0, Math.floor(input.amountCents)),
          checkoutUrl: `${checkoutBaseUrl()}/checkout/mock`,
          metadata: meta
        },
        select: { id: true }
      });
      const checkoutUrl = buildMockCheckoutUrl(created.id);
      return tx.paymentIntent.update({
        where: { id: created.id },
        data: { checkoutUrl },
        select: {
          id: true,
          checkoutUrl: true,
          status: true,
          provider: true,
          kind: true,
          amountCents: true,
          currency: true
        }
      });
    });

    return {
      paymentIntentId: row.id,
      checkoutUrl: row.checkoutUrl,
      status: row.status,
      provider: row.provider,
      kind: row.kind,
      amountCents: row.amountCents,
      currency: row.currency
    };
  }

  /** Future: charge for featuring a job (metadata carries jobId + duration). */
  async createJobFeaturedCheckoutIntent(input: {
    userId: string;
    jobId: string;
    durationDays?: number;
  }): Promise<PendingCheckoutSession> {
    return this.createPendingCheckoutSession({
      userId: input.userId,
      kind: PaymentIntentKind.JOB_FEATURED,
      amountCents: MONETIZATION_PRICING_PLACEHOLDER.jobFeaturedUsdCents,
      currency: "USD",
      metadata: {
        jobId: input.jobId,
        durationDays: input.durationDays ?? MONETIZATION_PRICING_PLACEHOLDER.jobFeaturedDefaultDays
      }
    });
  }

  /** Future: charge for freelancer profile boost (metadata carries profile id + duration). */
  async createFreelancerBoostCheckoutIntent(input: {
    userId: string;
    freelancerProfileId: string;
    durationDays?: number;
  }): Promise<PendingCheckoutSession> {
    return this.createPendingCheckoutSession({
      userId: input.userId,
      kind: PaymentIntentKind.FREELANCER_BOOST,
      amountCents: MONETIZATION_PRICING_PLACEHOLDER.freelancerBoostUsdCents,
      currency: "USD",
      metadata: {
        freelancerProfileId: input.freelancerProfileId,
        durationDays: input.durationDays ?? MONETIZATION_PRICING_PLACEHOLDER.freelancerBoostDefaultDays
      }
    });
  }

  /**
   * Simulated successful payment: records **SUCCEEDED** intent and sets job featured window (no PSP).
   * `payerUserId` must own the job via `clientProfile.userId`.
   */
  async simulateSuccessfulJobFeaturedPurchase(input: {
    payerUserId: string;
    jobId: string;
    durationDays?: number;
  }): Promise<SimulatedJobFeaturedPurchaseResult> {
    const days = input.durationDays ?? MONETIZATION_PRICING_PLACEHOLDER.jobFeaturedDefaultDays;
    const amountCents = MONETIZATION_PRICING_PLACEHOLDER.jobFeaturedUsdCents;
    const currency = "USD";

    return db.$transaction(async (tx: Prisma.TransactionClient) => {
      const job = await tx.job.findFirst({
        where: { id: input.jobId, deletedAt: null },
        select: {
          id: true,
          isFeatured: true,
          featuredUntil: true,
          clientProfile: { select: { userId: true } }
        }
      });
      if (!job) {
        throw new NotFoundError("Job not found");
      }
      if (job.clientProfile.userId !== input.payerUserId) {
        throw new PolicyDeniedError("Only the job owner can purchase featured placement for this job");
      }

      const now = new Date();
      const base =
        job.featuredUntil != null && job.featuredUntil > now ? job.featuredUntil : now;
      const featuredUntil = addDays(base, days);

      const meta = {
        jobId: job.id,
        durationDays: days,
        simulated: true
      } satisfies Record<string, unknown>;

      const created = await tx.paymentIntent.create({
        data: {
          userId: input.payerUserId,
          kind: PaymentIntentKind.JOB_FEATURED,
          status: PaymentIntentStatus.SUCCEEDED,
          provider: "MOCK_SIMULATED",
          currency,
          amountCents,
          checkoutUrl: `${checkoutBaseUrl()}/checkout/mock`,
          metadata: meta as Prisma.InputJsonValue
        },
        select: { id: true }
      });
      const checkoutUrl = buildMockCheckoutUrl(created.id);
      await tx.paymentIntent.update({
        where: { id: created.id },
        data: { checkoutUrl }
      });

      await tx.job.update({
        where: { id: job.id },
        data: { isFeatured: true, featuredUntil }
      });

      return {
        paymentIntentId: created.id,
        checkoutUrl,
        jobId: job.id,
        featuredUntil: featuredUntil.toISOString(),
        amountCents,
        currency
      };
    });
  }

  /**
   * Simulated successful payment: records **SUCCEEDED** intent and sets profile boost window (no PSP).
   * `payerUserId` must match `freelancerProfile.userId`.
   */
  async simulateSuccessfulFreelancerBoostPurchase(input: {
    payerUserId: string;
    freelancerProfileId: string;
    durationDays?: number;
  }): Promise<SimulatedFreelancerBoostPurchaseResult> {
    const days = input.durationDays ?? MONETIZATION_PRICING_PLACEHOLDER.freelancerBoostDefaultDays;
    const amountCents = MONETIZATION_PRICING_PLACEHOLDER.freelancerBoostUsdCents;
    const currency = "USD";

    return db.$transaction(async (tx: Prisma.TransactionClient) => {
      const profile = await tx.freelancerProfile.findFirst({
        where: { id: input.freelancerProfileId, deletedAt: null },
        select: {
          id: true,
          userId: true,
          isBoosted: true,
          boostedUntil: true
        }
      });
      if (!profile) {
        throw new NotFoundError("Freelancer profile not found");
      }
      if (profile.userId !== input.payerUserId) {
        throw new PolicyDeniedError("You can only purchase a boost for your own freelancer profile");
      }

      const now = new Date();
      const base =
        profile.boostedUntil != null && profile.boostedUntil > now ? profile.boostedUntil : now;
      const boostedUntil = addDays(base, days);

      const meta = {
        freelancerProfileId: profile.id,
        durationDays: days,
        simulated: true
      } satisfies Record<string, unknown>;

      const created = await tx.paymentIntent.create({
        data: {
          userId: input.payerUserId,
          kind: PaymentIntentKind.FREELANCER_BOOST,
          status: PaymentIntentStatus.SUCCEEDED,
          provider: "MOCK_SIMULATED",
          currency,
          amountCents,
          checkoutUrl: `${checkoutBaseUrl()}/checkout/mock`,
          metadata: meta as Prisma.InputJsonValue
        },
        select: { id: true }
      });
      const checkoutUrl = buildMockCheckoutUrl(created.id);
      await tx.paymentIntent.update({
        where: { id: created.id },
        data: { checkoutUrl }
      });

      await tx.freelancerProfile.update({
        where: { id: profile.id },
        data: { isBoosted: true, boostedUntil }
      });

      return {
        paymentIntentId: created.id,
        checkoutUrl,
        freelancerProfileId: profile.id,
        boostedUntil: boostedUntil.toISOString(),
        amountCents,
        currency
      };
    });
  }
}
