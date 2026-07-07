import { V2_PRICING } from "@acme/config";
import {
  AccountStatus,
  AppealStatus,
  PayoutRequestStatus,
  SuspensionLevel,
  SuspensionStatus,
  db
} from "@acme/database";
import { DomainError, NotFoundError, PolicyDeniedError } from "../errors/domain-errors";

export class SuspensionAppealService {
  async applySuspension(input: {
    userId: string;
    level: SuspensionLevel;
    reason: string;
    appliedByUserId: string;
    reportId?: string;
    expiresAt?: Date;
  }) {
    await db.userSuspension.upsert({
      where: { userId: input.userId },
      create: {
        userId: input.userId,
        level: input.level,
        reason: input.reason,
        reportId: input.reportId,
        status: SuspensionStatus.ACTIVE,
        expiresAt: input.expiresAt,
        appliedByUserId: input.appliedByUserId
      },
      update: {
        level: input.level,
        reason: input.reason,
        status: SuspensionStatus.ACTIVE,
        expiresAt: input.expiresAt,
        appliedByUserId: input.appliedByUserId
      }
    });

    if (input.level !== SuspensionLevel.WARNING) {
      await db.user.update({
        where: { id: input.userId },
        data: { accountStatus: AccountStatus.SUSPENDED }
      });
    }
  }

  async submitAppeal(userId: string, input: { appealReason: string; evidence: string[] }) {
    const suspension = await db.userSuspension.findUnique({
      where: { userId },
      include: { appeal: true }
    });
    if (!suspension) {
      throw new NotFoundError("No active suspension found for this account");
    }
    if (suspension.appeal) {
      throw new DomainError("An appeal is already pending", "APPEAL_ALREADY_EXISTS", 409);
    }
    if (suspension.level === SuspensionLevel.WARNING) {
      throw new DomainError("Warnings cannot be appealed", "APPEAL_NOT_ALLOWED", 400);
    }

    const appeal = await db.suspensionAppeal.create({
      data: {
        suspensionId: suspension.id,
        appealReason: input.appealReason,
        evidence: input.evidence,
        status: AppealStatus.PENDING
      }
    });

    await db.userSuspension.update({
      where: { id: suspension.id },
      data: { status: SuspensionStatus.APPEALED }
    });

    return appeal;
  }

  async listAppealsForAdmin(status?: AppealStatus) {
    return db.suspensionAppeal.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "asc" },
      include: {
        suspension: {
          include: {
            user: { select: { id: true, email: true, role: true } }
          }
        }
      },
      take: 100
    });
  }

  async reviewAppeal(
    appealId: string,
    reviewerUserId: string,
    input: { status: "APPROVED" | "DENIED" | "PENDING_MORE_INFO"; decisionNote?: string }
  ) {
    const appeal = await db.suspensionAppeal.findUnique({
      where: { id: appealId },
      include: { suspension: true }
    });
    if (!appeal) throw new NotFoundError("Appeal not found");

    const now = new Date();
    await db.suspensionAppeal.update({
      where: { id: appealId },
      data: {
        status: input.status as AppealStatus,
        reviewedByUserId: reviewerUserId,
        decision: input.status,
        decisionNote: input.decisionNote,
        decidedAt: now
      }
    });

    if (input.status === "APPROVED") {
      await db.userSuspension.update({
        where: { id: appeal.suspensionId },
        data: { status: SuspensionStatus.RESOLVED }
      });
      await db.user.update({
        where: { id: appeal.suspension.userId },
        data: { accountStatus: AccountStatus.ACTIVE }
      });
    } else if (input.status === "DENIED") {
      await db.userSuspension.update({
        where: { id: appeal.suspensionId },
        data: { status: SuspensionStatus.ACTIVE }
      });
    }

    return { appealId, status: input.status };
  }
}

export class PayoutService {
  async getWallet(userId: string) {
    const wallet = await db.freelancerWallet.findUnique({ where: { userId } });
    const pending = await db.payoutRequest.count({
      where: { userId, status: { in: [PayoutRequestStatus.PENDING, PayoutRequestStatus.PROCESSING] } }
    });
    return {
      balanceCents: wallet?.balanceCents ?? 0,
      currency: wallet?.currency ?? "IDR",
      pendingPayouts: pending
    };
  }

  async requestPayout(userId: string, input: { amountCents: number; bankAccountId?: string }) {
    if (input.amountCents < V2_PRICING.payoutMinimumIdrCents) {
      throw new DomainError(
        `Minimum payout is ${V2_PRICING.payoutMinimumIdrCents} cents`,
        "PAYOUT_BELOW_MINIMUM",
        400
      );
    }

    const wallet = await db.freelancerWallet.findUnique({ where: { userId } });
    if (!wallet || wallet.balanceCents < input.amountCents) {
      throw new PolicyDeniedError("Insufficient wallet balance");
    }

    const feeCents = Math.round(input.amountCents * V2_PRICING.payoutFeeRate);

    const payout = await db.$transaction(async (tx) => {
      await tx.freelancerWallet.update({
        where: { userId },
        data: { balanceCents: { decrement: input.amountCents } }
      });
      return tx.payoutRequest.create({
        data: {
          userId,
          amountCents: input.amountCents - feeCents,
          feeCents,
          bankAccountId: input.bankAccountId,
          status: PayoutRequestStatus.PENDING
        }
      });
    });

    return payout;
  }

  async processBatchPayouts(): Promise<{ processed: number; failed: number }> {
    const pending = await db.payoutRequest.findMany({
      where: { status: PayoutRequestStatus.PENDING, requestedAt: { lte: new Date() } },
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
        processed++;
      } catch {
        failed++;
        await db.payoutRequest.update({
          where: { id: p.id },
          data: {
            retryCount: { increment: 1 },
            lastError: "Batch payout failed",
            status: p.retryCount >= 2 ? PayoutRequestStatus.FAILED : PayoutRequestStatus.PENDING
          }
        });
      }
    }

    return { processed, failed };
  }

  async addBankAccount(
    userId: string,
    input: {
      bankCode: string;
      bankName: string;
      accountNumber: string;
      accountName: string;
      isDefault?: boolean;
    }
  ) {
    if (input.isDefault) {
      await db.bankAccount.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }
    return db.bankAccount.create({
      data: {
        userId,
        bankCode: input.bankCode,
        bankName: input.bankName,
        accountNumber: input.accountNumber,
        accountName: input.accountName,
        isDefault: input.isDefault ?? false
      }
    });
  }
}

export class AnalyticsService {
  async getOverview() {
    const [openJobs, activeContracts, completedContracts, openReports, activeSubscriptions, pendingPayouts] =
      await Promise.all([
        db.job.count({ where: { status: "OPEN", deletedAt: null } }),
        db.contract.count({
          where: { status: { in: ["ACTIVE", "IN_PROGRESS", "IN_REVIEW"] }, deletedAt: null }
        }),
        db.contract.count({ where: { status: "COMPLETED", deletedAt: null } }),
        db.moderationReport.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } }),
        db.userSubscription.count({ where: { status: "ACTIVE" } }),
        db.payoutRequest.count({ where: { status: PayoutRequestStatus.PENDING } })
      ]);

    const gmvResult = await db.contract.aggregate({
      where: { status: "COMPLETED", deletedAt: null },
      _sum: { escrowAmountCents: true }
    });

    const completionRate =
      activeContracts + completedContracts > 0
        ? Math.round((completedContracts / (activeContracts + completedContracts)) * 100)
        : 0;

    return {
      gmvCents: gmvResult._sum.escrowAmountCents ?? 0,
      openJobs,
      activeContracts,
      completedContracts,
      completionRatePercent: completionRate,
      openModerationReports: openReports,
      activeSubscriptions,
      pendingPayouts
    };
  }

  async getModerationMetrics() {
    const now = new Date();
    const overdue = await db.moderationReport.count({
      where: {
        status: { in: ["OPEN", "IN_REVIEW"] },
        slaDueAt: { lt: now }
      }
    });
    const open = await db.moderationReport.count({
      where: { status: { in: ["OPEN", "IN_REVIEW"] } }
    });
    const appeals = await db.suspensionAppeal.count({
      where: { status: AppealStatus.PENDING }
    });
    return { open, overdue, pendingAppeals: appeals };
  }
}
