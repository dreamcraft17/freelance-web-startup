import { db } from "@acme/database";
import { NotFoundError } from "../errors/domain-errors";

export class ClientRepository {
  async requireClientProfileIdForUser(userId: string): Promise<string> {
    const profile = await db.clientProfile.findFirst({
      where: { userId, deletedAt: null }
    });

    if (!profile) {
      throw new NotFoundError("Client profile not found");
    }

    return profile.id;
  }
}
