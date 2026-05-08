-- CreateEnum
CREATE TYPE "ModerationReportStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ModerationReportSubjectType" AS ENUM ('USER', 'JOB', 'BID', 'REVIEW', 'MESSAGE_THREAD', 'MESSAGE');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN "moderationHiddenAt" TIMESTAMP(3),
ADD COLUMN "moderationHiddenReason" TEXT,
ADD COLUMN "moderationHiddenByUserId" TEXT;

-- CreateIndex
CREATE INDEX "Job_moderationHiddenAt_idx" ON "Job"("moderationHiddenAt");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_moderationHiddenByUserId_fkey" FOREIGN KEY ("moderationHiddenByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "ModerationReport" (
    "id" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "subjectType" "ModerationReportSubjectType" NOT NULL,
    "subjectUserId" TEXT,
    "subjectJobId" TEXT,
    "subjectBidId" TEXT,
    "subjectReviewId" TEXT,
    "subjectThreadId" TEXT,
    "subjectMessageId" TEXT,
    "category" VARCHAR(96) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ModerationReportStatus" NOT NULL DEFAULT 'OPEN',
    "assignedToStaffUserId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "resolutionSummary" TEXT,
    "statusUpdatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModerationReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationReportNote" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "authorStaffUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationReportNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModerationReport_status_createdAt_idx" ON "ModerationReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ModerationReport_subjectType_idx" ON "ModerationReport"("subjectType");

-- CreateIndex
CREATE INDEX "ModerationReport_assignedToStaffUserId_idx" ON "ModerationReport"("assignedToStaffUserId");

-- CreateIndex
CREATE INDEX "ModerationReport_reporterUserId_createdAt_idx" ON "ModerationReport"("reporterUserId", "createdAt");

-- CreateIndex
CREATE INDEX "ModerationReportNote_reportId_createdAt_idx" ON "ModerationReportNote"("reportId", "createdAt");

-- AddForeignKey
ALTER TABLE "ModerationReport" ADD CONSTRAINT "ModerationReport_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationReport" ADD CONSTRAINT "ModerationReport_assignedToStaffUserId_fkey" FOREIGN KEY ("assignedToStaffUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationReport" ADD CONSTRAINT "ModerationReport_statusUpdatedByUserId_fkey" FOREIGN KEY ("statusUpdatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationReportNote" ADD CONSTRAINT "ModerationReportNote_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ModerationReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationReportNote" ADD CONSTRAINT "ModerationReportNote_authorStaffUserId_fkey" FOREIGN KEY ("authorStaffUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
