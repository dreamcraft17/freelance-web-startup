export enum UserRole {
  ADMIN = "ADMIN",
  CLIENT = "CLIENT",
  FREELANCER = "FREELANCER",
  AGENCY_OWNER = "AGENCY_OWNER",
  AGENCY_MANAGER = "AGENCY_MANAGER",
  AGENCY_MEMBER = "AGENCY_MEMBER",
  SUPPORT_ADMIN = "SUPPORT_ADMIN",
  FINANCE_ADMIN = "FINANCE_ADMIN",
  MODERATOR = "MODERATOR"
}

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED",
  DELETED = "DELETED"
}

export enum WorkMode {
  REMOTE = "REMOTE",
  ONSITE = "ONSITE",
  HYBRID = "HYBRID"
}

export enum AvailabilityStatus {
  AVAILABLE = "AVAILABLE",
  LIMITED = "LIMITED",
  UNAVAILABLE = "UNAVAILABLE",
  ON_LEAVE = "ON_LEAVE"
}

export enum VerificationStatus {
  NOT_VERIFIED = "NOT_VERIFIED",
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED"
}

export enum BidStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  SHORTLISTED = "SHORTLISTED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED"
}

export enum ContractStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  DISPUTED = "DISPUTED",
  ARCHIVED = "ARCHIVED"
}

export enum JobStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  IN_REVIEW = "IN_REVIEW",
  PAUSED = "PAUSED",
  CLOSED = "CLOSED",
  CANCELLED = "CANCELLED",
  ARCHIVED = "ARCHIVED"
}

export enum JobVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  INVITE_ONLY = "INVITE_ONLY"
}

export enum BudgetType {
  FIXED = "FIXED",
  HOURLY = "HOURLY",
  RANGE = "RANGE",
  REQUEST_QUOTE = "REQUEST_QUOTE"
}

export enum SubscriptionStatus {
  TRIALING = "TRIALING",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  CANCELED = "CANCELED",
  EXPIRED = "EXPIRED"
}

export enum BillingCycle {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  YEARLY = "YEARLY"
}

export enum NotificationType {
  BID_SUBMITTED = "BID_SUBMITTED",
  BID_SHORTLISTED = "BID_SHORTLISTED",
  BID_ACCEPTED = "BID_ACCEPTED",
  CONTRACT_STARTED = "CONTRACT_STARTED",
  NEW_MESSAGE = "NEW_MESSAGE",
  REVIEW_RECEIVED = "REVIEW_RECEIVED",
  VERIFICATION_UPDATED = "VERIFICATION_UPDATED",
  BILLING_UPDATED = "BILLING_UPDATED",
  ADMIN_MODERATION_EVENT = "ADMIN_MODERATION_EVENT"
}

export enum ReviewTargetType {
  CLIENT = "CLIENT",
  FREELANCER = "FREELANCER"
}

export enum VerificationType {
  IDENTITY = "IDENTITY",
  BUSINESS = "BUSINESS",
  ADDRESS = "ADDRESS",
  CERTIFICATION = "CERTIFICATION",
  PAYMENT_METHOD = "PAYMENT_METHOD"
}

/**
 * Canonical plan caps per tier. Merge with `SubscriptionPlan.entitlements` in the app layer, then pass through
 * `resolvePlanEntitlements` from `@acme/config` for derived fields (`maxActiveContracts`, `canBoostProfile`, …).
 */
export type PlanEntitlements = {
  maxActiveBids: number;
  maxActiveAcceptedContracts: number;
  analyticsTier: "LIMITED" | "ADVANCED" | "AGENCY";
  hasBoost: boolean;
  hasPremiumBadge: boolean;
};
