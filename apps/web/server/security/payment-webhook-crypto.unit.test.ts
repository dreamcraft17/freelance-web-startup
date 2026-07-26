import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  computeMidtransSignatureKey,
  verifyMidtransNotificationSignature,
  verifyStripeWebhookSignature
} from "./payment-webhook-crypto";

describe("verifyStripeWebhookSignature", () => {
  const secret = "whsec_test_secret";
  const payload = JSON.stringify({ id: "evt_1", type: "payment_intent.succeeded" });
  const nowSec = 1_700_000_000;

  function sign(ts: number, body: string, key = secret): string {
    const v1 = createHmac("sha256", key).update(`${ts}.${body}`, "utf8").digest("hex");
    return `t=${ts},v1=${v1}`;
  }

  it("accepts a valid HMAC-SHA256 signature within tolerance", () => {
    const header = sign(nowSec, payload);
    expect(verifyStripeWebhookSignature(payload, header, secret, { nowSec })).toBe(true);
  });

  it("rejects missing header", () => {
    expect(verifyStripeWebhookSignature(payload, null, secret, { nowSec })).toBe(false);
  });

  it("rejects wrong secret", () => {
    const header = sign(nowSec, payload, "wrong_secret");
    expect(verifyStripeWebhookSignature(payload, header, secret, { nowSec })).toBe(false);
  });

  it("rejects tampered payload", () => {
    const header = sign(nowSec, payload);
    expect(verifyStripeWebhookSignature(payload + "x", header, secret, { nowSec })).toBe(false);
  });

  it("rejects stale timestamp outside tolerance", () => {
    const stale = nowSec - 400;
    const header = sign(stale, payload);
    expect(verifyStripeWebhookSignature(payload, header, secret, { nowSec, toleranceSec: 300 })).toBe(false);
  });

  it("rejects legacy createHash-style forgery", () => {
    const ts = nowSec;
    // Old buggy scheme: sha256(`${t}.${payload}${secret}`) — must not verify
    const { createHash } = require("node:crypto") as typeof import("node:crypto");
    const forged = createHash("sha256").update(`${ts}.${payload}${secret}`).digest("hex");
    const header = `t=${ts},v1=${forged}`;
    expect(verifyStripeWebhookSignature(payload, header, secret, { nowSec })).toBe(false);
  });
});

describe("verifyMidtransNotificationSignature", () => {
  const serverKey = "SB-Mid-server-testkey";
  const orderId = "NTW-abc123-1700000000";
  const statusCode = "200";
  const grossAmount = "10000.00";

  it("accepts SHA512(order_id + status_code + gross_amount + serverKey)", () => {
    const signatureKey = computeMidtransSignatureKey({
      orderId,
      statusCode,
      grossAmount,
      serverKey
    });
    expect(
      verifyMidtransNotificationSignature({
        orderId,
        statusCode,
        grossAmount,
        serverKey,
        signatureKey
      })
    ).toBe(true);
  });

  it("rejects missing signature", () => {
    expect(
      verifyMidtransNotificationSignature({
        orderId,
        statusCode,
        grossAmount,
        serverKey,
        signatureKey: undefined
      })
    ).toBe(false);
  });

  it("rejects signature built with transaction_status instead of status_code", () => {
    const wrong = computeMidtransSignatureKey({
      orderId,
      statusCode: "settlement",
      grossAmount,
      serverKey
    });
    expect(
      verifyMidtransNotificationSignature({
        orderId,
        statusCode,
        grossAmount,
        serverKey,
        signatureKey: wrong
      })
    ).toBe(false);
  });

  it("rejects tampered gross_amount", () => {
    const signatureKey = computeMidtransSignatureKey({
      orderId,
      statusCode,
      grossAmount,
      serverKey
    });
    expect(
      verifyMidtransNotificationSignature({
        orderId,
        statusCode,
        grossAmount: "1.00",
        serverKey,
        signatureKey
      })
    ).toBe(false);
  });
});
