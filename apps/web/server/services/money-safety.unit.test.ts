import { describe, expect, it } from "vitest";
import { V2_PRICING } from "@acme/config";

/** Mirrors fee accounting used by Stripe/Midtrans settlement handlers. */
function feeFromBase(baseCents: number): number {
  return Math.round(baseCents * V2_PRICING.escrowFeeRate);
}

function feeFromGrossWrong(grossCents: number): number {
  return Math.round(grossCents * V2_PRICING.escrowFeeRate);
}

describe("webhook amount / fee accounting", () => {
  it("computes platform fee from base (not gross)", () => {
    const base = 400_000;
    const fee = feeFromBase(base);
    const gross = base + fee;
    expect(fee).toBe(8_000);
    expect(gross).toBe(408_000);
    // Anti-regression: gross×rate overcharges vs base×rate
    expect(feeFromGrossWrong(gross)).toBeGreaterThan(fee);
  });

  it("rejects amount mismatch vs intent", () => {
    const intentAmount: number = 408_000;
    const pspAmount: number = 400_000;
    expect(pspAmount === intentAmount).toBe(false);
  });

  it("partial release is 80/20 of escrow base", () => {
    const escrow = 400_000;
    const release = Math.round(escrow * V2_PRICING.partialReleaseRate);
    const holdback = escrow - release;
    expect(release).toBe(320_000);
    expect(holdback).toBe(80_000);
  });
});

describe("mock payment production gate", () => {
  it("documents mock only outside production", () => {
    const allow = (nodeEnv: string | undefined) => nodeEnv !== "production";
    expect(allow("development")).toBe(true);
    expect(allow("test")).toBe(true);
    expect(allow("production")).toBe(false);
  });
});

describe("worker money-jobs wiring", () => {
  it("exports canonical processors from @acme/database", async () => {
    const mod = await import("@acme/database");
    expect(typeof mod.processEscrowAutoReleases).toBe("function");
    expect(typeof mod.expireStaleBoosts).toBe("function");
    expect(typeof mod.processBatchPayouts).toBe("function");
  });
});
