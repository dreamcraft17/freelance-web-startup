import { db, Prisma } from "@acme/database";
import type {
  ModerationReport,
  ModerationReportNote,
  ModerationReportStatus,
  ModerationReportSubjectType
} from "@prisma/client";

export type ModerationReportListFilters = {
  status?: ModerationReportStatus;
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
        orderBy: { createdAt: "desc" },
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
