import { NotificationType, UserRole } from "@acme/types";

const DESK_ROLES = [UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT_ADMIN];

/** Escalates overdue active reports once. Conditional updates make concurrent workers safe. */
export async function escalateOverdueModerationReports(at = new Date()) {
  if (!process.env.DATABASE_URL?.trim()) {
    return { escalated: 0, skippedNoDatabase: true as const };
  }

  const { db } = await import("@acme/database");
  const [candidates, desk] = await Promise.all([
    db.moderationReport.findMany({
      where: {
        status: { in: ["OPEN", "IN_REVIEW"] },
        slaDueAt: { lt: at },
        escalationLevel: 0
      },
      orderBy: { slaDueAt: "asc" },
      take: 100,
      select: { id: true, priority: true, category: true, slaDueAt: true }
    }),
    db.user.findMany({
      where: { role: { in: DESK_ROLES }, accountStatus: "ACTIVE", deletedAt: null },
      select: { id: true }
    })
  ]);

  let escalated = 0;
  for (const report of candidates) {
    const didEscalate = await db.$transaction(async (tx) => {
      const updated = await tx.moderationReport.updateMany({
        where: { id: report.id, escalationLevel: 0, status: { in: ["OPEN", "IN_REVIEW"] } },
        data: { escalationLevel: 1, escalatedAt: at }
      });
      if (updated.count === 0) return false;

      await tx.auditLog.create({
        data: {
          actorId: null,
          action: "MODERATION_REPORT_SLA_ESCALATED",
          targetType: "ModerationReport",
          targetId: report.id,
          metadata: {
            priority: report.priority,
            category: report.category,
            slaDueAt: report.slaDueAt.toISOString(),
            escalatedAt: at.toISOString(),
            level: 1
          }
        }
      });
      if (desk.length) {
        await tx.notification.createMany({
          data: desk.map(({ id }) => ({
            userId: id,
            type: NotificationType.ADMIN_MODERATION_EVENT,
            title: "Moderation SLA overdue",
            body: `${report.priority} ${report.category} report ${report.id} is overdue.`,
            payload: { reportId: report.id, event: "REPORT_SLA_ESCALATED", escalationLevel: 1 }
          }))
        });
      }
      return true;
    });
    if (didEscalate) escalated += 1;
  }

  return { escalated, scanned: candidates.length };
}
