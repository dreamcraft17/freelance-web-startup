import { V2_PRICING, getEscrowManualReviewThresholdIdr, isMidtransConfigured } from "@acme/config";
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
import { verifyMidtransNotificationSignature } from "../security/payment-webhook-crypto";
import { StripePaymentService } from "./stripe-payment.service";
import { notifyEscrowPaymentRequired } from "./money-notification.service";

function contractAmountCents(amount: { toString(): string } | null | undefined): number {
  if (amount == null) return 0;
  const n = Number(amount);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

async function recordWebhookOnce(provider: string, externalId: string, eventType: string): Promise<boolean> {
  try {
    await db.webhookEvent.create({ data: { provider, externalId, eventType } });
    return true;
  } catch {
    return false;
  }
}

export type MidtransSnapResult = {
  snap_token: string;
  snap_redirect_url: string;
  order_id: string;
};

export class MidtransPaymentService {
  private readonly stripeFallback = new StripePaymentService();

  async createContractSnap(input: {
    userId: string;
    contractId: string;
    clientEmail: string;
    clientName: string;
  }): Promise<MidtransSnapResult> {
    const contract = await db.contract.findFirst({
      where: { id: input.contractId, deletedAt: null },
      include: { bid: true }
    });
    if (!contract) throw new NotFoundError("Contract not found");
    if (contract.clientUserId !== input.userId) {
      throw new PolicyDeniedError("Only the client can pay for this contract");
    }

    const baseCents = contractAmountCents(contract.amount);
    const feeCents = Math.round(baseCents * V2_PRICING.escrowFeeRate);
    const grossAmount = baseCents + feeCents;
    const orderId = `NTW-${contract.id.slice(0, 12)}-${Date.now()}`;

    const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim();
    if (!serverKey || !isMidtransConfigured()) {
      await this.stripeFallback.createContractPaymentIntent({
        userId: input.userId,
        contractId: input.contractId
      });
      return {
        snap_token: "mock",
        snap_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/checkout/mock?contractId=${contract.id}`,
        order_id: orderId
      };
    }

    const isProd = process.env.MIDTRANS_IS_PRODUCTION === "true";
    const baseUrl = isProd ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount
      },
      customer_details: {
        email: input.clientEmail,
        first_name: input.clientName
      },
      metadata: { contractId: contract.id }
    };

    const auth = Buffer.from(`${serverKey}:`).toString("base64");
    const res = await fetch(`${baseUrl}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new DomainError(`Midtrans error: ${errText.slice(0, 200)}`, "MIDTRANS_ERROR", 502);
    }

    const body = (await res.json()) as { token: string; redirect_url: string };

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.paymentIntent.upsert({
        where: { contractId: contract.id },
        create: {
          userId: input.userId,
          contractId: contract.id,
          kind: PaymentIntentKind.CONTRACT_ESCROW,
          status: PaymentIntentStatus.PENDING,
          provider: "MIDTRANS",
          currency: (contract.currency ?? "IDR").toUpperCase(),
          amountCents: grossAmount,
          midtransOrderId: orderId,
          checkoutUrl: body.redirect_url,
          metadata: { contractId: contract.id, baseCents, feeCents }
        },
        update: {
          midtransOrderId: orderId,
          checkoutUrl: body.redirect_url,
          amountCents: grossAmount
        }
      });
      await tx.contract.update({
        where: { id: contract.id },
        data: {
          status: ContractStatus.PAYMENT_PENDING,
          paymentStatus: ContractPaymentStatus.PENDING
        }
      });
    });

    await notifyEscrowPaymentRequired({
      clientUserId: contract.clientUserId,
      contractId: contract.id,
      amountCents: grossAmount,
      currency: (contract.currency ?? "IDR").toUpperCase()
    });

    return {
      snap_token: body.token,
      snap_redirect_url: body.redirect_url,
      order_id: orderId
    };
  }

  async handleNotification(body: {
    order_id: string;
    transaction_status: string;
    status_code?: string;
    gross_amount: string;
    signature_key?: string;
    transaction_id: string;
  }): Promise<{ received: boolean }> {
    const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim() ?? "";
    if (!serverKey) {
      throw new DomainError("Midtrans webhook not configured", "MIDTRANS_WEBHOOK_NOT_CONFIGURED", 503);
    }
    if (
      !body.signature_key ||
      !body.status_code ||
      !verifyMidtransNotificationSignature({
        orderId: body.order_id,
        statusCode: body.status_code,
        grossAmount: body.gross_amount,
        serverKey,
        signatureKey: body.signature_key
      })
    ) {
      throw new DomainError("Invalid Midtrans signature", "MIDTRANS_SIGNATURE_INVALID", 400);
    }

    const isNew = await recordWebhookOnce("midtrans", body.transaction_id, body.transaction_status);
    if (!isNew) return { received: true };

    const intent = await db.paymentIntent.findFirst({
      where: { midtransOrderId: body.order_id }
    });
    if (!intent?.contractId) return { received: true };

    const gross = Number(body.gross_amount);
    if (Number.isFinite(gross) && Math.round(gross) !== intent.amountCents) {
      throw new DomainError(
        `Midtrans amount mismatch: expected ${intent.amountCents}, got ${gross}`,
        "MIDTRANS_AMOUNT_MISMATCH",
        400
      );
    }

    if (body.transaction_status === "settlement" || body.transaction_status === "capture") {
      await this.markSettlement(intent.contractId, intent.id, body.transaction_id, intent);
    } else if (body.transaction_status === "expire") {
      await db.contract.update({
        where: { id: intent.contractId },
        data: {
          status: ContractStatus.CANCELLED,
          paymentStatus: ContractPaymentStatus.EXPIRED
        }
      });
    } else if (body.transaction_status === "deny") {
      await db.contract.update({
        where: { id: intent.contractId },
        data: {
          status: ContractStatus.PAYMENT_FAILED,
          paymentStatus: ContractPaymentStatus.FAILED
        }
      });
    }

    return { received: true };
  }

  private async markSettlement(
    contractId: string,
    intentId: string,
    txnId: string,
    intent: { amountCents: number; currency: string; metadata: unknown }
  ): Promise<void> {
    const meta = (intent.metadata ?? {}) as { baseCents?: number; feeCents?: number };
    const baseCents =
      typeof meta.baseCents === "number"
        ? meta.baseCents
        : Math.round(intent.amountCents / (1 + V2_PRICING.escrowFeeRate));
    const feeCents =
      typeof meta.feeCents === "number"
        ? meta.feeCents
        : Math.round(baseCents * V2_PRICING.escrowFeeRate);

    const currencyUpper = intent.currency.toUpperCase();
    const needsManualReview =
      currencyUpper === "IDR" && baseCents >= getEscrowManualReviewThresholdIdr();

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.paymentIntent.update({
        where: { id: intentId },
        data: {
          status: PaymentIntentStatus.SUCCEEDED,
          ...(needsManualReview
            ? {
                metadata: {
                  ...(typeof intent.metadata === "object" && intent.metadata !== null
                    ? (intent.metadata as Record<string, unknown>)
                    : {}),
                  pendingManualReview: true,
                  manualReviewReason: "Amount exceeds escrow auto-lock threshold"
                } as Prisma.InputJsonValue
              }
            : {})
        }
      });
      await tx.contract.update({
        where: { id: contractId },
        data: {
          status: ContractStatus.IN_PROGRESS,
          paymentStatus: ContractPaymentStatus.CONFIRMED,
          escrowStatus: needsManualReview ? EscrowStatus.NONE : EscrowStatus.LOCKED,
          escrowAmountCents: baseCents
        }
      });
      if (!needsManualReview) {
        await tx.escrowTransaction.create({
          data: {
            contractId,
            type: EscrowTransactionType.LOCK,
            amount: baseCents,
            reason: "Midtrans settlement — escrow locked",
            createdBy: "system"
          }
        });
      }
      await tx.paymentTransaction.create({
        data: {
          contractId,
          type: PaymentTransactionType.CHARGE,
          amount: intent.amountCents,
          currency: intent.currency,
          fee: feeCents,
          status: PaymentTransactionStatus.SUCCEEDED,
          provider: "MIDTRANS",
          providerTxnId: txnId
        }
      });
      await tx.auditLog.create({
        data: {
          actorId: null,
          action: needsManualReview ? "PAYMENT_PENDING_ESCROW_REVIEW" : "PAYMENT_SUCCEEDED",
          targetType: "Contract",
          targetId: contractId,
          metadata: {
            providerTxnId: txnId,
            amountCents: intent.amountCents,
            needsManualReview
          } as object
        }
      });
    });
  }
}
