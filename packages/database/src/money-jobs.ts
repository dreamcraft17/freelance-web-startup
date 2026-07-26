import type { Prisma } from "@prisma/client";
import {
  BoostStatus,
  BoostTargetType,
  ContractStatus,
  EscrowStatus,
  EscrowTransactionType,
  PayoutRequestStatus
} from "@prisma/client";
import { db } from "./client";
import { notifyEscrowReleased, notifyPayoutSent } from "./money-notifications";

/** Local copy of V2 escrow timing/rates — keep in sync with @acme/config V2_PRICING. */
const ESCROW = {
  workReviewDays: 5,
  chargebackHoldDays: 7,
  partialReleaseRate: 0.8
} as const;
function addDays(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

async function releasePartialEscrow(contractId: string, actorUserId: string, reason: string) {
  const row = await db.contract.findFirst({
    where: { id: contractId, deletedAt: null }
  });
  if (!row) return;

  const amount = row.escrowAmountCents ?? 0;
  const releaseAmount = Math.round(amount * ESCROW.partialReleaseRate);
  const holdback = amount - releaseAmount;

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.contract.update({
      where: { id: contractId },
      data: {
        status: ContractStatus.COMPLETED,
        escrowStatus: EscrowStatus.PARTIAL_RELEASED
      }
    });
    await tx.escrowTransaction.create({
      data: {
        contractId,
        type: EscrowTransactionType.PARTIAL_RELEASE,
        amount: releaseAmount,
        reason,
        createdBy: actorUserId
      }
    });
    await tx.freelancerWallet.upsert({
      where: { userId: row.freelancerUserId },
      create: {
        userId: row.freelancerUserId,
        balanceCents: releaseAmount,
        currency: row.currency ?? "IDR"
      },
      update: { balanceCents: { increment: releaseAmount } }
    });
    if (holdback > 0) {
      await tx.escrowTransaction.create({
        data: {
          contractId,
          type: EscrowTransactionType.LOCK,
          amount: holdback,
          reason: `Holdback ${ESCROW.chargebackHoldDays}d chargeback protection`,
          createdBy: "system"
        }
      });
    }
  });

  await notifyEscrowReleased(row.freelancerUserId, contractId, releaseAmount);
  await db.auditLog.create({
    data: {
      actorId: actorUserId === "system" ? null : actorUserId,
      action: "ESCROW_RELEASED",
      targetType: "Contract",
      targetId: contractId,
      metadata: { releasedCents: releaseAmount, holdbackCents: holdback, reason } as object
    }
  });
}

/** Canonical escrow auto-release (5d review + 7d holdback). Used by EscrowService + worker. */
export async function processEscrowAutoReleases(): Promise<{ processed: number }> {
  const now = new Date();

  const staleReview = await db.contract.findMany({
    where: {
      status: ContractStatus.IN_REVIEW,
      workReviewDeadline: { lte: now },
      escrowStatus: EscrowStatus.LOCKED,
      deletedAt: null
    },
    take: 50
  });

  for (const c of staleReview) {
    await releasePartialEscrow(c.id, "system", "Auto-release after review window");
  }

  const partial = await db.contract.findMany({
    where: {
      escrowStatus: EscrowStatus.PARTIAL_RELEASED,
      escrowReleasedAt: null,
      workSubmittedAt: {
        lte: addDays(now, -(ESCROW.workReviewDays + ESCROW.chargebackHoldDays))
      },
      deletedAt: null
    },
    take: 50
  });

  for (const c of partial) {
    const holdbackTx = await db.escrowTransaction.findFirst({
      where: { contractId: c.id, type: EscrowTransactionType.LOCK },
      orderBy: { createdAt: "desc" }
    });
    const holdback = holdbackTx?.amount ?? 0;
    if (holdback > 0) {
      await db.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.escrowTransaction.create({
          data: {
            contractId: c.id,
            type: EscrowTransactionType.FULL_RELEASE,
            amount: holdback,
            reason: "Holdback released after chargeback window",
            createdBy: "system"
          }
        });
        await tx.contract.update({
          where: { id: c.id },
          data: { escrowStatus: EscrowStatus.FULLY_RELEASED, escrowReleasedAt: now }
        });
        await tx.freelancerWallet.upsert({
          where: { userId: c.freelancerUserId },
          create: {
            userId: c.freelancerUserId,
            balanceCents: holdback,
            currency: c.currency ?? "IDR"
          },
          update: { balanceCents: { increment: holdback } }
        });
      });
    }
  }

  return { processed: staleReview.length + partial.length };
}

/** Canonical boost expiry (jobs + profiles). Used by BoostService + worker. */
export async function expireStaleBoosts(): Promise<{
  jobs: number;
  profiles: number;
  boosts: number;
}> {
  const now = new Date();
  const expired = await db.boost.findMany({
    where: { status: BoostStatus.ACTIVE, expiresAt: { lte: now } },
    take: 200
  });

  let jobs = 0;
  let profiles = 0;

  for (const b of expired) {
    await db.boost.update({
      where: { id: b.id },
      data: { status: BoostStatus.EXPIRED, expiredAt: now }
    });
    if (b.targetType === BoostTargetType.JOB) {
      const stillActive = await db.boost.count({
        where: {
          targetType: BoostTargetType.JOB,
          targetId: b.targetId,
          status: BoostStatus.ACTIVE,
          expiresAt: { gt: now }
        }
      });
      if (stillActive === 0) {
        await db.job.update({
          where: { id: b.targetId },
          data: { isFeatured: false, featuredUntil: null }
        });
        jobs++;
      }
    } else {
      const stillActive = await db.boost.count({
        where: {
          targetType: BoostTargetType.PROFILE,
          targetId: b.targetId,
          status: BoostStatus.ACTIVE,
          expiresAt: { gt: now }
        }
      });
      if (stillActive === 0) {
        await db.freelancerProfile.update({
          where: { id: b.targetId },
          data: { isBoosted: false, boostedUntil: null }
        });
        profiles++;
      }
    }
  }

  return { jobs, profiles, boosts: expired.length };
}

/**
 * Process payouts that admins moved to PROCESSING (approval gate).
 * PENDING requests stay queued until staff approval.
 */
export async function processBatchPayouts(): Promise<{ processed: number; failed: number }> {
  const pending = await db.payoutRequest.findMany({
    where: {
      status: PayoutRequestStatus.PROCESSING,
      requestedAt: { lte: new Date() }
    },
    take: 100
  });

  let processed = 0;
  let failed = 0;

  for (const p of pending) {
    try {
      await db.payoutRequest.update({
        where: { id: p.id },
        data: {
          status: PayoutRequestStatus.SENT,
          sentAt: new Date(),
          processedAt: new Date(),
          receiptId: `MOCK-${p.id.slice(0, 8)}`
        }
      });
      await notifyPayoutSent(p.userId, p.id, p.amountCents);
      await db.auditLog.create({
        data: {
          actorId: null,
          action: "PAYOUT_SENT",
          targetType: "PayoutRequest",
          targetId: p.id,
          metadata: { amountCents: p.amountCents, userId: p.userId } as object
        }
      });
      processed++;
    } catch {
      failed++;
      await db.payoutRequest.update({
        where: { id: p.id },
        data: {
          retryCount: { increment: 1 },
          lastError: "Batch payout failed",
          status: p.retryCount >= 2 ? PayoutRequestStatus.FAILED : p.status
        }
      });
    }
  }

  return { processed, failed };
}

/** Compare recent PaymentTransaction charges against WebhookEvent ledger. */
export async function runPaymentReconciliation(lookbackHours = 72) {
  const since = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);

  const [transactions, webhooks] = await Promise.all([
    db.paymentTransaction.findMany({
      where: {
        status: "SUCCEEDED",
        createdAt: { gte: since }
      },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: {
        id: true,
        contractId: true,
        type: true,
        amount: true,
        currency: true,
        provider: true,
        providerTxnId: true,
        createdAt: true
      }
    }),
    db.webhookEvent.findMany({
      where: { processedAt: { gte: since } },
      orderBy: { processedAt: "desc" },
      take: 500,
      select: {
        id: true,
        provider: true,
        externalId: true,
        eventType: true,
        processedAt: true
      }
    })
  ]);

  const webhookKeys = new Set(webhooks.map((w) => `${w.provider}:${w.externalId}`));
  const txnProviderIds = new Set(
    transactions.filter((t) => t.type === "CHARGE").map((t) => `${t.provider}:${t.providerTxnId}`)
  );

  const chargesWithoutWebhook = transactions.filter(
    (t) => t.type === "CHARGE" && !webhookKeys.has(`${t.provider}:${t.providerTxnId}`)
  );
  const webhooksWithoutTransaction = webhooks.filter(
    (w) => !txnProviderIds.has(`${w.provider}:${w.externalId}`)
  );

  return {
    lookbackHours,
    since: since.toISOString(),
    transactionCount: transactions.length,
    webhookCount: webhooks.length,
    mismatchCount: chargesWithoutWebhook.length + webhooksWithoutTransaction.length,
    chargesWithoutWebhook: chargesWithoutWebhook.map((t) => ({
      id: t.id,
      contractId: t.contractId,
      provider: t.provider,
      providerTxnId: t.providerTxnId,
      amount: t.amount,
      currency: t.currency,
      createdAt: t.createdAt.toISOString()
    })),
    webhooksWithoutTransaction: webhooksWithoutTransaction.map((w) => ({
      id: w.id,
      provider: w.provider,
      externalId: w.externalId,
      eventType: w.eventType,
      processedAt: w.processedAt.toISOString()
    }))
  };
}
