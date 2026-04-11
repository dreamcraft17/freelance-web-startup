import { db } from "@acme/database";
import { NotFoundError } from "../errors/domain-errors";

export class ContractRepository {
  async requireById(contractId: string) {
    const row = await db.contract.findFirst({
      where: { id: contractId, deletedAt: null },
      select: {
        id: true,
        clientUserId: true,
        freelancerUserId: true,
        status: true
      }
    });

    if (!row) {
      throw new NotFoundError("Contract not found");
    }

    return row;
  }
}
