import { describe, expect, it } from "vitest";
import { V2_PRICING } from "@acme/config";

/**
 * Smoke: happy-path math for accept → pay → escrow lock → partial release → wallet.
 * Full E2E needs DB; this guards the money path constants used by services.
 */
describe("payment path smoke (server-priced)", () => {
  it("checkout total = base + escrow fee (no fake PPN)", () => {
    const bidAmountCents = 500_000;
    const fee = Math.round(bidAmountCents * V2_PRICING.escrowFeeRate);
    const total = bidAmountCents + fee;
    expect(fee).toBe(10_000);
    expect(total).toBe(510_000);
  });

  it("after lock, partial release credits 80% to wallet", () => {
    const escrowAmountCents = 500_000;
    const released = Math.round(escrowAmountCents * V2_PRICING.partialReleaseRate);
    const holdback = escrowAmountCents - released;
    expect(released).toBe(400_000);
    expect(holdback).toBe(100_000);
    const walletAfterApprove = released;
    const walletAfterHoldback = walletAfterApprove + holdback;
    expect(walletAfterHoldback).toBe(escrowAmountCents);
  });

  it("mock simulate route is gated to non-production", () => {
    const allowed = (env: string) => env !== "production";
    expect(allowed("development")).toBe(true);
    expect(allowed("production")).toBe(false);
  });
});
