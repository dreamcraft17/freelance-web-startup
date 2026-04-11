import { db } from "@acme/database";
import type { CreateJobDto, UpdateJobDto } from "@acme/validators";
import { JobStatus, WorkMode } from "@acme/types";
import { NotFoundError } from "../errors/domain-errors";

function slugifyTitle(title: string): string {
  const base = title
    .slice(0, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base.length > 0 ? base : "job";
}

export class JobRepository {
  async requireOpenJobForBid(jobId: string) {
    const job = await db.job.findFirst({
      where: { id: jobId, deletedAt: null, status: JobStatus.OPEN },
      select: {
        id: true,
        status: true,
        workMode: true,
        bidDeadline: true
      }
    });

    if (!job) throw new NotFoundError("Job not found");

    return {
      id: job.id,
      status: job.status as JobStatus,
      workMode: job.workMode as WorkMode,
      bidDeadline: job.bidDeadline
    };
  }

  async requireOwnedJobForClient(jobId: string, clientProfileId: string) {
    const job = await db.job.findFirst({
      where: { id: jobId, clientProfileId, deletedAt: null },
      select: { id: true, clientProfileId: true }
    });

    if (!job) {
      throw new NotFoundError("Job not found");
    }

    return job;
  }

  async getOwnerUserId(jobId: string): Promise<string> {
    const job = await db.job.findFirst({
      where: { id: jobId, deletedAt: null },
      select: {
        clientProfile: { select: { userId: true } }
      }
    });

    if (!job?.clientProfile) {
      throw new NotFoundError("Job not found");
    }

    return job.clientProfile.userId;
  }

  /** Persists a new listing immediately visible for bidding (`OPEN`). */
  async createOpenJob(clientProfileId: string, dto: CreateJobDto) {
    const slug = `${slugifyTitle(dto.title)}-${Date.now().toString(36)}`;

    return db.job.create({
      data: {
        clientProfileId,
        categoryId: dto.categoryId,
        subcategoryId: dto.subcategoryId,
        title: dto.title,
        slug,
        description: dto.description,
        budgetType: dto.budgetType,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        currency: dto.currency,
        workMode: dto.workMode,
        city: dto.city,
        bidDeadline: dto.bidDeadline ? new Date(dto.bidDeadline) : undefined,
        status: JobStatus.OPEN
      }
    });
  }

  async findByIdPublic(jobId: string) {
    return db.job.findFirst({
      where: { id: jobId, deletedAt: null }
    });
  }

  async listPublicPaginated(params: { skip: number; take: number }) {
    const [items, total] = await Promise.all([
      db.job.findMany({
        where: { deletedAt: null, status: JobStatus.OPEN },
        orderBy: { createdAt: "desc" },
        skip: params.skip,
        take: params.take
      }),
      db.job.count({
        where: { deletedAt: null, status: JobStatus.OPEN }
      })
    ]);
    return { items, total };
  }

  async updatePartial(jobId: string, dto: UpdateJobDto) {
    const data: {
      title?: string;
      description?: string;
      status?: JobStatus;
    } = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.status !== undefined) data.status = dto.status as JobStatus;

    return db.job.update({
      where: { id: jobId },
      data
    });
  }

  async updateStatus(jobId: string, status: JobStatus) {
    return db.job.update({
      where: { id: jobId },
      data: { status }
    });
  }
}
