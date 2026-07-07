import { createHash } from "node:crypto";
import { V2_PRICING, isMidtransConfigured } from "@acme/config";
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
import { StripePaymentService } from "./stripe-payment.service";

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
    const orderId = `NW-${contract.id.slice(0, 12)}-${Date.now()}`;

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

    return {
      snap_token: body.token,
      snap_redirect_url: body.redirect_url,
      order_id: orderId
    };
  }

  async handleNotification(body: {
    order_id: string;
    transaction_status: string;
    gross_amount: string;
    signature_key?: string;
    transaction_id: string;
  }): Promise<{ received: boolean }> {
    const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim() ?? "";
    if (body.signature_key) {
      const expected = createHash("sha512")
        .update(`${body.order_id}${body.transaction_status}${body.gross_amount}${serverKey}`)
        .digest("hex");
      if (expected !== body.signature_key) {
        throw new DomainError("Invalid Midtrans signature", "MIDTRANS_SIGNATURE_INVALID", 400);
      }
    }

    const isNew = await recordWebhookOnce("midtrans", body.transaction_id, body.transaction_status);
    if (!isNew) return { received: true };

    const intent = await db.paymentIntent.findFirst({
      where: { midtransOrderId: body.order_id }
    });
    if (!intent?.contractId) return { received: true };

    if (body.transaction_status === "settlement" || body.transaction_status === "capture") {
      await this.markSettlement(intent.contractId, intent.id, body.transaction_id, intent.amountCents, intent.currency);
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
    amountCents: number,
    currency: string
  ): Promise<void> {
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.paymentIntent.update({
        where: { id: intentId },
        data: { status: PaymentIntentStatus.SUCCEEDED }
      });
      await tx.contract.update({
        where: { id: contractId },
        data: {
          status: ContractStatus.IN_PROGRESS,
          paymentStatus: ContractPaymentStatus.CONFIRMED,
          escrowStatus: EscrowStatus.LOCKED
        }
      });
      await tx.escrowTransaction.create({
        data: {
          contractId,
          type: EscrowTransactionType.LOCK,
          amount: amountCents,
          reason: "Midtrans settlement — escrow locked",
          createdBy: "system"
        }
      });
      await tx.paymentTransaction.create({
        data: {
          contractId,
          type: PaymentTransactionType.CHARGE,
          amount: amountCents,
          currency,
          status: PaymentTransactionStatus.SUCCEEDED,
          provider: "MIDTRANS",
          providerTxnId: txnId
        }
      });
    });
  }
}
