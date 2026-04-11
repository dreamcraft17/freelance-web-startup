import { db } from "@acme/database";
import { ContractStatus } from "@acme/types";
import { DomainError, NotFoundError, PolicyDeniedError } from "../errors/domain-errors";
import { CONTRACT_STATUSES_ALLOWED_TO_COMPLETE } from "../policies/contract.policy";

const contractSelect = {
  id: true,
  bidId: true,
  clientUserId: true,
  freelancerUserId: true,
  status: true,
  amount: true,
  currency: true,
  startDate: true,
  endDate: true,
  createdAt: true,
  updatedAt: true
} as const;

export type ContractRow = Awaited<ReturnType<ContractRepository["requireById"]>>;

export class ContractRepository {
  async requireById(contractId: string) {
    const row = await db.contract.findFirst({
      where: { id: contractId, deletedAt: null },
      select: contractSelect
    });

    if (!row) {
      throw new NotFoundError("Contract not found");
    }

    return row;
  }

  /**
   * Single transition to COMPLETED when still in a completable status (avoids duplicate completion races).
   */
  async markCompletedAtomic(contractId: string) {
    const now = new Date();
    const result = await db.contract.updateMany({
      where: {
        id: contractId,
        deletedAt: null,
        status: { in: [...CONTRACT_STATUSES_ALLOWED_TO_COMPLETE] }
      },
      data: {
        status: ContractStatus.COMPLETED,
        endDate: now
      }
    });

    if (result.count === 0) {
      const current = await db.contract.findFirst({
        where: { id: contractId, deletedAt: null },
        select: { status: true }
      });
      if (!current) {
        throw new NotFoundError("Contract not found");
      }
      if (current.status === ContractStatus.COMPLETED) {
        throw new DomainError("Contract is already completed", "ALREADY_COMPLETED", 409);
      }
      throw new PolicyDeniedError("Contract cannot be completed in its current status");
    }

    return db.contract.findFirstOrThrow({
      where: { id: contractId, deletedAt: null },
      select: contractSelect
    });
  }
}
