import { V2_PRICING } from "@acme/config";
import type { Prisma } from "@acme/database";
import {
  ContractStatus,
  DisputeStatus,
  EscrowStatus,
  EscrowTransactionType,
  db
} from "@acme/database";
import { ContractStatus as ContractStatusEnum } from "@acme/types";
import type { AuthActor } from "../domain/auth-actor";
import { DomainError, PolicyDeniedError } from "../errors/domain-errors";
import { ContractPolicy } from "../policies/contract.policy";
import { ContractRepository } from "../repositories/contract.repository";

function addDays(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export class EscrowService {
  constructor(private readonly contractRepo = new ContractRepository()) {}

  async getEscrowStatus(actor: AuthActor, contractId: string) {
    const row = await this.contractRepo.requireById(contractId);
    ContractPolicy.assertActorMayAccessContract(actor, row.clientUserId, row.freelancerUserId);

    const transactions = await db.escrowTransaction.findMany({
      where: { contractId },
      orderBy: { createdAt: "asc" }
    });

    return {
      contractId,
      status: row.status,
      paymentStatus: row.paymentStatus,
      escrowStatus: row.escrowStatus,
      escrowAmountCents: row.escrowAmountCents,
      workSubmittedAt: row.workSubmittedAt?.toISOString() ?? null,
      workReviewDeadline: row.workReviewDeadline?.toISOString() ?? null,
      paymentDueAt: row.paymentDueAt?.toISOString() ?? null,
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        reason: t.reason,
        createdAt: t.createdAt.toISOString()
      }))
    };
  }

  async submitWork(actor: AuthActor, contractId: string, message?: string) {
    const row = await this.contractRepo.requireById(contractId);
    if (row.freelancerUserId !== actor.userId) {
      throw new PolicyDeniedError("Only the assigned freelancer can submit work");
    }
    if (row.escrowStatus !== EscrowStatus.LOCKED) {
      throw new DomainError("Escrow must be locked before submitting work", "ESCROW_NOT_LOCKED", 400);
    }
    if (row.status !== ContractStatus.IN_PROGRESS && row.status !== ContractStatus.ACTIVE) {
      throw new DomainError("Contract is not in progress", "CONTRACT_NOT_IN_PROGRESS", 400);
    }

    const now = new Date();
    const deadline = addDays(now, V2_PRICING.workReviewDays);

    const updated = await db.contract.update({
      where: { id: contractId },
      data: {
        status: ContractStatus.IN_REVIEW,
        workSubmittedAt: now,
        workReviewDeadline: deadline
      }
    });

    if (message?.trim()) {
      const thread = await db.messageThread.findFirst({
        where: { contractId },
        select: { id: true }
      });
      if (thread) {
        await db.message.create({
          data: {
            threadId: thread.id,
            senderId: actor.userId,
            body: `[Work submitted]\n${message.trim()}`
          }
        });
      }
    }

    return {
      contractId,
      status: updated.status as ContractStatusEnum,
      workReviewDeadline: deadline.toISOString()
    };
  }

  async reviewWork(actor: AuthActor, contractId: string, action: "approve" | "request_revision" | "dispute", message?: string) {
    const row = await this.contractRepo.requireById(contractId);
    if (row.clientUserId !== actor.userId) {
      throw new PolicyDeniedError("Only the client can review submitted work");
    }
    if (row.status !== ContractStatus.IN_REVIEW) {
      throw new DomainError("Contract is not awaiting review", "NOT_IN_REVIEW", 400);
    }

    if (action === "request_revision") {
      const updated = await db.contract.update({
        where: { id: contractId },
        data: { status: ContractStatus.IN_PROGRESS, workReviewDeadline: null }
      });
      return { contractId, status: updated.status, action };
    }

    if (action === "dispute") {
      await db.contractDispute.create({
        data: {
          contractId,
          initiatedByUserId: actor.userId,
          reason: message ?? "Client disputed submitted work",
          evidence: [],
          status: DisputeStatus.OPEN
        }
      });
      await db.contract.update({
        where: { id: contractId },
        data: { status: ContractStatus.DISPUTED, escrowStatus: EscrowStatus.DISPUTED }
      });
      return { contractId, status: ContractStatus.DISPUTED, action: "dispute" };
    }

    return this.releasePartialEscrow(contractId, actor.userId, "Client approved work");
  }

  async releasePartialEscrow(contractId: string, actorUserId: string, reason: string) {
    const row = await this.contractRepo.requireById(contractId);
    const amount = row.escrowAmountCents ?? 0;
    const releaseAmount = Math.round(amount * V2_PRICING.partialReleaseRate);
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
        update: {
          balanceCents: { increment: releaseAmount }
        }
      });
      if (holdback > 0) {
        await tx.escrowTransaction.create({
          data: {
            contractId,
            type: EscrowTransactionType.LOCK,
            amount: holdback,
            reason: `Holdback ${V2_PRICING.chargebackHoldDays}d chargeback protection`,
            createdBy: "system"
          }
        });
      }
    });

    return { contractId, releasedCents: releaseAmount, holdbackCents: holdback };
  }

  async processAutoReleases(): Promise<{ processed: number }> {
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
      await this.releasePartialEscrow(c.id, "system", "Auto-release after review window");
    }

    const partial = await db.contract.findMany({
      where: {
        escrowStatus: EscrowStatus.PARTIAL_RELEASED,
        escrowReleasedAt: null,
        workSubmittedAt: { lte: addDays(now, -(V2_PRICING.workReviewDays + V2_PRICING.chargebackHoldDays)) },
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
            create: { userId: c.freelancerUserId, balanceCents: holdback, currency: c.currency ?? "IDR" },
            update: { balanceCents: { increment: holdback } }
          });
        });
      }
    }

    return { processed: staleReview.length + partial.length };
  }
}
