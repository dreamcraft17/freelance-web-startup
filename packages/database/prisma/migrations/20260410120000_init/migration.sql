-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CLIENT', 'FREELANCER', 'AGENCY_OWNER', 'AGENCY_MANAGER', 'AGENCY_MEMBER', 'SUPPORT_ADMIN', 'FINANCE_ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'BANNED', 'DELETED');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('REMOTE', 'ONSITE', 'HYBRID');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'LIMITED', 'UNAVAILABLE', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NOT_VERIFIED', 'PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'OPEN', 'IN_REVIEW', 'PAUSED', 'CLOSED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "JobVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'INVITE_ONLY');

-- CreateEnum
CREATE TYPE "BudgetType" AS ENUM ('FIXED', 'HOURLY', 'RANGE', 'REQUEST_QUOTE');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('PENDING', 'ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BID_SUBMITTED', 'BID_SHORTLISTED', 'BID_ACCEPTED', 'CONTRACT_STARTED', 'NEW_MESSAGE', 'REVIEW_RECEIVED', 'VERIFICATION_UPDATED', 'BILLING_UPDATED', 'ADMIN_MODERATION_EVENT');

-- CreateEnum
CREATE TYPE "MessageThreadType" AS ENUM ('DIRECT', 'JOB', 'CONTRACT');

-- CreateEnum
CREATE TYPE "ReviewTargetType" AS ENUM ('CLIENT', 'FREELANCER');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('IDENTITY', 'BUSINESS', 'ADDRESS', 'CERTIFICATION', 'PAYMENT_METHOD');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelancerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "hourlyRate" DECIMAL(12,2),
    "fixedStartingPrice" DECIMAL(12,2),
    "workMode" "WorkMode" NOT NULL DEFAULT 'REMOTE',
    "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "serviceRadiusKm" INTEGER,
    "yearsExperience" INTEGER,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
    "profileCompleteness" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FreelancerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "companyName" TEXT,
    "industry" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subcategory" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "metadataSchema" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT,
    "subcategoryId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelancerSkill" (
    "id" TEXT NOT NULL,
    "freelancerProfileId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "years" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreelancerSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budgetType" "BudgetType" NOT NULL,
    "budgetMin" DECIMAL(12,2),
    "budgetMax" DECIMAL(12,2),
    "currency" VARCHAR(3) NOT NULL,
    "workMode" "WorkMode" NOT NULL,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "onsiteAddress" TEXT,
    "bidDeadline" TIMESTAMP(3),
    "visibility" "JobVisibility" NOT NULL DEFAULT 'PUBLIC',
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "requiredVerification" "VerificationStatus",
    "portfolioRequired" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSkill" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobAttachment" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "JobAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "status" "BidStatus" NOT NULL DEFAULT 'SUBMITTED',
    "bidAmount" DECIMAL(12,2) NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "estimatedDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "bidId" TEXT NOT NULL,
    "freelancerUserId" TEXT NOT NULL,
    "clientUserId" TEXT NOT NULL,
    "amount" DECIMAL(12,2),
    "currency" VARCHAR(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "ContractStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "entitlements" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "snapshot" JSONB NOT NULL,
    "externalSubscriptionId" TEXT,
    "externalCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "targetType" "ReviewTargetType" NOT NULL,
    "targetClientUserId" TEXT,
    "targetFreelancerUserId" TEXT,
    "targetClientProfileId" TEXT,
    "targetFreelancerProfileId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioItem" (
    "id" TEXT NOT NULL,
    "freelancerProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mediaUrl" TEXT NOT NULL,
    "mediaType" VARCHAR(64),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PortfolioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "VerificationType" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "evidence" JSONB,
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedFreelancer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "freelancerProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedFreelancer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageThread" (
    "id" TEXT NOT NULL,
    "type" "MessageThreadType" NOT NULL,
    "jobId" TEXT,
    "contractId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "payload" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dismissedAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_accountStatus_idx" ON "User"("role", "accountStatus");

-- CreateIndex
CREATE INDEX "User_email_deletedAt_idx" ON "User"("email", "deletedAt");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FreelancerProfile_userId_key" ON "FreelancerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FreelancerProfile_username_key" ON "FreelancerProfile"("username");

-- CreateIndex
CREATE INDEX "FreelancerProfile_userId_deletedAt_idx" ON "FreelancerProfile"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "FreelancerProfile_username_deletedAt_idx" ON "FreelancerProfile"("username", "deletedAt");

-- CreateIndex
CREATE INDEX "FreelancerProfile_city_country_deletedAt_idx" ON "FreelancerProfile"("city", "country", "deletedAt");

-- CreateIndex
CREATE INDEX "FreelancerProfile_workMode_availabilityStatus_deletedAt_idx" ON "FreelancerProfile"("workMode", "availabilityStatus", "deletedAt");

-- CreateIndex
CREATE INDEX "FreelancerProfile_lat_lng_idx" ON "FreelancerProfile"("lat", "lng");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");

-- CreateIndex
CREATE INDEX "ClientProfile_userId_deletedAt_idx" ON "ClientProfile"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "ClientProfile_displayName_idx" ON "ClientProfile"("displayName");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_isActive_displayOrder_idx" ON "Category"("isActive", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_slug_key" ON "Subcategory"("slug");

-- CreateIndex
CREATE INDEX "Subcategory_categoryId_isActive_idx" ON "Subcategory"("categoryId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

-- CreateIndex
CREATE INDEX "Skill_categoryId_subcategoryId_idx" ON "Skill"("categoryId", "subcategoryId");

-- CreateIndex
CREATE INDEX "Skill_isActive_idx" ON "Skill"("isActive");

-- CreateIndex
CREATE INDEX "FreelancerSkill_skillId_idx" ON "FreelancerSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "FreelancerSkill_freelancerProfileId_skillId_key" ON "FreelancerSkill"("freelancerProfileId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");

-- CreateIndex
CREATE INDEX "Job_clientProfileId_status_deletedAt_idx" ON "Job"("clientProfileId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "Job_categoryId_subcategoryId_idx" ON "Job"("categoryId", "subcategoryId");

-- CreateIndex
CREATE INDEX "Job_workMode_city_country_deletedAt_idx" ON "Job"("workMode", "city", "country", "deletedAt");

-- CreateIndex
CREATE INDEX "Job_status_bidDeadline_idx" ON "Job"("status", "bidDeadline");

-- CreateIndex
CREATE INDEX "Job_visibility_status_idx" ON "Job"("visibility", "status");

-- CreateIndex
CREATE INDEX "Job_createdAt_idx" ON "Job"("createdAt");

-- CreateIndex
CREATE INDEX "JobSkill_skillId_idx" ON "JobSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "JobSkill_jobId_skillId_key" ON "JobSkill"("jobId", "skillId");

-- CreateIndex
CREATE INDEX "JobAttachment_jobId_deletedAt_idx" ON "JobAttachment"("jobId", "deletedAt");

-- CreateIndex
CREATE INDEX "Bid_freelancerId_status_idx" ON "Bid"("freelancerId", "status");

-- CreateIndex
CREATE INDEX "Bid_jobId_status_idx" ON "Bid"("jobId", "status");

-- CreateIndex
CREATE INDEX "Bid_createdAt_idx" ON "Bid"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Bid_jobId_freelancerId_key" ON "Bid"("jobId", "freelancerId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_bidId_key" ON "Contract"("bidId");

-- CreateIndex
CREATE INDEX "Contract_freelancerUserId_status_deletedAt_idx" ON "Contract"("freelancerUserId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "Contract_clientUserId_status_deletedAt_idx" ON "Contract"("clientUserId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "Contract_status_createdAt_idx" ON "Contract"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_code_key" ON "SubscriptionPlan"("code");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_isActive_code_idx" ON "SubscriptionPlan"("isActive", "code");

-- CreateIndex
CREATE INDEX "UserSubscription_userId_status_idx" ON "UserSubscription"("userId", "status");

-- CreateIndex
CREATE INDEX "UserSubscription_planId_idx" ON "UserSubscription"("planId");

-- CreateIndex
CREATE INDEX "UserSubscription_externalSubscriptionId_idx" ON "UserSubscription"("externalSubscriptionId");

-- CreateIndex
CREATE INDEX "UserSubscription_currentPeriodEnd_idx" ON "UserSubscription"("currentPeriodEnd");

-- CreateIndex
CREATE INDEX "Review_contractId_idx" ON "Review"("contractId");

-- CreateIndex
CREATE INDEX "Review_targetFreelancerProfileId_idx" ON "Review"("targetFreelancerProfileId");

-- CreateIndex
CREATE INDEX "Review_targetClientProfileId_idx" ON "Review"("targetClientProfileId");

-- CreateIndex
CREATE INDEX "Review_rating_createdAt_idx" ON "Review"("rating", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_contractId_authorUserId_targetType_key" ON "Review"("contractId", "authorUserId", "targetType");

-- CreateIndex
CREATE INDEX "PortfolioItem_freelancerProfileId_deletedAt_displayOrder_idx" ON "PortfolioItem"("freelancerProfileId", "deletedAt", "displayOrder");

-- CreateIndex
CREATE INDEX "VerificationRequest_userId_status_idx" ON "VerificationRequest"("userId", "status");

-- CreateIndex
CREATE INDEX "VerificationRequest_type_status_createdAt_idx" ON "VerificationRequest"("type", "status", "createdAt");

-- CreateIndex
CREATE INDEX "VerificationRequest_reviewedByUserId_idx" ON "VerificationRequest"("reviewedByUserId");

-- CreateIndex
CREATE INDEX "SavedJob_userId_createdAt_idx" ON "SavedJob"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SavedJob_userId_jobId_key" ON "SavedJob"("userId", "jobId");

-- CreateIndex
CREATE INDEX "SavedFreelancer_userId_createdAt_idx" ON "SavedFreelancer"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SavedFreelancer_userId_freelancerProfileId_key" ON "SavedFreelancer"("userId", "freelancerProfileId");

-- CreateIndex
CREATE INDEX "MessageThread_type_updatedAt_idx" ON "MessageThread"("type", "updatedAt");

-- CreateIndex
CREATE INDEX "MessageThread_jobId_idx" ON "MessageThread"("jobId");

-- CreateIndex
CREATE INDEX "MessageThread_contractId_idx" ON "MessageThread"("contractId");

-- CreateIndex
CREATE INDEX "Message_threadId_createdAt_idx" ON "Message"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_deletedAt_idx" ON "Message"("deletedAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_dismissedAt_idx" ON "Notification"("userId", "dismissedAt");

-- CreateIndex
CREATE INDEX "Notification_type_createdAt_idx" ON "Notification"("type", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_createdAt_idx" ON "AuditLog"("targetType", "targetId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "FreelancerProfile" ADD CONSTRAINT "FreelancerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelancerSkill" ADD CONSTRAINT "FreelancerSkill_freelancerProfileId_fkey" FOREIGN KEY ("freelancerProfileId") REFERENCES "FreelancerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelancerSkill" ADD CONSTRAINT "FreelancerSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAttachment" ADD CONSTRAINT "JobAttachment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "FreelancerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_freelancerUserId_fkey" FOREIGN KEY ("freelancerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_targetClientUserId_fkey" FOREIGN KEY ("targetClientUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_targetFreelancerUserId_fkey" FOREIGN KEY ("targetFreelancerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_targetClientProfileId_fkey" FOREIGN KEY ("targetClientProfileId") REFERENCES "ClientProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_targetFreelancerProfileId_fkey" FOREIGN KEY ("targetFreelancerProfileId") REFERENCES "FreelancerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioItem" ADD CONSTRAINT "PortfolioItem_freelancerProfileId_fkey" FOREIGN KEY ("freelancerProfileId") REFERENCES "FreelancerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedFreelancer" ADD CONSTRAINT "SavedFreelancer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedFreelancer" ADD CONSTRAINT "SavedFreelancer_freelancerProfileId_fkey" FOREIGN KEY ("freelancerProfileId") REFERENCES "FreelancerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "MessageThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
