import { db } from "@acme/database";
import { ACTIVE_BID_STATUSES, ACTIVE_CONTRACT_STATUSES } from "@acme/config";

export class QuotaRepository {
  async countActiveBids(freelancerProfileId: string): Promise<number> {
    return db.bid.count({
      where: {
        freelancerId: freelancerProfileId,
        status: { in: [...ACTIVE_BID_STATUSES] }
      }
    });
  }

  async countActiveAcceptedContracts(freelancerUserId: string): Promise<number> {
    return db.contract.count({
      where: {
        freelancerUserId,
        status: { in: [...ACTIVE_CONTRACT_STATUSES] }
      }
    });
  }
}
