import type { PatchModerationReportDto, CreateModerationReportDto, AdminReportsQueryDto } from "@acme/validators";
import { moderationTriageForCategory } from "@acme/config";
import { ModerationReportStatus, NotificationType, UserRole } from "@acme/types";
import { db, Prisma } from "@acme/database";
import type { AuthActor } from "../domain/auth-actor";
import { ConflictError, NotFoundError, PolicyDeniedError } from "../errors/domain-errors";
import { ModerationPolicy } from "../policies/moderation.policy";
import { ModerationReportRepository } from "../repositories/moderation-report.repository";

function timestampsForReportStatus(status: ModerationReportStatus): {
  resolvedAt: Date | null;
  dismissedAt: Date | null;
} {
  if (status === ModerationReportStatus.OPEN || status === ModerationReportStatus.IN_REVIEW) {
    return { resolvedAt: null, dismissedAt: null };
  }
  const now = new Date();
  if (status === ModerationReportStatus.RESOLVED) {
    return { resolvedAt: now, dismissedAt: null };
  }
  return { resolvedAt: null, dismissedAt: now };
}

const THREAD_REPORT_STAFF: UserRole[] = [
  UserRole.ADMIN,
  UserRole.SUPPORT_ADMIN,
  UserRole.MODERATOR,
  UserRole.FINANCE_ADMIN
];

function isDeskStaff(role: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT_ADMIN].includes(role);
}

const REPORT_DESK_ROLES = [UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT_ADMIN];

function subjectKeyFor(dto: CreateModerationReportDto): string {
  switch (dto.subjectType) {
    case "USER": return dto.subjectUserId;
    case "JOB": return dto.subjectJobId;
    case "BID": return dto.subjectBidId;
    case "REVIEW": return dto.subjectReviewId;
    case "MESSAGE_THREAD": return dto.subjectThreadId;
    case "MESSAGE": return dto.subjectMessageId;
  }
}

function subjectLinkFor(dto: CreateModerationReportDto): Partial<Prisma.ModerationReportCreateInput> {
  switch (dto.subjectType) {
    case "USER": return { subjectUserId: dto.subjectUserId };
    case "JOB": return { subjectJobId: dto.subjectJobId };
    case "BID": return { subjectBidId: dto.subjectBidId };
    case "REVIEW": return { subjectReviewId: dto.subjectReviewId };
    case "MESSAGE_THREAD": return { subjectThreadId: dto.subjectThreadId };
    case "MESSAGE": return { subjectMessageId: dto.subjectMessageId };
  }
}

/**
 * Trust & safety: reporter intake + staff triage/resolution/dismissal + internal notes.
 */
export class ModerationReportService {
  constructor(private readonly repo = new ModerationReportRepository()) {}

  async createReport(actor: AuthActor, dto: CreateModerationReportDto) {
    await this.assertSubjectAndPermissions(actor, dto);
    const subjectKey = subjectKeyFor(dto);
    const duplicate = await db.moderationReport.findFirst({
      where: {
        reporterUserId: actor.userId,
        subjectType: dto.subjectType,
        subjectKey,
        status: { in: [ModerationReportStatus.OPEN, ModerationReportStatus.IN_REVIEW] }
      },
      select: { id: true }
    });
    if (duplicate) {
      throw new ConflictError("You already have an active report for this subject", "DUPLICATE_ACTIVE_REPORT");
    }

    const triage = moderationTriageForCategory(dto.category);
    const slaDueAt = new Date(Date.now() + triage.slaHours * 60 * 60 * 1000);
    try {
      return await db.$transaction(async (tx) => {
        const report = await tx.moderationReport.create({
          data: {
            reporter: { connect: { id: actor.userId } },
            subjectType: dto.subjectType,
            subjectKey,
            ...subjectLinkFor(dto),
            category: dto.category,
            description: dto.description.trim(),
            priority: triage.priority,
            slaDueAt
          }
        });

        const desk = await tx.user.findMany({
          where: { role: { in: REPORT_DESK_ROLES }, accountStatus: "ACTIVE", deletedAt: null },
          select: { id: true }
        });
        if (desk.length) {
          await tx.notification.createMany({
            data: desk.map(({ id }) => ({
              userId: id,
              type: NotificationType.ADMIN_MODERATION_EVENT,
              title: `${triage.priority} moderation report`,
              body: `A ${dto.category} report requires triage by ${slaDueAt.toISOString()}.`,
              payload: { reportId: report.id, priority: triage.priority, event: "REPORT_CREATED" }
            }))
          });
        }
        await tx.auditLog.create({
          data: {
            actorId: actor.userId,
            action: "MODERATION_REPORT_CREATED",
            targetType: "ModerationReport",
            targetId: report.id,
            metadata: {
              subjectType: dto.subjectType,
              subjectKey,
              category: dto.category,
              priority: triage.priority,
              slaDueAt: slaDueAt.toISOString()
            }
          }
        });
        return report;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictError("You already have an active report for this subject", "DUPLICATE_ACTIVE_REPORT");
      }
      throw error;
    }
  }

  private async assertSubjectAndPermissions(actor: AuthActor, dto: CreateModerationReportDto): Promise<void> {
    switch (dto.subjectType) {
      case "USER": {
        if (dto.subjectUserId === actor.userId) {
          throw new PolicyDeniedError("You cannot submit a report about yourself");
        }
        const subject = await db.user.findFirst({
          where: { id: dto.subjectUserId, deletedAt: null }
        });
        if (!subject) throw new NotFoundError("User not found");
        break;
      }
      case "JOB": {
        const job = await db.job.findFirst({
          where: { id: dto.subjectJobId, deletedAt: null }
        });
        if (!job) throw new NotFoundError("Job not found");
        break;
      }
      case "BID": {
        const bid = await db.bid.findFirst({
          where: { id: dto.subjectBidId },
          include: {
            job: { select: { clientProfile: { select: { userId: true } } } },
            freelancer: { select: { userId: true } }
          }
        });
        if (!bid?.job?.clientProfile) throw new NotFoundError("Bid not found");
        const clientOwnerUserId = bid.job.clientProfile.userId;
        const bidderUserId = bid.freelancer.userId;
        const reporterIsParticipant =
          actor.userId === clientOwnerUserId || actor.userId === bidderUserId;
        const reporterIsDesk = isDeskStaff(actor.role);
        if (!reporterIsParticipant && !reporterIsDesk) {
          throw new PolicyDeniedError("You can only report bids you participate in");
        }
        break;
      }
      case "REVIEW": {
        const review = await db.review.findFirst({ where: { id: dto.subjectReviewId } });
        if (!review) throw new NotFoundError("Review not found");
        break;
      }
      case "MESSAGE_THREAD": {
        const threadExists = await db.messageThread.findFirst({ where: { id: dto.subjectThreadId } });
        if (!threadExists) throw new NotFoundError("Thread not found");
        const member = await db.messageThreadParticipant.findFirst({
          where: { threadId: dto.subjectThreadId, userId: actor.userId }
        });
        if (!member && !THREAD_REPORT_STAFF.includes(actor.role)) {
          throw new PolicyDeniedError("You are not part of this conversation");
        }
        break;
      }
      case "MESSAGE": {
        const message = await db.message.findFirst({
          where: { id: dto.subjectMessageId, deletedAt: null },
          select: { threadId: true }
        });
        if (!message) throw new NotFoundError("Message not found");
        const member = await db.messageThreadParticipant.findFirst({
          where: { threadId: message.threadId, userId: actor.userId }
        });
        if (!member && !THREAD_REPORT_STAFF.includes(actor.role)) {
          throw new PolicyDeniedError("You are not part of this conversation");
        }
        break;
      }
      default: {
        const _never: never = dto;
        return _never;
      }
    }
  }

  async listForStaff(actor: AuthActor, query: AdminReportsQueryDto) {
    ModerationPolicy.assertMayAccessReportsQueue(actor);

    let assignedFilter: string | undefined = query.assignedToStaffUserId;
    let unassignedOnly = false;
    if (assignedFilter === "__unassigned") {
      assignedFilter = undefined;
      unassignedOnly = true;
    }

    const { items, total } = await this.repo.list({
      page: query.page,
      limit: query.limit,
      status: query.status as ModerationReportStatus | undefined,
      priority: query.priority,
      attention: query.attention,
      subjectType: query.subjectType,
      assignedToStaffUserId: assignedFilter,
      unassignedOnly,
      q: query.q?.trim()
    });

    return { items, total, page: query.page, limit: query.limit };
  }

  async getQueueStats(actor: AuthActor) {
    ModerationPolicy.assertMayAccessReportsQueue(actor);
    return this.repo.getQueueStats();
  }

  async patchReport(actor: AuthActor, reportId: string, dto: PatchModerationReportDto) {
    ModerationPolicy.assertMayMutateReports(actor);
    const report = await this.repo.findById(reportId);
    if (!report) throw new NotFoundError("Report not found");

    const shouldTouchReport =
      dto.status !== undefined ||
      dto.assignedToStaffUserId !== undefined ||
      dto.resolutionSummary !== undefined;

    if (dto.addNote) ModerationPolicy.assertMayWriteReportNotes(actor);

    let validatedAssignee: { id: string; role: string } | null | undefined;
    if (dto.assignedToStaffUserId !== undefined && dto.assignedToStaffUserId !== null) {
      validatedAssignee = await db.user.findFirst({
        where: { id: dto.assignedToStaffUserId, deletedAt: null },
        select: { id: true, role: true }
      });
      if (!validatedAssignee) throw new NotFoundError("Assignee not found");
      ModerationPolicy.assertAssigneeMustBeStaff(validatedAssignee.role as UserRole);
    } else if (dto.assignedToStaffUserId === null) {
      validatedAssignee = null;
    }

    const data: Prisma.ModerationReportUpdateInput = {};
    if (shouldTouchReport) data.statusUpdatedBy = { connect: { id: actor.userId } };

    if (dto.resolutionSummary !== undefined) {
      data.resolutionSummary = dto.resolutionSummary ?? null;
    }

    if (dto.assignedToStaffUserId !== undefined) {
      if (validatedAssignee === null) {
        data.assignedToStaff = { disconnect: true };
      } else {
        data.assignedToStaff = { connect: { id: validatedAssignee!.id } };
      }
    }

    if (dto.status) {
      const status = dto.status as ModerationReportStatus;
      const { resolvedAt, dismissedAt } = timestampsForReportStatus(status);
      data.status = status;
      data.resolvedAt = resolvedAt;
      data.dismissedAt = dismissedAt;
    }

    await db.$transaction(async (tx) => {
      if (dto.addNote) {
        await tx.moderationReportNote.create({
          data: {
            report: { connect: { id: reportId } },
            authorStaff: { connect: { id: actor.userId } },
            body: dto.addNote.trim()
          }
        });
      }
      if (shouldTouchReport) {
        await tx.moderationReport.update({ where: { id: reportId }, data });
      }
      await tx.auditLog.create({
        data: {
          actorId: actor.userId,
          action: "MODERATION_REPORT_UPDATED",
          targetType: "ModerationReport",
          targetId: reportId,
          metadata: {
            previousStatus: report.status,
            status: dto.status ?? report.status,
            previousAssigneeId: report.assignedToStaffUserId,
            assignedToStaffUserId:
              dto.assignedToStaffUserId !== undefined
                ? dto.assignedToStaffUserId
                : report.assignedToStaffUserId,
            noteAdded: Boolean(dto.addNote),
            resolutionUpdated: dto.resolutionSummary !== undefined
          }
        }
      });
      if (validatedAssignee && validatedAssignee.id !== report.assignedToStaffUserId) {
        await tx.notification.create({
          data: {
            userId: validatedAssignee.id,
            type: NotificationType.ADMIN_MODERATION_EVENT,
            title: "Moderation report assigned",
            body: `Report ${reportId} has been assigned to you.`,
            payload: { reportId, event: "REPORT_ASSIGNED" }
          }
        });
      }
    });
    return this.repo.findByIdWithRelations(reportId);
  }
}
