-- CreateEnum
CREATE TYPE "PaymentIntentKind" AS ENUM ('SUBSCRIPTION_PLAN', 'JOB_FEATURED', 'FREELANCER_BOOST');

-- CreateEnum
CREATE TYPE "PaymentIntentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateTable
CREATE TABLE "PaymentIntent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "PaymentIntentKind" NOT NULL,
    "status" "PaymentIntentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" VARCHAR(32) NOT NULL DEFAULT 'MOCK',
    "currency" VARCHAR(3) NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "checkoutUrl" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentIntent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentIntent_userId_status_idx" ON "PaymentIntent"("userId", "status");

-- CreateIndex
CREATE INDEX "PaymentIntent_status_createdAt_idx" ON "PaymentIntent"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
