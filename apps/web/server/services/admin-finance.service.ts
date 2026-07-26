import type { Prisma } from "@acme/database";
import {
  ContractStatus,
  DisputeDecision,
  DisputeStatus,
  EscrowStatus,
  EscrowTransactionType,
  PaymentTransactionStatus,
  PaymentTransactionType,
  PayoutRequestStatus,
  db
} from "@acme/database";
import type { AuthActor } from "../domain/auth-actor";
import { DomainError, NotFoundError } from "../errors/domain-errors";
import { PayoutService } from "./v2-commerce.service";

async function remainingLockedEscrowCents(contractId: string): Promise<number> {
  const txs = await db.escrowTransaction.findMany({ where: { contractId } });
  let balance = 0;
  for (const t of txs) {
    if (t.type === EscrowTransactionType.LOCK) balance += t.amount;
    if (
      t.type === EscrowTransactionType.PARTIAL_RELEASE ||
      t.type === EscrowTransactionType.FULL_RELEASE ||
      t.type === EscrowTransactionType.REFUND
    ) {
      balance -= t.amount;
    }
  }
  return Math.max(0, balance);
}

export class DisputeAdminService {
  async listOpenDisputes() {
    return db.contractDispute.findMany({
      where: { status: DisputeStatus.OPEN },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: {
        contract: {
          select: {
            id: true,
            escrowAmountCents: true,
            escrowStatus: true,
            status: true,
            currency: true,
            clientUserId: true,
            freelancerUserId: true,
            bid: { select: { job: { select: { title: true } } } }
          }
        }
      }
    });
  }

  async resolveDispute(
    actor: AuthActor,
    disputeId: string,
    input: { decision: DisputeDecision; resolution?: string }
  ) {
    const dispute = await db.contractDispute.findUnique({
      where: { id: disputeId },
      include: {
        contract: {
          include: {
            paymentIntent: { select: { provider: true, amountCents: true, currency: true } }
          }
        }
      }
    });
    if (!dispute) throw new NotFoundError("Dispute not found");
    if (dispute.status !== DisputeStatus.OPEN && dispute.status !== DisputeStatus.REVIEWING) {
      throw new DomainError("Dispute is already resolved", "DISPUTE_ALREADY_RESOLVED", 409);
    }

    const contract = dispute.contract;
    const remaining = await remainingLockedEscrowCents(contract.id);
    if (remaining <= 0) {
      throw new DomainError("No locked escrow remains to resolve", "ESCROW_EMPTY", 409);
    }

    const now = new Date();
    const resolutionNote = input.resolution?.trim() || null;
    const provider = contract.paymentIntent?.provider ?? "MOCK";
    const currency = contract.paymentIntent?.currency ?? contract.currency ?? "IDR";

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      if (input.decision === DisputeDecision.FAVOR_CLIENT) {
        await tx.escrowTransaction.create({
          data: {
            contractId: contract.id,
            type: EscrowTransactionType.REFUND,
            amount: remaining,
            reason: resolutionNote ?? "Dispute resolved in favor of client",
            createdBy: actor.userId
          }
        });
        await tx.paymentTransaction.create({
          data: {
            contractId: contract.id,
            type: PaymentTransactionType.REFUND,
            amount: remaining,
            currency,
            status: PaymentTransactionStatus.SUCCEEDED,
            provider,
            providerTxnId: `refund-${disputeId.slice(0, 12)}`
          }
        });
        await tx.contract.update({
          where: { id: contract.id },
          data: {
            status: ContractStatus.CANCELLED,
            escrowStatus: EscrowStatus.REFUNDED
          }
        });
      } else if (input.decision === DisputeDecision.FAVOR_FREELANCER) {
        await tx.escrowTransaction.create({
          data: {
            contractId: contract.id,
            type: EscrowTransactionType.FULL_RELEASE,
            amount: remaining,
            reason: resolutionNote ?? "Dispute resolved in favor of freelancer",
            createdBy: actor.userId
          }
        });
        await tx.freelancerWallet.upsert({
          where: { userId: contract.freelancerUserId },
          create: {
            userId: contract.freelancerUserId,
            balanceCents: remaining,
            currency
          },
          update: { balanceCents: { increment: remaining } }
        });
        await tx.contract.update({
          where: { id: contract.id },
          data: {
            status: ContractStatus.COMPLETED,
            escrowStatus: EscrowStatus.FULLY_RELEASED,
            escrowReleasedAt: now
          }
        });
      } else {
        const refundAmount = Math.floor(remaining / 2);
        const releaseAmount = remaining - refundAmount;
        if (refundAmount > 0) {
          await tx.escrowTransaction.create({
            data: {
              contractId: contract.id,
              type: EscrowTransactionType.REFUND,
              amount: refundAmount,
              reason: resolutionNote ?? "Dispute split — client refund portion",
              createdBy: actor.userId
            }
          });
          await tx.paymentTransaction.create({
            data: {
              contractId: contract.id,
              type: PaymentTransactionType.REFUND,
              amount: refundAmount,
              currency,
              status: PaymentTransactionStatus.SUCCEEDED,
              provider,
              providerTxnId: `refund-split-${disputeId.slice(0, 8)}`
            }
          });
        }
        if (releaseAmount > 0) {
          await tx.escrowTransaction.create({
            data: {
              contractId: contract.id,
              type: EscrowTransactionType.FULL_RELEASE,
              amount: releaseAmount,
              reason: resolutionNote ?? "Dispute split — freelancer release portion",
              createdBy: actor.userId
            }
          });
          await tx.freelancerWallet.upsert({
            where: { userId: contract.freelancerUserId },
            create: {
              userId: contract.freelancerUserId,
              balanceCents: releaseAmount,
              currency
            },
            update: { balanceCents: { increment: releaseAmount } }
          });
        }
        await tx.contract.update({
          where: { id: contract.id },
          data: {
            status: ContractStatus.COMPLETED,
            escrowStatus: EscrowStatus.FULLY_RELEASED,
            escrowReleasedAt: now
          }
        });
      }

      await tx.contractDispute.update({
        where: { id: disputeId },
        data: {
          status: DisputeStatus.RESOLVED,
          decision: input.decision,
          resolution: resolutionNote,
          resolutionAt: now,
          assignedToStaffUserId: actor.userId
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: actor.userId,
          action: "DISPUTE_RESOLVED",
          targetType: "ContractDispute",
          targetId: disputeId,
          metadata: {
            contractId: contract.id,
            decision: input.decision,
            remainingCents: remaining
          } as object
        }
      });

      const refundLogged =
        input.decision === DisputeDecision.FAVOR_CLIENT ||
        input.decision === DisputeDecision.SPLIT;
      if (refundLogged) {
        await tx.auditLog.create({
          data: {
            actorId: actor.userId,
            action: "ESCROW_REFUNDED",
            targetType: "Contract",
            targetId: contract.id,
            metadata: { disputeId, decision: input.decision } as object
          }
        });
      }
    });

    return { disputeId, decision: input.decision, status: DisputeStatus.RESOLVED };
  }
}

export class PayoutAdminService {
  private readonly payouts = new PayoutService();

  async listPendingPayouts() {
    return db.payoutRequest.findMany({
      where: { status: PayoutRequestStatus.PENDING },
      orderBy: { requestedAt: "asc" },
      take: 100,
      include: {
        user: { select: { id: true, email: true } }
      }
    });
  }

  async approvePayout(actor: AuthActor, payoutId: string) {
    const row = await this.payouts.approvePayout(payoutId, actor.userId);
    await db.auditLog.create({
      data: {
        actorId: actor.userId,
        action: "PAYOUT_APPROVED",
        targetType: "PayoutRequest",
        targetId: payoutId,
        metadata: { amountCents: row.amountCents, userId: row.userId } as object
      }
    });
    return row;
  }
}

export class ReconciliationService {
  async getSummary(lookbackHours = 72) {
    const { runPaymentReconciliation } = await import("@acme/database");
    return runPaymentReconciliation(lookbackHours);
  }
}
