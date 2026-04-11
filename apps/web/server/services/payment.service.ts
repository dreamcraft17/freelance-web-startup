import { MONETIZATION_PRICING_PLACEHOLDER } from "@acme/config";
import type { Prisma } from "@acme/database";
import { db, PaymentIntentKind, PaymentIntentStatus } from "@acme/database";

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

/**
 * PSP-agnostic checkout: persists a **PENDING** payment intent and returns a mock redirect URL.
 * Swap `createPendingCheckoutSession` for hosted PSP session creation when integrating a provider.
 */
export class PaymentService {
  async createPendingCheckoutSession(input: CreatePendingCheckoutInput): Promise<PendingCheckoutSession> {
    const meta =
      input.metadata === undefined ? undefined : (input.metadata as Prisma.InputJsonValue);

    const row = await db.$transaction(async (tx) => {
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
}
