import { V2_PRICING, getEscrowManualReviewThresholdIdr, isDokuConfigured } from "@acme/config";
import { randomUUID } from "node:crypto";
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
import { computeDokuSignature, verifyDokuSignature } from "../security/payment-webhook-crypto";
import { notifyEscrowPaymentRequired } from "./money-notification.service";

type DokuCheckoutResponse = {
  response?: { payment?: { url?: string }; order?: { invoice_number?: string } };
};

function amountOf(value: { toString(): string } | null | undefined): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount) : 0;
}

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "http://localhost:3000").replace(/\/$/, "");
}

function dokuBaseUrl(): string {
  return process.env.DOKU_IS_PRODUCTION === "true" ? "https://api.doku.com" : "https://api-sandbox.doku.com";
}

export type DokuCheckoutResult = { payment_url: string; invoice_number: string };

export class DokuPaymentService {
  async createContractCheckout(input: {
    userId: string;
    contractId: string;
    clientEmail: string;
    clientName: string;
  }): Promise<DokuCheckoutResult> {
    const contract = await db.contract.findFirst({
      where: { id: input.contractId, deletedAt: null },
      include: { bid: true }
    });
    if (!contract) throw new NotFoundError("Contract not found");
    if (contract.clientUserId !== input.userId) {
      throw new PolicyDeniedError("Only the client can pay for this contract");
    }

    const baseCents = amountOf(contract.amount);
    const feeCents = Math.round(baseCents * V2_PRICING.escrowFeeRate);
    const amount = baseCents + feeCents;
    const invoice = `NW${contract.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)}${Date.now()}`.slice(0, 64);
    const notificationUrl = process.env.DOKU_NOTIFICATION_URL?.trim() || `${appUrl()}/api/payments/doku/notification`;

    if (!isDokuConfigured()) {
      return { payment_url: `${appUrl()}/checkout/mock?contractId=${encodeURIComponent(contract.id)}`, invoice_number: invoice };
    }

    const clientId = process.env.DOKU_CLIENT_ID!.trim();
    const secretKey = process.env.DOKU_SECRET_KEY!.trim();
    const target = "/checkout/v1/payment";
    const requestId = randomUUID();
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    const payload = JSON.stringify({
      order: {
        amount,
        invoice_number: invoice,
        currency: "IDR",
        callback_url: `${appUrl()}/checkout/mock?contractId=${encodeURIComponent(contract.id)}`,
        callback_url_result: `${appUrl()}/checkout/mock?contractId=${encodeURIComponent(contract.id)}`,
        auto_redirect: true,
        line_items: [{ id: contract.id, name: "dnPeople escrow contract", quantity: 1, price: amount }]
      },
      payment: { payment_due_date: 60 },
      customer: { id: input.userId, name: input.clientName, email: input.clientEmail },
      additional_info: { override_notification_url: notificationUrl }
    });
    const signature = computeDokuSignature({
      clientId,
      requestId,
      requestTimestamp: timestamp,
      requestTarget: target,
      body: payload,
      secretKey
    });
    const response = await fetch(`${dokuBaseUrl()}${target}`, {
      method: "POST",
      headers: {
        "Client-Id": clientId,
        "Request-Id": requestId,
        "Request-Timestamp": timestamp,
        Signature: signature,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: payload
    });
    const body = (await response.json()) as DokuCheckoutResponse & { message?: string[] };
    const paymentUrl = body.response?.payment?.url;
    if (!response.ok || !paymentUrl) {
      throw new DomainError(`DOKU error: ${(body.message ?? []).join(", ") || "checkout URL missing"}`.slice(0, 240), "DOKU_ERROR", 502);
    }

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.paymentIntent.upsert({
        where: { contractId: contract.id },
        create: {
          userId: input.userId, contractId: contract.id, kind: PaymentIntentKind.CONTRACT_ESCROW,
          status: PaymentIntentStatus.PENDING, provider: "DOKU", currency: "IDR", amountCents: amount,
          dokuInvoiceNumber: invoice, checkoutUrl: paymentUrl, metadata: { contractId: contract.id, baseCents, feeCents }
        },
        update: {
          provider: "DOKU", dokuInvoiceNumber: invoice, checkoutUrl: paymentUrl, amountCents: amount,
          status: PaymentIntentStatus.PENDING, metadata: { contractId: contract.id, baseCents, feeCents }
        }
      });
      await tx.contract.update({ where: { id: contract.id }, data: { status: ContractStatus.PAYMENT_PENDING, paymentStatus: ContractPaymentStatus.PENDING } });
    });
    await notifyEscrowPaymentRequired({ clientUserId: contract.clientUserId, contractId: contract.id, amountCents: amount, currency: "IDR" });
    return { payment_url: paymentUrl, invoice_number: invoice };
  }

  async handleNotification(input: { body: string; clientId: string; requestId: string; timestamp: string; signature: string | null; requestTarget: string }): Promise<{ received: boolean }> {
    const clientId = process.env.DOKU_CLIENT_ID?.trim() ?? "";
    const secretKey = process.env.DOKU_SECRET_KEY?.trim() ?? "";
    if (!clientId || !secretKey) throw new DomainError("DOKU webhook not configured", "DOKU_WEBHOOK_NOT_CONFIGURED", 503);
    if (!verifyDokuSignature({ clientId, requestId: input.requestId, requestTimestamp: input.timestamp, requestTarget: input.requestTarget, body: input.body, secretKey, signature: input.signature })) {
      throw new DomainError("Invalid DOKU signature", "DOKU_SIGNATURE_INVALID", 400);
    }
    const body = JSON.parse(input.body) as { order?: { invoice_number?: string; amount?: number | string }; transaction?: { status?: string }; virtual_account_payment?: { identifier?: Array<{ name?: string; value?: string }> } };
    const invoice = body.order?.invoice_number;
    if (!invoice) return { received: true };
    try { await db.webhookEvent.create({ data: { provider: "doku", externalId: input.requestId, eventType: body.transaction?.status ?? "UNKNOWN" } }); } catch { return { received: true }; }
    const intent = await db.paymentIntent.findFirst({ where: { dokuInvoiceNumber: invoice } });
    if (!intent?.contractId) return { received: true };
    const amount = Number(body.order?.amount);
    if (Number.isFinite(amount) && Math.round(amount) !== intent.amountCents) throw new DomainError("DOKU amount mismatch", "DOKU_AMOUNT_MISMATCH", 400);
    if (body.transaction?.status !== "SUCCESS") return { received: true };

    const meta = (intent.metadata ?? {}) as { baseCents?: number; feeCents?: number };
    const baseCents = typeof meta.baseCents === "number" ? meta.baseCents : Math.round(intent.amountCents / (1 + V2_PRICING.escrowFeeRate));
    const feeCents = typeof meta.feeCents === "number" ? meta.feeCents : Math.round(baseCents * V2_PRICING.escrowFeeRate);
    const needsManualReview = baseCents >= getEscrowManualReviewThresholdIdr();
    const providerTxnId = body.virtual_account_payment?.identifier?.find((x) => x.value)?.value ?? input.requestId;
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.paymentIntent.update({ where: { id: intent.id }, data: { status: PaymentIntentStatus.SUCCEEDED } });
      await tx.contract.update({ where: { id: intent.contractId! }, data: { status: ContractStatus.IN_PROGRESS, paymentStatus: ContractPaymentStatus.CONFIRMED, escrowStatus: needsManualReview ? EscrowStatus.NONE : EscrowStatus.LOCKED, escrowAmountCents: baseCents } });
      if (!needsManualReview) await tx.escrowTransaction.create({ data: { contractId: intent.contractId!, type: EscrowTransactionType.LOCK, amount: baseCents, reason: "DOKU settlement — escrow locked", createdBy: "system" } });
      await tx.paymentTransaction.create({ data: { contractId: intent.contractId!, type: PaymentTransactionType.CHARGE, amount: intent.amountCents, currency: intent.currency, fee: feeCents, status: PaymentTransactionStatus.SUCCEEDED, provider: "DOKU", providerTxnId } });
    });
    return { received: true };
  }
}
