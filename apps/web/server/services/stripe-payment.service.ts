import { createHash, timingSafeEqual } from "node:crypto";
import { V2_PRICING, isStripeConfigured } from "@acme/config";
import type { Prisma } from "@acme/database";
import {
  ContractPaymentStatus,
  ContractStatus,
  EscrowStatus,
  EscrowTransactionType,
  PaymentIntentKind,
  PaymentIntentStatus,
  PaymentTransactionStatus,
  PaymentTransactionType,
  db
} from "@acme/database";
import { DomainError, NotFoundError, PolicyDeniedError } from "../errors/domain-errors";

const ESCROW_FEE_RATE = V2_PRICING.escrowFeeRate;

function addDays(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function contractAmountCents(amount: { toString(): string } | null | undefined, currency: string | null): number {
  if (amount == null) return 0;
  const n = Number(amount);
  if (!Number.isFinite(n)) return 0;
  const cur = (currency ?? "IDR").toUpperCase();
  if (cur === "IDR") return Math.round(n);
  return Math.round(n * 100);
}

async function recordWebhookOnce(provider: string, externalId: string, eventType: string): Promise<boolean> {
  try {
    await db.webhookEvent.create({
      data: { provider, externalId, eventType }
    });
    return true;
  } catch {
    return false;
  }
}

export type StripeIntentResult = {
  client_secret: string | null;
  payment_intent_id: string;
  status: string;
  amount: number;
  currency: string;
  checkoutUrl?: string;
};

/**
 * Stripe + contract escrow payment intents. Falls back to mock checkout when STRIPE_SECRET_KEY is unset.
 */
export class StripePaymentService {
  private getStripeSecret(): string | null {
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    return key || null;
  }

  async createContractPaymentIntent(input: {
    userId: string;
    contractId: string;
    idempotencyKey?: string;
  }): Promise<StripeIntentResult> {
    const contract = await db.contract.findFirst({
      where: { id: input.contractId, deletedAt: null },
      include: {
        bid: { include: { job: { select: { id: true, title: true } } } }
      }
    });
    if (!contract) throw new NotFoundError("Contract not found");
    if (contract.clientUserId !== input.userId) {
      throw new PolicyDeniedError("Only the client can pay for this contract");
    }
    if (contract.paymentStatus === ContractPaymentStatus.CONFIRMED) {
      throw new DomainError("Contract already paid", "CONTRACT_ALREADY_PAID", 400);
    }

    const baseCents = contractAmountCents(contract.amount, contract.currency);
    const feeCents = Math.round(baseCents * ESCROW_FEE_RATE);
    const totalCents = baseCents + feeCents;
    const currency = (contract.currency ?? "IDR").toLowerCase();

    const existing = await db.paymentIntent.findFirst({
      where: {
        contractId: contract.id,
        status: PaymentIntentStatus.PENDING
      }
    });
    if (existing?.stripeIntentId && isStripeConfigured()) {
      return {
        client_secret: null,
        payment_intent_id: existing.stripeIntentId,
        status: "requires_payment_method",
        amount: existing.amountCents,
        currency: existing.currency.toLowerCase(),
        checkoutUrl: existing.checkoutUrl
      };
    }

    const stripeKey = this.getStripeSecret();
    let stripeIntentId: string | null = null;
    let clientSecret: string | null = null;
    let provider = "MOCK";
    let checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/checkout/mock?contractId=${contract.id}`;

    if (stripeKey) {
      const params = new URLSearchParams();
      params.set("amount", String(totalCents));
      params.set("currency", currency);
      params.set("metadata[contractId]", contract.id);
      params.set("metadata[clientId]", contract.clientUserId);
      params.set("metadata[freelancerId]", contract.freelancerUserId);
      params.set("metadata[jobId]", contract.bid.jobId);
      params.set("automatic_payment_methods[enabled]", "true");

      const res = await fetch("https://api.stripe.com/v1/payment_intents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : {})
        },
        body: params.toString()
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new DomainError(`Stripe error: ${errText.slice(0, 200)}`, "STRIPE_ERROR", 502);
      }
      const body = (await res.json()) as { id: string; client_secret: string; status: string };
      stripeIntentId = body.id;
      clientSecret = body.client_secret;
      provider = "STRIPE";
      checkoutUrl = "";
    }

    const meta = {
      contractId: contract.id,
      baseCents,
      feeCents,
      jobId: contract.bid.jobId
    } satisfies Record<string, unknown>;

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.paymentIntent.upsert({
        where: { contractId: contract.id },
        create: {
          userId: input.userId,
          contractId: contract.id,
          kind: PaymentIntentKind.CONTRACT_ESCROW,
          status: PaymentIntentStatus.PENDING,
          provider,
          currency: currency.toUpperCase(),
          amountCents: totalCents,
          stripeIntentId,
          checkoutUrl,
          idempotencyKey: input.idempotencyKey,
          metadata: meta as Prisma.InputJsonValue
        },
        update: {
          stripeIntentId,
          amountCents: totalCents,
          checkoutUrl,
          status: PaymentIntentStatus.PENDING
        }
      });
      await tx.contract.update({
        where: { id: contract.id },
        data: {
          status: ContractStatus.PAYMENT_PENDING,
          paymentStatus: ContractPaymentStatus.PENDING,
          paymentDueAt: addDays(new Date(), V2_PRICING.paymentDueDays),
          escrowAmountCents: baseCents
        }
      });
    });

    return {
      client_secret: clientSecret,
      payment_intent_id: stripeIntentId ?? `mock_${contract.id}`,
      status: stripeKey ? "requires_payment_method" : "requires_payment_method",
      amount: totalCents,
      currency,
      checkoutUrl: checkoutUrl || undefined
    };
  }

  async handleWebhook(rawBody: string, signatureHeader: string | null): Promise<{ received: boolean }> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    if (!webhookSecret) {
      throw new DomainError("Stripe webhook not configured", "STRIPE_WEBHOOK_NOT_CONFIGURED", 503);
    }
    if (!signatureHeader || !this.verifyStripeSignature(rawBody, signatureHeader, webhookSecret)) {
      throw new DomainError("Invalid Stripe signature", "STRIPE_SIGNATURE_INVALID", 400);
    }

    const event = JSON.parse(rawBody) as {
      id: string;
      type: string;
      data: { object: { id: string; status?: string; amount?: number; metadata?: Record<string, string> } };
    };

    const isNew = await recordWebhookOnce("stripe", event.id, event.type);
    if (!isNew) return { received: true };

    if (event.type === "payment_intent.succeeded") {
      await this.markPaymentSucceeded(event.data.object.id, event.data.object.metadata?.contractId);
    } else if (event.type === "payment_intent.payment_failed") {
      await this.markPaymentFailed(event.data.object.id, event.data.object.metadata?.contractId);
    }

    return { received: true };
  }

  private verifyStripeSignature(payload: string, header: string, secret: string): boolean {
    const parts = Object.fromEntries(
      header.split(",").map((p) => {
        const [k, v] = p.split("=");
        return [k, v];
      })
    ) as Record<string, string>;
    const timestamp = parts.t;
    const sig = parts.v1;
    if (!timestamp || !sig) return false;
    const signed = `${timestamp}.${payload}`;
    const expected = createHash("sha256").update(`${signed}${secret}`).digest("hex");
    try {
      return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    } catch {
      return sig === expected;
    }
  }

  async markPaymentSucceeded(stripeIntentId: string, contractIdHint?: string): Promise<void> {
    const intent = await db.paymentIntent.findFirst({
      where: {
        OR: [{ stripeIntentId }, ...(contractIdHint ? [{ contractId: contractIdHint }] : [])]
      }
    });
    if (!intent?.contractId) return;

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.paymentIntent.update({
        where: { id: intent.id },
        data: { status: PaymentIntentStatus.SUCCEEDED }
      });
      await tx.contract.update({
        where: { id: intent.contractId! },
        data: {
          status: ContractStatus.IN_PROGRESS,
          paymentStatus: ContractPaymentStatus.CONFIRMED,
          escrowStatus: EscrowStatus.LOCKED
        }
      });
      await tx.escrowTransaction.create({
        data: {
          contractId: intent.contractId!,
          type: EscrowTransactionType.LOCK,
          amount: intent.amountCents,
          reason: "Payment confirmed — escrow locked",
          createdBy: "system"
        }
      });
      await tx.paymentTransaction.create({
        data: {
          contractId: intent.contractId!,
          type: PaymentTransactionType.CHARGE,
          amount: intent.amountCents,
          currency: intent.currency,
          fee: Math.round(intent.amountCents * ESCROW_FEE_RATE),
          status: PaymentTransactionStatus.SUCCEEDED,
          provider: intent.provider,
          providerTxnId: stripeIntentId
        }
      });
    });
  }

  async markPaymentFailed(stripeIntentId: string, contractIdHint?: string): Promise<void> {
    const intent = await db.paymentIntent.findFirst({
      where: {
        OR: [{ stripeIntentId }, ...(contractIdHint ? [{ contractId: contractIdHint }] : [])]
      }
    });
    if (!intent?.contractId) return;

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.paymentIntent.update({
        where: { id: intent.id },
        data: { status: PaymentIntentStatus.FAILED }
      });
      await tx.contract.update({
        where: { id: intent.contractId! },
        data: {
          status: ContractStatus.PAYMENT_FAILED,
          paymentStatus: ContractPaymentStatus.FAILED
        }
      });
    });
  }

  /** Mock simulate success (dev / E2E without Stripe). */
  async simulateContractPaymentSuccess(contractId: string, userId: string): Promise<void> {
    const intent = await db.paymentIntent.findFirst({ where: { contractId } });
    if (!intent) {
      await this.createContractPaymentIntent({ userId, contractId });
    }
    const updated = await db.paymentIntent.findFirst({ where: { contractId } });
    if (!updated) throw new NotFoundError("Payment intent not found");
    await this.markPaymentSucceeded(updated.stripeIntentId ?? `mock_${contractId}`, contractId);
  }
}
