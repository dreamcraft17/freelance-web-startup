-- Phase 4 residual: job view counts + message attachment metadata
ALTER TABLE "Job" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Message" ADD COLUMN "metadata" JSONB;
