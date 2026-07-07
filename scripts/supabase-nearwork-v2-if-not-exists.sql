-- NearWork V2 — Supabase / PostgreSQL (idempotent)
-- Jalankan di SQL Editor Supabase. Aman di-run ulang (IF NOT EXISTS / duplicate_object).

-- =============================================================================
-- 1) ENUM types (baru)
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE "ContractPaymentStatus" AS ENUM ('NONE', 'PENDING', 'CONFIRMED', 'FAILED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "EscrowStatus" AS ENUM ('NONE', 'LOCKED', 'PARTIAL_RELEASED', 'FULLY_RELEASED', 'DISPUTED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentTransactionType" AS ENUM ('CHARGE', 'REFUND', 'PAYOUT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentTransactionStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "BoostTargetType" AS ENUM ('JOB', 'PROFILE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "BoostStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'PAUSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SuspensionLevel" AS ENUM ('WARNING', 'SOFT_SUSPEND', 'HARD_SUSPEND');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
b
DO $$ BEGIN
  CREATE TYPE "SuspensionStatus" AS ENUM ('ACTIVE', 'APPEALED', 'RESOLVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AppealStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'PENDING_MORE_INFO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'REVIEWING', 'RESOLVED', 'APPEALED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "DisputeDecision" AS ENUM ('FAVOR_CLIENT', 'FAVOR_FREELANCER', 'SPLIT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PayoutRequestStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "EscrowTransactionType" AS ENUM ('LOCK', 'PARTIAL_RELEASE', 'FULL_RELEASE', 'REFUND');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================================
-- 2) Extend existing enums
-- =============================================================================

ALTER TYPE "ContractStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_PENDING';
ALTER TYPE "ContractStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_FAILED';
ALTER TYPE "ContractStatus" ADD VALUE IF NOT EXISTS 'IN_REVIEW';

ALTER TYPE "PaymentIntentKind" ADD VALUE IF NOT EXISTS 'CONTRACT_ESCROW';
ALTER TYPE "PaymentIntentKind" ADD VALUE IF NOT EXISTS 'BOOST_PURCHASE';

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ESCROW_PAYMENT_REQUIRED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ESCROW_WORK_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ESCROW_RELEASED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PAYOUT_SENT';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'APPEAL_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'RECOMMENDATION_DIGEST';

-- =============================================================================
-- 3) Alter existing tables
-- =============================================================================

ALTER TABLE "Contract" ADD COLUMN IF NOT EXISTS "paymentStatus" "ContractPaymentStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "Contract" ADD COLUMN IF NOT EXISTS "escrowStatus" "EscrowStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "Contract" ADD COLUMN IF NOT EXISTS "escrowAmountCents" INTEGER;
ALTER TABLE "Contract" ADD COLUMN IF NOT EXISTS "escrowReleasedAt" TIMESTAMP(3);
ALTER TABLE "Contract" ADD COLUMN IF NOT EXISTS "workSubmittedAt" TIMESTAMP(3);
ALTER TABLE "Contract" ADD COLUMN IF NOT EXISTS "workReviewDeadline" TIMESTAMP(3);
ALTER TABLE "Contract" ADD COLUMN IF NOT EXISTS "paymentDueAt" TIMESTAMP(3);

ALTER TABLE "PaymentIntent" ADD COLUMN IF NOT EXISTS "contractId" TEXT;
ALTER TABLE "PaymentIntent" ADD COLUMN IF NOT EXISTS "stripeIntentId" VARCHAR(128);
ALTER TABLE "PaymentIntent" ADD COLUMN IF NOT EXISTS "midtransOrderId" VARCHAR(128);
ALTER TABLE "PaymentIntent" ADD COLUMN IF NOT EXISTS "idempotencyKey" VARCHAR(128);

CREATE UNIQUE INDEX IF NOT EXISTS "PaymentIntent_contractId_key" ON "PaymentIntent"("contractId");
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentIntent_stripeIntentId_key" ON "PaymentIntent"("stripeIntentId");
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentIntent_midtransOrderId_key" ON "PaymentIntent"("midtransOrderId");
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentIntent_idempotencyKey_key" ON "PaymentIntent"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "PaymentIntent_contractId_idx" ON "PaymentIntent"("contractId");

DO $$ BEGIN
  ALTER TABLE "PaymentIntent"
    ADD CONSTRAINT "PaymentIntent_contractId_fkey"
    FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================================
-- 4) New tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS "PaymentTransaction" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PaymentTransaction_contractId_idx" ON "PaymentTransaction"("contractId");
CREATE INDEX IF NOT EXISTS "PaymentTransaction_provider_providerTxnId_idx" ON "PaymentTransaction"("provider", "providerTxnId");
CREATE INDEX IF NOT EXISTS "PaymentTransaction_status_createdAt_idx" ON "PaymentTransaction"("status", "createdAt");

DO $$ BEGIN
  ALTER TABLE "PaymentTransaction"
    ADD CONSTRAINT "PaymentTransaction_contractId_fkey"
    FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "EscrowTransaction" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "type" "EscrowTransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT,
    "createdBy" VARCHAR(72),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EscrowTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "EscrowTransaction_contractId_idx" ON "EscrowTransaction"("contractId");
CREATE INDEX IF NOT EXISTS "EscrowTransaction_createdAt_idx" ON "EscrowTransaction"("createdAt");

DO $$ BEGIN
  ALTER TABLE "EscrowTransaction"
    ADD CONSTRAINT "EscrowTransaction_contractId_fkey"
    FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "ContractDispute" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContractDispute_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ContractDispute_contractId_key" ON "ContractDispute"("contractId");
CREATE INDEX IF NOT EXISTS "ContractDispute_status_createdAt_idx" ON "ContractDispute"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "ContractDispute_assignedToStaffUserId_idx" ON "ContractDispute"("assignedToStaffUserId");

DO $$ BEGIN
  ALTER TABLE "ContractDispute"
    ADD CONSTRAINT "ContractDispute_contractId_fkey"
    FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ContractDispute"
    ADD CONSTRAINT "ContractDispute_assignedToStaffUserId_fkey"
    FOREIGN KEY ("assignedToStaffUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "BoostProduct" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BoostProduct_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BoostProduct_code_key" ON "BoostProduct"("code");
CREATE INDEX IF NOT EXISTS "BoostProduct_isActive_type_idx" ON "BoostProduct"("isActive", "type");

CREATE TABLE IF NOT EXISTS "Boost" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Boost_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Boost_userId_idx" ON "Boost"("userId");
CREATE INDEX IF NOT EXISTS "Boost_expiresAt_idx" ON "Boost"("expiresAt");
CREATE INDEX IF NOT EXISTS "Boost_targetType_targetId_status_idx" ON "Boost"("targetType", "targetId", "status");

DO $$ BEGIN
  ALTER TABLE "Boost"
    ADD CONSTRAINT "Boost_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Boost"
    ADD CONSTRAINT "Boost_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "BoostProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "Recommendation" (
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

CREATE UNIQUE INDEX IF NOT EXISTS "Recommendation_freelancerId_jobId_key" ON "Recommendation"("freelancerId", "jobId");
CREATE INDEX IF NOT EXISTS "Recommendation_freelancerId_score_idx" ON "Recommendation"("freelancerId", "score");
CREATE INDEX IF NOT EXISTS "Recommendation_expiresAt_idx" ON "Recommendation"("expiresAt");

DO $$ BEGIN
  ALTER TABLE "Recommendation"
    ADD CONSTRAINT "Recommendation_freelancerId_fkey"
    FOREIGN KEY ("freelancerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Recommendation"
    ADD CONSTRAINT "Recommendation_jobId_fkey"
    FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "RecommendationMetric" (
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

CREATE UNIQUE INDEX IF NOT EXISTS "RecommendationMetric_date_key" ON "RecommendationMetric"("date");

CREATE TABLE IF NOT EXISTS "UserSuspension" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" "SuspensionLevel" NOT NULL,
    "reason" TEXT NOT NULL,
    "reportId" VARCHAR(72),
    "status" "SuspensionStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "appliedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserSuspension_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserSuspension_userId_key" ON "UserSuspension"("userId");
CREATE INDEX IF NOT EXISTS "UserSuspension_status_level_idx" ON "UserSuspension"("status", "level");

DO $$ BEGIN
  ALTER TABLE "UserSuspension"
    ADD CONSTRAINT "UserSuspension_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "UserSuspension"
    ADD CONSTRAINT "UserSuspension_appliedByUserId_fkey"
    FOREIGN KEY ("appliedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "SuspensionAppeal" (
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

CREATE UNIQUE INDEX IF NOT EXISTS "SuspensionAppeal_suspensionId_key" ON "SuspensionAppeal"("suspensionId");
CREATE INDEX IF NOT EXISTS "SuspensionAppeal_status_createdAt_idx" ON "SuspensionAppeal"("status", "createdAt");

DO $$ BEGIN
  ALTER TABLE "SuspensionAppeal"
    ADD CONSTRAINT "SuspensionAppeal_suspensionId_fkey"
    FOREIGN KEY ("suspensionId") REFERENCES "UserSuspension"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "SuspensionAppeal"
    ADD CONSTRAINT "SuspensionAppeal_reviewedByUserId_fkey"
    FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "BankAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bankCode" VARCHAR(32) NOT NULL,
    "bankName" VARCHAR(120) NOT NULL,
    "accountNumber" VARCHAR(64) NOT NULL,
    "accountName" VARCHAR(120) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BankAccount_userId_isDefault_idx" ON "BankAccount"("userId", "isDefault");

DO $$ BEGIN
  ALTER TABLE "BankAccount"
    ADD CONSTRAINT "BankAccount_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "FreelancerWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balanceCents" INTEGER NOT NULL DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'IDR',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FreelancerWallet_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "FreelancerWallet_userId_key" ON "FreelancerWallet"("userId");

DO $$ BEGIN
  ALTER TABLE "FreelancerWallet"
    ADD CONSTRAINT "FreelancerWallet_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "PayoutRequest" (
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

CREATE INDEX IF NOT EXISTS "PayoutRequest_userId_status_idx" ON "PayoutRequest"("userId", "status");
CREATE INDEX IF NOT EXISTS "PayoutRequest_status_requestedAt_idx" ON "PayoutRequest"("status", "requestedAt");

DO $$ BEGIN
  ALTER TABLE "PayoutRequest"
    ADD CONSTRAINT "PayoutRequest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "WebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" VARCHAR(32) NOT NULL,
    "externalId" VARCHAR(191) NOT NULL,
    "eventType" VARCHAR(128) NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WebhookEvent_provider_externalId_key" ON "WebhookEvent"("provider", "externalId");
CREATE INDEX IF NOT EXISTS "WebhookEvent_provider_eventType_idx" ON "WebhookEvent"("provider", "eventType");

CREATE TABLE IF NOT EXISTS "UserExperiment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "experimentKey" VARCHAR(64) NOT NULL,
    "variant" VARCHAR(32) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserExperiment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserExperiment_userId_experimentKey_key" ON "UserExperiment"("userId", "experimentKey");
CREATE INDEX IF NOT EXISTS "UserExperiment_experimentKey_variant_idx" ON "UserExperiment"("experimentKey", "variant");

-- =============================================================================
-- 5) Optional seed: BoostProduct catalog (id via cuid-like random; upsert by code)
-- =============================================================================

INSERT INTO "BoostProduct" ("id", "code", "name", "type", "durationDays", "priceCents", "currency", "isActive", "updatedAt")
VALUES
  ('bp_job_boost_7d', 'JOB_BOOST_7D', 'Job Boost (7 days)', 'JOB_BOOST', 7, 50000, 'IDR', true, CURRENT_TIMESTAMP),
  ('bp_client_job_boost_7d', 'CLIENT_JOB_BOOST_7D', 'Client Job Boost (7 days)', 'CLIENT_JOB_BOOST', 7, 75000, 'IDR', true, CURRENT_TIMESTAMP),
  ('bp_profile_featured_30d', 'PROFILE_FEATURED_30D', 'Featured Profile (30 days)', 'PROFILE_FEATURE', 30, 150000, 'IDR', true, CURRENT_TIMESTAMP),
  ('bp_top_freelancer_30d', 'TOP_FREELANCER_30D', 'Top Freelancer Badge (30 days)', 'TOP_FREELANCER_BADGE', 30, 300000, 'IDR', true, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "priceCents" = EXCLUDED."priceCents",
  "durationDays" = EXCLUDED."durationDays",
  "isActive" = true,
  "updatedAt" = CURRENT_TIMESTAMP;
