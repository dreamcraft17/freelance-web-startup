import type { PatchModerationReportDto, CreateModerationReportDto, AdminReportsQueryDto } from "@acme/validators";
import { ModerationReportStatus, UserRole } from "@acme/types";
import { db, Prisma } from "@acme/database";
import type { AuthActor } from "../domain/auth-actor";
import { NotFoundError, PolicyDeniedError } from "../errors/domain-errors";
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

/**
 * Trust & safety: reporter intake + staff triage/resolution/dismissal + internal notes.
 */
export class ModerationReportService {
  constructor(private readonly repo = new ModerationReportRepository()) {}

  async createReport(actor: AuthActor, dto: CreateModerationReportDto) {
    await this.assertSubjectAndPermissions(actor, dto);

    const base = {
      reporter: { connect: { id: actor.userId } },
      subjectType: dto.subjectType,
      category: dto.category,
      description: dto.description.trim()
    } as const;

    switch (dto.subjectType) {
      case "USER":
        return this.repo.create({
          ...base,
          subjectUserId: dto.subjectUserId
        });
      case "JOB":
        return this.repo.create({
          ...base,
          subjectJobId: dto.subjectJobId
        });
      case "BID":
        return this.repo.create({
          ...base,
          subjectBidId: dto.subjectBidId
        });
      case "REVIEW":
        return this.repo.create({
          ...base,
          subjectReviewId: dto.subjectReviewId
        });
      case "MESSAGE_THREAD":
        return this.repo.create({
          ...base,
          subjectThreadId: dto.subjectThreadId
        });
      case "MESSAGE":
        return this.repo.create({
          ...base,
          subjectMessageId: dto.subjectMessageId
        });
      default: {
        const _exhaustive: never = dto;
        return _exhaustive;
      }
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
      subjectType: query.subjectType,
      assignedToStaffUserId: assignedFilter,
      unassignedOnly,
      q: query.q?.trim()
    });

    return { items, total, page: query.page, limit: query.limit };
  }

  async patchReport(actor: AuthActor, reportId: string, dto: PatchModerationReportDto) {
    ModerationPolicy.assertMayMutateReports(actor);
    const report = await this.repo.findById(reportId);
    if (!report) throw new NotFoundError("Report not found");

    if (dto.addNote) {
      ModerationPolicy.assertMayWriteReportNotes(actor);
      await this.repo.createNote({
        report: { connect: { id: reportId } },
        authorStaff: { connect: { id: actor.userId } },
        body: dto.addNote.trim()
      });
    }

    const shouldTouchReport =
      dto.status !== undefined ||
      dto.assignedToStaffUserId !== undefined ||
      dto.resolutionSummary !== undefined;

    if (!shouldTouchReport) {
      return this.repo.findByIdWithRelations(reportId);
    }

    const data: Prisma.ModerationReportUpdateInput = {
      statusUpdatedBy: { connect: { id: actor.userId } }
    };

    if (dto.resolutionSummary !== undefined) {
      data.resolutionSummary = dto.resolutionSummary ?? null;
    }

    if (dto.assignedToStaffUserId !== undefined) {
      if (dto.assignedToStaffUserId === null) {
        data.assignedToStaff = { disconnect: true };
      } else {
        const assignee = await db.user.findFirst({
          where: { id: dto.assignedToStaffUserId, deletedAt: null },
          select: { id: true, role: true }
        });
        if (!assignee) throw new NotFoundError("Assignee not found");
        ModerationPolicy.assertAssigneeMustBeStaff(assignee.role as UserRole);
        data.assignedToStaff = { connect: { id: assignee.id } };
      }
    }

    if (dto.status) {
      const status = dto.status as ModerationReportStatus;
      const { resolvedAt, dismissedAt } = timestampsForReportStatus(status);
      data.status = status;
      data.resolvedAt = resolvedAt;
      data.dismissedAt = dismissedAt;
    }

    await this.repo.update(reportId, data);
    return this.repo.findByIdWithRelations(reportId);
  }
}
