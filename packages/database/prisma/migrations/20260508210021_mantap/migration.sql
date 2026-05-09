-- DropIndex
DROP INDEX "FreelancerProfile_isBoosted_boostedUntil_deletedAt_idx";

-- DropIndex
DROP INDEX "Job_isFeatured_featuredUntil_status_deletedAt_idx";

-- CreateIndex
CREATE INDEX "Contract_clientUserId_deletedAt_updatedAt_idx" ON "Contract"("clientUserId", "deletedAt", "updatedAt");

-- CreateIndex
CREATE INDEX "Contract_freelancerUserId_deletedAt_updatedAt_idx" ON "Contract"("freelancerUserId", "deletedAt", "updatedAt");

-- CreateIndex
CREATE INDEX "FreelancerProfile_deletedAt_workMode_createdAt_idx" ON "FreelancerProfile"("deletedAt", "workMode", "createdAt");

-- CreateIndex
CREATE INDEX "FreelancerProfile_deletedAt_isBoosted_boostedUntil_createdA_idx" ON "FreelancerProfile"("deletedAt", "isBoosted", "boostedUntil", "createdAt");

-- CreateIndex
CREATE INDEX "FreelancerProfile_deletedAt_isFeatured_createdAt_idx" ON "FreelancerProfile"("deletedAt", "isFeatured", "createdAt");

-- CreateIndex
CREATE INDEX "Job_deletedAt_status_visibility_createdAt_idx" ON "Job"("deletedAt", "status", "visibility", "createdAt");

-- CreateIndex
CREATE INDEX "Job_clientProfileId_deletedAt_updatedAt_idx" ON "Job"("clientProfileId", "deletedAt", "updatedAt");

-- CreateIndex
CREATE INDEX "Message_threadId_deletedAt_createdAt_idx" ON "Message"("threadId", "deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "MessageThreadParticipant_userId_threadId_idx" ON "MessageThreadParticipant"("userId", "threadId");
