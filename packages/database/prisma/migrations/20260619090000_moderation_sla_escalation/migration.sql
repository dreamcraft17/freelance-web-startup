CREATE TYPE "ModerationReportPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

ALTER TABLE "ModerationReport"
  ADD COLUMN "subjectKey" VARCHAR(191),
  ADD COLUMN "priority" "ModerationReportPriority" NOT NULL DEFAULT 'NORMAL',
  ADD COLUMN "slaDueAt" TIMESTAMP(3),
  ADD COLUMN "escalatedAt" TIMESTAMP(3),
  ADD COLUMN "escalationLevel" INTEGER NOT NULL DEFAULT 0;

UPDATE "ModerationReport"
SET
  "subjectKey" = COALESCE(
    "subjectUserId", "subjectJobId", "subjectBidId", "subjectReviewId", "subjectThreadId", "subjectMessageId"
  ),
  "priority" = CASE
    WHEN "category" IN ('scam', 'harassment') THEN 'URGENT'::"ModerationReportPriority"
    WHEN "category" IN ('policy', 'ip') THEN 'HIGH'::"ModerationReportPriority"
    WHEN "category" = 'other' THEN 'LOW'::"ModerationReportPriority"
    ELSE 'NORMAL'::"ModerationReportPriority"
  END,
  "slaDueAt" = "createdAt" + CASE
    WHEN "category" IN ('scam', 'harassment') THEN INTERVAL '4 hours'
    WHEN "category" = 'policy' THEN INTERVAL '12 hours'
    WHEN "category" = 'other' THEN INTERVAL '48 hours'
    ELSE INTERVAL '24 hours'
  END;

ALTER TABLE "ModerationReport"
  ALTER COLUMN "subjectKey" SET NOT NULL,
  ALTER COLUMN "slaDueAt" SET NOT NULL;

CREATE INDEX "ModerationReport_status_slaDueAt_idx"
  ON "ModerationReport"("status", "slaDueAt");
CREATE INDEX "ModerationReport_priority_status_createdAt_idx"
  ON "ModerationReport"("priority", "status", "createdAt");

-- Preserve the oldest active ticket and close legacy duplicates before enforcing
-- the invariant. The rows remain available for staff audit/history.
WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (
    PARTITION BY "reporterUserId", "subjectType", "subjectKey"
    ORDER BY "createdAt" ASC, "id" ASC
  ) AS duplicate_rank
  FROM "ModerationReport"
  WHERE "status" IN ('OPEN', 'IN_REVIEW')
)
UPDATE "ModerationReport" AS report
SET
  "status" = 'DISMISSED',
  "dismissedAt" = NOW(),
  "resolutionSummary" = COALESCE(report."resolutionSummary", 'Closed as a legacy duplicate during SLA migration.')
FROM ranked
WHERE report."id" = ranked."id" AND ranked.duplicate_rank > 1;

CREATE UNIQUE INDEX "ModerationReport_active_reporter_subject_key"
  ON "ModerationReport"("reporterUserId", "subjectType", "subjectKey")
  WHERE "status" IN ('OPEN', 'IN_REVIEW');
