-- NearWork V2: payments, escrow, boosts, recommendations, appeals

-- CreateEnum
CREATE TYPE "ContractPaymentStatus" AS ENUM ('NONE', 'PENDING', 'CONFIRMED', 'FAILED', 'EXPIRED');
CREATE TYPE "EscrowStatus" AS ENUM ('NONE', 'LOCKED', 'PARTIAL_RELEASED', 'FULLY_RELEASED', 'DISPUTED', 'REFUNDED');
CREATE TYPE "PaymentTransactionType" AS ENUM ('CHARGE', 'REFUND', 'PAYOUT');
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');
CREATE TYPE "BoostTargetType" AS ENUM ('JOB', 'PROFILE');
CREATE TYPE "BoostStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'PAUSED');
CREATE TYPE "SuspensionLevel" AS ENUM ('WARNING', 'SOFT_SUSPEND', 'HARD_SUSPEND');
CREATE TYPE "SuspensionStatus" AS ENUM ('ACTIVE', 'APPEALED', 'RESOLVED');
CREATE TYPE "AppealStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'PENDING_MORE_INFO');
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'REVIEWING', 'RESOLVED', 'APPEALED');
CREATE TYPE "DisputeDecision" AS ENUM ('FAVOR_CLIENT', 'FAVOR_FREELANCER', 'SPLIT');
CREATE TYPE "PayoutRequestStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED');
CREATE TYPE "EscrowTransactionType" AS ENUM ('LOCK', 'PARTIAL_RELEASE', 'FULL_RELEASE', 'REFUND');

-- AlterEnum ContractStatus
ALTER TYPE "ContractStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_PENDING';
ALTER TYPE "ContractStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_FAILED';
ALTER TYPE "ContractStatus" ADD VALUE IF NOT EXISTS 'IN_REVIEW';

-- AlterEnum PaymentIntentKind
ALTER TYPE "PaymentIntentKind" ADD VALUE IF NOT EXISTS 'CONTRACT_ESCROW';
ALTER TYPE "PaymentIntentKind" ADD VALUE IF NOT EXISTS 'BOOST_PURCHASE';

-- AlterEnum NotificationType
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ESCROW_PAYMENT_REQUIRED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ESCROW_WORK_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ESCROW_RELEASED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PAYOUT_SENT';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'APPEAL_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'RECOMMENDATION_DIGEST';

-- AlterTable Contract
ALTER TABLE "Contract" ADD COLUMN "paymentStatus" "ContractPaymentStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "Contract" ADD COLUMN "escrowStatus" "EscrowStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "Contract" ADD COLUMN "escrowAmountCents" INTEGER;
ALTER TABLE "Contract" ADD COLUMN "escrowReleasedAt" TIMESTAMP(3);
ALTER TABLE "Contract" ADD COLUMN "workSubmittedAt" TIMESTAMP(3);
ALTER TABLE "Contract" ADD COLUMN "workReviewDeadline" TIMESTAMP(3);
ALTER TABLE "Contract" ADD COLUMN "paymentDueAt" TIMESTAMP(3);

-- AlterTable PaymentIntent
ALTER TABLE "PaymentIntent" ADD COLUMN "contractId" TEXT;
ALTER TABLE "PaymentIntent" ADD COLUMN "stripeIntentId" VARCHAR(128);
ALTER TABLE "PaymentIntent" ADD COLUMN "midtransOrderId" VARCHAR(128);
ALTER TABLE "PaymentIntent" ADD COLUMN "idempotencyKey" VARCHAR(128);

CREATE UNIQUE INDEX "PaymentIntent_contractId_key" ON "PaymentIntent"("contractId");
CREATE UNIQUE INDEX "PaymentIntent_stripeIntentId_key" ON "PaymentIntent"("stripeIntentId");
CREATE UNIQUE INDEX "PaymentIntent_midtransOrderId_key" ON "PaymentIntent"("midtransOrderId");
CREATE UNIQUE INDEX "PaymentIntent_idempotencyKey_key" ON "PaymentIntent"("idempotencyKey");
CREATE INDEX "PaymentIntent_contractId_idx" ON "PaymentIntent"("contractId");

ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable PaymentTransaction
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "contractId" TEXT,
    "type" "PaymentTransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "fee" INTEGER NOT NULL DEFAULT 0,
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "provider" VARCHAR(32) NOT NULL,
    "providerTxnId" VARCHAR(191) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PaymentTransaction_contractId_idx" ON "PaymentTransaction"("contractId");
CREATE INDEX "PaymentTransaction_provider_providerTxnId_idx" ON "PaymentTransaction"("provider", "providerTxnId");
CREATE INDEX "PaymentTransaction_status_createdAt_idx" ON "PaymentTransaction"("status", "createdAt");

ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable EscrowTransaction
CREATE TABLE "EscrowTransaction" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "type" "EscrowTransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT,
    "createdBy" VARCHAR(72),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EscrowTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EscrowTransaction_contractId_idx" ON "EscrowTransaction"("contractId");
CREATE INDEX "EscrowTransaction_createdAt_idx" ON "EscrowTransaction"("createdAt");

ALTER TABLE "EscrowTransaction" ADD CONSTRAINT "EscrowTransaction_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable ContractDispute
CREATE TABLE "ContractDispute" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "initiatedByUserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "evidence" TEXT[],
    "assignedToStaffUserId" TEXT,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "decision" "DisputeDecision",
    "resolution" TEXT,
    "resolutionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractDispute_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContractDispute_contractId_key" ON "ContractDispute"("contractId");
CREATE INDEX "ContractDispute_status_createdAt_idx" ON "ContractDispute"("status", "createdAt");
CREATE INDEX "ContractDispute_assignedToStaffUserId_idx" ON "ContractDispute"("assignedToStaffUserId");

ALTER TABLE "ContractDispute" ADD CONSTRAINT "ContractDispute_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContractDispute" ADD CONSTRAINT "ContractDispute_assignedToStaffUserId_fkey" FOREIGN KEY ("assignedToStaffUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable BoostProduct
CREATE TABLE "BoostProduct" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" VARCHAR(64) NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'IDR',
    "config" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoostProduct_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BoostProduct_code_key" ON "BoostProduct"("code");
CREATE INDEX "BoostProduct_isActive_type_idx" ON "BoostProduct"("isActive", "type");

-- CreateTable Boost
CREATE TABLE "Boost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "targetType" "BoostTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "status" "BoostStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "expiredAt" TIMESTAMP(3),
    "paymentTxnId" VARCHAR(72),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Boost_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Boost_userId_idx" ON "Boost"("userId");
CREATE INDEX "Boost_expiresAt_idx" ON "Boost"("expiresAt");
CREATE INDEX "Boost_targetType_targetId_status_idx" ON "Boost"("targetType", "targetId", "status");

ALTER TABLE "Boost" ADD CONSTRAINT "Boost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Boost" ADD CONSTRAINT "Boost_productId_fkey" FOREIGN KEY ("productId") REFERENCES "BoostProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable Recommendation
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "matchReasons" TEXT[],
    "viewedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bidSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Recommendation_freelancerId_jobId_key" ON "Recommendation"("freelancerId", "jobId");
CREATE INDEX "Recommendation_freelancerId_score_idx" ON "Recommendation"("freelancerId", "score");
CREATE INDEX "Recommendation_expiresAt_idx" ON "Recommendation"("expiresAt");

ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable RecommendationMetric
CREATE TABLE "RecommendationMetric" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalGenerated" INTEGER NOT NULL DEFAULT 0,
    "totalViewed" INTEGER NOT NULL DEFAULT 0,
    "totalClicked" INTEGER NOT NULL DEFAULT 0,
    "totalBids" INTEGER NOT NULL DEFAULT 0,
    "ctrRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationMetric_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RecommendationMetric_date_key" ON "RecommendationMetric"("date");

-- CreateTable UserSuspension
CREATE TABLE "UserSuspension" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" "SuspensionLevel" NOT NULL,
    "reason" TEXT NOT NULL,
    "reportId" VARCHAR(72),
    "status" "SuspensionStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "appliedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSuspension_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserSuspension_userId_key" ON "UserSuspension"("userId");
CREATE INDEX "UserSuspension_status_level_idx" ON "UserSuspension"("status", "level");

ALTER TABLE "UserSuspension" ADD CONSTRAINT "UserSuspension_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSuspension" ADD CONSTRAINT "UserSuspension_appliedByUserId_fkey" FOREIGN KEY ("appliedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable SuspensionAppeal
CREATE TABLE "SuspensionAppeal" (
    "id" TEXT NOT NULL,
    "suspensionId" TEXT NOT NULL,
    "appealReason" TEXT NOT NULL,
    "evidence" TEXT[],
    "status" "AppealStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedByUserId" TEXT,
    "decision" TEXT,
    "decisionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "SuspensionAppeal_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SuspensionAppeal_suspensionId_key" ON "SuspensionAppeal"("suspensionId");
CREATE INDEX "SuspensionAppeal_status_createdAt_idx" ON "SuspensionAppeal"("status", "createdAt");

ALTER TABLE "SuspensionAppeal" ADD CONSTRAINT "SuspensionAppeal_suspensionId_fkey" FOREIGN KEY ("suspensionId") REFERENCES "UserSuspension"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SuspensionAppeal" ADD CONSTRAINT "SuspensionAppeal_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable BankAccount
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bankCode" VARCHAR(32) NOT NULL,
    "bankName" VARCHAR(120) NOT NULL,
    "accountNumber" VARCHAR(64) NOT NULL,
    "accountName" VARCHAR(120) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BankAccount_userId_isDefault_idx" ON "BankAccount"("userId", "isDefault");

ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable FreelancerWallet
CREATE TABLE "FreelancerWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balanceCents" INTEGER NOT NULL DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'IDR',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreelancerWallet_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FreelancerWallet_userId_key" ON "FreelancerWallet"("userId");

ALTER TABLE "FreelancerWallet" ADD CONSTRAINT "FreelancerWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable PayoutRequest
CREATE TABLE "PayoutRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'IDR',
    "feeCents" INTEGER NOT NULL DEFAULT 0,
    "bankAccountId" TEXT,
    "status" "PayoutRequestStatus" NOT NULL DEFAULT 'PENDING',
    "receiptId" VARCHAR(128),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "lastError" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "PayoutRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PayoutRequest_userId_status_idx" ON "PayoutRequest"("userId", "status");
CREATE INDEX "PayoutRequest_status_requestedAt_idx" ON "PayoutRequest"("status", "requestedAt");

ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable WebhookEvent
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" VARCHAR(32) NOT NULL,
    "externalId" VARCHAR(191) NOT NULL,
    "eventType" VARCHAR(128) NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WebhookEvent_provider_externalId_key" ON "WebhookEvent"("provider", "externalId");
CREATE INDEX "WebhookEvent_provider_eventType_idx" ON "WebhookEvent"("provider", "eventType");

-- CreateTable UserExperiment
CREATE TABLE "UserExperiment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "experimentKey" VARCHAR(64) NOT NULL,
    "variant" VARCHAR(32) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserExperiment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserExperiment_userId_experimentKey_key" ON "UserExperiment"("userId", "experimentKey");
CREATE INDEX "UserExperiment_experimentKey_variant_idx" ON "UserExperiment"("experimentKey", "variant");
