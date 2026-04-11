import { db } from "@acme/database";
import { AccountStatus, UserRole, WorkMode } from "@acme/types";
import { NotFoundError } from "../errors/domain-errors";

export type FreelancerProfileForBid = {
  id: string;
  isComplete: boolean;
  workMode: WorkMode;
  userRole: UserRole;
  accountStatus: AccountStatus;
};

export class FreelancerRepository {
  async requireProfileByUserId(userId: string): Promise<FreelancerProfileForBid> {
    const profile = await db.freelancerProfile.findFirst({
      where: { userId, deletedAt: null },
      include: {
        user: {
          select: { role: true, accountStatus: true, deletedAt: true }
        }
      }
    });

    if (!profile || profile.user.deletedAt) {
      throw new NotFoundError("Freelancer profile not found");
    }

    return {
      id: profile.id,
      isComplete: Boolean(profile.username && profile.bio && profile.workMode),
      workMode: profile.workMode as WorkMode,
      userRole: (profile.user.role ?? UserRole.FREELANCER) as UserRole,
      accountStatus: profile.user.accountStatus as AccountStatus
    };
  }

  async requireProfileIdForUser(userId: string): Promise<string> {
    const profile = await db.freelancerProfile.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true }
    });

    if (!profile) {
      throw new NotFoundError("Freelancer profile not found");
    }

    return profile.id;
  }
}
