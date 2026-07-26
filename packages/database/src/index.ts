import { PrismaClient } from "@prisma/client";

export { db } from "./client";

export { PaymentIntentKind, PaymentIntentStatus, Prisma } from "@prisma/client";
export {
  AccountStatus,
  AppealStatus,
  BoostStatus,
  BoostTargetType,
  ContractPaymentStatus,
  ContractStatus,
  DisputeDecision,
  DisputeStatus,
  EscrowStatus,
  EscrowTransactionType,
  JobStatus,
  PayoutRequestStatus,
  PaymentTransactionStatus,
  PaymentTransactionType,
  SuspensionLevel,
  SuspensionStatus
} from "@prisma/client";
export { Decimal } from "@prisma/client/runtime/library";
export type { ClientProfile, FreelancerProfile } from "@prisma/client";
/** Re-export moderation models so app packages typecheck without a direct `@prisma/client` dependency. */
export type {
  ModerationReport,
  ModerationReportNote,
  ModerationReportPriority,
  ModerationReportStatus,
  ModerationReportSubjectType
} from "@prisma/client";

export {
  expireStaleBoosts,
  processBatchPayouts,
  processEscrowAutoReleases,
  runPaymentReconciliation
} from "./money-jobs";

export { notifyEscrowReleased, notifyPayoutSent } from "./money-notifications";

/** @deprecated Prefer importing `db` — kept so accidental `PrismaClient` imports still resolve via package. */
export type { PrismaClient };
