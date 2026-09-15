import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/** Stripe default tolerance for webhook timestamps (seconds). */
export const STRIPE_WEBHOOK_TOLERANCE_SEC = 300;

/**
 * Verify Stripe-Signature header using HMAC-SHA256 over `${t}.${payload}`.
 * @see https://docs.stripe.com/webhooks/signatures
 */
export function verifyStripeWebhookSignature(
  payload: string,
  signatureHeader: string | null | undefined,
  secret: string,
  options?: { toleranceSec?: number; nowSec?: number }
): boolean {
  if (!signatureHeader || !secret) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const idx = p.indexOf("=");
      if (idx < 0) return ["", ""];
      return [p.slice(0, idx).trim(), p.slice(idx + 1).trim()];
    })
  ) as Record<string, string>;

  const timestamp = parts.t;
  const sig = parts.v1;
  if (!timestamp || !sig) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;

  const tolerance = options?.toleranceSec ?? STRIPE_WEBHOOK_TOLERANCE_SEC;
  const nowSec = options?.nowSec ?? Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - ts) > tolerance) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`, "utf8").digest("hex");
  return timingSafeEqualHex(sig, expected);
}

/**
 * Midtrans HTTP notification signature:
 * SHA512(order_id + status_code + gross_amount + serverKey)
 * @see https://docs.midtrans.com/docs/https-notification-webhooks
 */
export function computeMidtransSignatureKey(input: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  serverKey: string;
}): string {
  return createHash("sha512")
    .update(`${input.orderId}${input.statusCode}${input.grossAmount}${input.serverKey}`, "utf8")
    .digest("hex");
}

export function verifyMidtransNotificationSignature(input: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  serverKey: string;
  signatureKey: string | null | undefined;
}): boolean {
  if (!input.signatureKey || !input.serverKey) return false;
  const expected = computeMidtransSignatureKey({
    orderId: input.orderId,
    statusCode: input.statusCode,
    grossAmount: input.grossAmount,
    serverKey: input.serverKey
  });
  return timingSafeEqualHex(input.signatureKey, expected);
}

/** DOKU Checkout request/notification signature using the Non-SNAP header scheme. */
export function computeDokuSignature(input: {
  clientId: string;
  requestId: string;
  requestTimestamp: string;
  requestTarget: string;
  body: string;
  secretKey: string;
}): string {
  const digest = createHash("sha256").update(input.body, "utf8").digest("base64");
  const component = [
    `Client-Id:${input.clientId}`,
    `Request-Id:${input.requestId}`,
    `Request-Timestamp:${input.requestTimestamp}`,
    `Request-Target:${input.requestTarget}`,
    `Digest:${digest}`
  ].join("\n");
  return `HMACSHA256=${createHmac("sha256", input.secretKey).update(component, "utf8").digest("base64")}`;
}

export function verifyDokuSignature(input: {
  clientId: string;
  requestId: string;
  requestTimestamp: string;
  requestTarget: string;
  body: string;
  secretKey: string;
  signature: string | null | undefined;
}): boolean {
  if (!input.signature || !input.secretKey) return false;
  const expected = computeDokuSignature(input);
  const a = Buffer.from(input.signature, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}
