import type { AuthActor } from "../domain/auth-actor";
import { ContractPolicy } from "../policies/contract.policy";
import { ContractRepository } from "../repositories/contract.repository";
import { ContractStatus } from "@acme/types";

function num(v: { toString(): string } | null | undefined): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function serializeContract(row: {
  id: string;
  bidId: string;
  clientUserId: string;
  freelancerUserId: string;
  status: string;
  amount: { toString(): string } | null;
  currency: string | null;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    bidId: row.bidId,
    clientUserId: row.clientUserId,
    freelancerUserId: row.freelancerUserId,
    status: row.status as ContractStatus,
    amount: num(row.amount),
    currency: row.currency,
    startDate: row.startDate?.toISOString() ?? null,
    endDate: row.endDate?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

/**
 * Contract lifecycle: participant reads and completion (reviews gate on COMPLETED via {@link ReviewPolicy}).
 */
export class ContractService {
  constructor(private readonly contractRepo = new ContractRepository()) {}

  async getByIdForActor(actor: AuthActor, contractId: string) {
    const row = await this.contractRepo.requireById(contractId);
    ContractPolicy.assertActorMayAccessContract(
      actor,
      row.clientUserId,
      row.freelancerUserId
    );
    return serializeContract(row);
  }

  /**
   * Client or freelancer marks the contract completed. Idempotent race: second caller gets **409** `ALREADY_COMPLETED`.
   * Reviews remain gated on **COMPLETED** in {@link ReviewService} / {@link ReviewPolicy}.
   */
  async completeContract(actor: AuthActor, contractId: string) {
    const row = await this.contractRepo.requireById(contractId);
    ContractPolicy.assertActorMayCompleteContract(actor, row.clientUserId, row.freelancerUserId);
    ContractPolicy.assertContractCompletable(row.status as ContractStatus);

    const updated = await this.contractRepo.markCompletedAtomic(contractId);
    return serializeContract(updated);
  }
}
