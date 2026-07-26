/** NextWork V2 pricing constants (USD cents / IDR as noted). */
export const V2_PRICING = {
  escrowFeeRate: 0.02,
  payoutFeeRate: 0.005,
  payoutMinimumIdrCents: 10_000_000, // Rp 100k
  paymentDueDays: 3,
  workReviewDays: 5,
  chargebackHoldDays: 7,
  partialReleaseRate: 0.8,
  holdbackRate: 0.2,
  autoReleaseAfterInProgressDays: 14,
  autoReleasePartialRate: 0.8,
  subscriptionGraceDays: 3,
  appealWindowDays: 7,
  reAppealCooldownDays: 30,
  suspensionRecordRetentionMonths: 12
} as const;

export const BOOST_PRODUCT_DEFS = [
  {
    code: "JOB_BOOST_7D",
    name: "Job Boost (7 days)",
    type: "JOB_BOOST",
    durationDays: 7,
    priceCents: 50_000,
    currency: "IDR"
  },
  {
    code: "CLIENT_JOB_BOOST_7D",
    name: "Client Job Boost (7 days)",
    type: "CLIENT_JOB_BOOST",
    durationDays: 7,
    priceCents: 75_000,
    currency: "IDR"
  },
  {
    code: "PROFILE_FEATURED_30D",
    name: "Featured Profile (30 days)",
    type: "PROFILE_FEATURE",
    durationDays: 30,
    priceCents: 150_000,
    currency: "IDR"
  },
  {
    code: "TOP_FREELANCER_30D",
    name: "Top Freelancer Badge (30 days)",
    type: "TOP_FREELANCER_BADGE",
    durationDays: 30,
    priceCents: 300_000,
    currency: "IDR"
  }
] as const;

export const V2_EXPERIMENT_KEYS = {
  AI_RECOMMENDATIONS: "ai_recommendations_enabled",
  ESCROW: "escrow_enabled",
  NEW_MESSAGING_UI: "new_messaging_ui"
} as const;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function isMidtransConfigured(): boolean {
  return Boolean(process.env.MIDTRANS_SERVER_KEY?.trim());
}

/** Whole IDR units — payments above this skip auto escrow lock pending staff review. */
export function getEscrowManualReviewThresholdIdr(): number {
  const raw = process.env.FEATURE_ESCROW_MANUAL_REVIEW_THRESHOLD_IDR;
  if (raw === undefined || raw === "") return 5_000_000;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 5_000_000;
}
