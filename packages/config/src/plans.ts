import { BidStatus, ContractStatus, type PlanEntitlements } from "@acme/types";

export const PLAN_KEYS = {
  FREE: "FREE",
  PRO: "PRO",
  AGENCY: "AGENCY"
} as const;

export type PlanKey = (typeof PLAN_KEYS)[keyof typeof PLAN_KEYS];

export const PLAN_ENTITLEMENTS: Record<PlanKey, PlanEntitlements> = {
  FREE: {
    maxActiveBids: 5,
    maxActiveAcceptedContracts: 2,
    analyticsTier: "LIMITED",
    hasBoost: false,
    hasPremiumBadge: false
  },
  PRO: {
    maxActiveBids: 30,
    maxActiveAcceptedContracts: 10,
    analyticsTier: "ADVANCED",
    hasBoost: true,
    hasPremiumBadge: true
  },
  AGENCY: {
    maxActiveBids: 200,
    maxActiveAcceptedContracts: 75,
    analyticsTier: "AGENCY",
    hasBoost: true,
    hasPremiumBadge: true
  }
};

export const ACTIVE_BID_STATUSES = [
  BidStatus.SUBMITTED,
  BidStatus.SHORTLISTED,
  BidStatus.ACCEPTED
] as const;

export const ACTIVE_CONTRACT_STATUSES = [
  ContractStatus.ACTIVE,
  ContractStatus.IN_PROGRESS
] as const;
