import type { StaffSetJobModerationDto, StaffSetUserModerationDto } from "@acme/validators";
import { AccountStatus, UserRole } from "@acme/types";
import { db } from "@acme/database";
import type { AuthActor } from "../domain/auth-actor";
import { NotFoundError, PolicyDeniedError } from "../errors/domain-errors";
import { ModerationPolicy } from "../policies/moderation.policy";

/**
 * Staff-safe actions: hide jobs from discovery, suspend/reactivate marketplace users.
 */
export class ModerationActionsService {
  async setJobModerationHidden(actor: AuthActor, jobId: string, dto: StaffSetJobModerationDto) {
    ModerationPolicy.assertMayModerateListings(actor);

    const job = await db.job.findFirst({ where: { id: jobId, deletedAt: null } });
    if (!job) throw new NotFoundError("Job not found");

    const now = new Date();
    if (dto.hidden) {
      await db.job.update({
        where: { id: jobId },
        data: {
          moderationHiddenAt: now,
          moderationHiddenReason: dto.reason?.trim() || null,
          moderationHiddenByUserId: actor.userId
        }
      });
    } else {
      await db.job.update({
        where: { id: jobId },
        data: {
          moderationHiddenAt: null,
          moderationHiddenReason: null,
          moderationHiddenByUserId: null
        }
      });
    }

    await db.auditLog.create({
      data: {
        actorId: actor.userId,
        action: dto.hidden ? "JOB_MODERATION_HIDE" : "JOB_MODERATION_UNHIDE",
        targetType: "Job",
        targetId: jobId,
        metadata: { reason: dto.reason?.trim() ?? null } as object
      }
    });

    return { ok: true as const };
  }

  async setUserAccountStatus(actor: AuthActor, userId: string, dto: StaffSetUserModerationDto) {
    ModerationPolicy.assertMaySuspendUsers(actor);

    if (userId === actor.userId) {
      throw new PolicyDeniedError("You cannot change your own account status from this tool");
    }

    const target = await db.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, role: true, accountStatus: true }
    });
    if (!target) throw new NotFoundError("User not found");

    if (![UserRole.CLIENT, UserRole.FREELANCER].includes(target.role as UserRole)) {
      throw new PolicyDeniedError("Only client and freelancer accounts can be updated from this tool");
    }

    const next =
      dto.accountStatus === AccountStatus.SUSPENDED ? AccountStatus.SUSPENDED : AccountStatus.ACTIVE;

    if (target.accountStatus === next) {
      return { ok: true as const, accountStatus: target.accountStatus };
    }

    await db.user.update({
      where: { id: userId },
      data: { accountStatus: next }
    });

    await db.auditLog.create({
      data: {
        actorId: actor.userId,
        action: next === AccountStatus.SUSPENDED ? "USER_SUSPENDED" : "USER_REACTIVATED",
        targetType: "User",
        targetId: userId,
        metadata: { previousStatus: target.accountStatus, nextStatus: next } as object
      }
    });

    return { ok: true as const, accountStatus: next };
  }
}
