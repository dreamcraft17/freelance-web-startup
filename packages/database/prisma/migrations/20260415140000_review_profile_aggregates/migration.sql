-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN "reviewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ClientProfile" ADD COLUMN "averageReviewRating" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "FreelancerProfile" ADD COLUMN "reviewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "FreelancerProfile" ADD COLUMN "averageReviewRating" DOUBLE PRECISION;
