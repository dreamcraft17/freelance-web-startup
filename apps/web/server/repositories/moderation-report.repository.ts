import {
  db,
  Prisma,
  type ModerationReport,
  type ModerationReportNote,
  type ModerationReportPriority,
  type ModerationReportStatus,
  type ModerationReportSubjectType
} from "@acme/database";

export type ModerationReportListFilters = {
  status?: ModerationReportStatus;
  priority?: ModerationReportPriority;
  attention?: "overdue" | "escalated";
  subjectType?: ModerationReportSubjectType;
  assignedToStaffUserId?: string;
  unassignedOnly?: boolean;
  q?: string;
  page: number;
  limit: number;
};

export class ModerationReportRepository {
  async create(data: Prisma.ModerationReportCreateInput): Promise<ModerationReport> {
    return db.moderationReport.create({ data });
  }

  async findById(id: string): Promise<ModerationReport | null> {
    return db.moderationReport.findFirst({ where: { id } });
  }

  async findByIdWithRelations(id: string) {
    return db.moderationReport.findFirst({
      where: { id },
      include: {
        reporter: { select: { id: true, email: true, role: true } },
        assignedToStaff: { select: { id: true, email: true, role: true } },
        statusUpdatedBy: { select: { id: true, email: true, role: true } },
        notes: {
          orderBy: { createdAt: "asc" },
          include: { authorStaff: { select: { id: true, email: true, role: true } } }
        }
      }
    });
  }

  async list(filters: ModerationReportListFilters): Promise<{ items: unknown[]; total: number }> {
    const skip = (filters.page - 1) * filters.limit;
    const where: Prisma.ModerationReportWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.attention === "overdue") {
      where.status = { in: ["OPEN", "IN_REVIEW"] };
      where.slaDueAt = { lt: new Date() };
    } else if (filters.attention === "escalated") {
      where.escalationLevel = { gt: 0 };
    }
    if (filters.subjectType) where.subjectType = filters.subjectType;
    if (filters.unassignedOnly) {
      where.assignedToStaffUserId = null;
    } else if (filters.assignedToStaffUserId) {
      where.assignedToStaffUserId = filters.assignedToStaffUserId;
    }

    if (filters.q?.trim()) {
      const q = filters.q.trim();
      where.OR = [
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { id: { contains: q, mode: "insensitive" } }
      ];
    }

    const [items, total] = await Promise.all([
      db.moderationReport.findMany({
        where,
        orderBy: [{ escalationLevel: "desc" }, { slaDueAt: "asc" }, { createdAt: "desc" }],
        skip,
        take: filters.limit,
        include: {
          reporter: { select: { id: true, email: true, role: true } },
          assignedToStaff: { select: { id: true, email: true, role: true } },
          _count: { select: { notes: true } }
        }
      }),
      db.moderationReport.count({ where })
    ]);

    return { items, total };
  }

  async getQueueStats(now = new Date()) {
    const active = { status: { in: ["OPEN", "IN_REVIEW"] as ModerationReportStatus[] } };
    const [open, overdue, escalated, unassigned] = await Promise.all([
      db.moderationReport.count({ where: active }),
      db.moderationReport.count({ where: { ...active, slaDueAt: { lt: now } } }),
      db.moderationReport.count({ where: { ...active, escalationLevel: { gt: 0 } } }),
      db.moderationReport.count({ where: { ...active, assignedToStaffUserId: null } })
    ]);
    return { open, overdue, escalated, unassigned };
  }

  async update(id: string, data: Prisma.ModerationReportUpdateInput): Promise<ModerationReport> {
    return db.moderationReport.update({
      where: { id },
      data
    });
  }

  async createNote(data: Prisma.ModerationReportNoteCreateInput): Promise<ModerationReportNote> {
    return db.moderationReportNote.create({ data });
  }
}
