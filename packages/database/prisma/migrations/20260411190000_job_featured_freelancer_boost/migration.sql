-- Job: featured listing (optional expiry)
ALTER TABLE "Job" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Job" ADD COLUMN "featuredUntil" TIMESTAMP(3);

CREATE INDEX "Job_isFeatured_featuredUntil_status_deletedAt_idx" ON "Job"("isFeatured", "featuredUntil", "status", "deletedAt");

-- FreelancerProfile: search boost (optional expiry)
ALTER TABLE "FreelancerProfile" ADD COLUMN "isBoosted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "FreelancerProfile" ADD COLUMN "boostedUntil" TIMESTAMP(3);

CREATE INDEX "FreelancerProfile_isBoosted_boostedUntil_deletedAt_idx" ON "FreelancerProfile"("isBoosted", "boostedUntil", "deletedAt");
