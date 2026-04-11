import type { AuthActor } from "../domain/auth-actor";
import { ContractPolicy } from "../policies/contract.policy";
import { ContractRepository } from "../repositories/contract.repository";

/**
 * Contract read model for participants — transitions and payments TODO.
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
    return row;
  }
}
