import type { SearchFreelancersQueryDto, SearchJobsQueryDto } from "@acme/validators";
import { JobStatus, WorkMode } from "@acme/types";
import type { Prisma } from "@acme/database";
import { db } from "@acme/database";
import { clampLimit, clampPage, offsetFromPage } from "@acme/utils";

export type JobSearchItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  budgetType: string;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  workMode: WorkMode;
  city: string | null;
  categoryId: string;
  subcategoryId: string | null;
  bidDeadline: string | null;
  createdAt: string;
};

export type FreelancerSearchItem = {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  headline: string | null;
  workMode: WorkMode;
  city: string | null;
  country: string | null;
  hourlyRate: number | null;
  availabilityStatus: string;
  createdAt: string;
};

function num(v: { toString(): string } | null | undefined): number | null {
  if (v == null) return null;
  return Number(v);
}

function mapJob(row: {
  id: string;
  title: string;
  slug: string;
  description: string;
  budgetType: string;
  budgetMin: { toString(): string } | null;
  budgetMax: { toString(): string } | null;
  currency: string;
  workMode: string;
  city: string | null;
  categoryId: string;
  subcategoryId: string | null;
  bidDeadline: Date | null;
  createdAt: Date;
}): JobSearchItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    budgetType: row.budgetType,
    budgetMin: num(row.budgetMin),
    budgetMax: num(row.budgetMax),
    currency: row.currency,
    workMode: row.workMode as WorkMode,
    city: row.city,
    categoryId: row.categoryId,
    subcategoryId: row.subcategoryId,
    bidDeadline: row.bidDeadline?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString()
  };
}

function mapFreelancer(row: {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  headline: string | null;
  workMode: string;
  city: string | null;
  country: string | null;
  hourlyRate: { toString(): string } | null;
  availabilityStatus: string;
  createdAt: Date;
}): FreelancerSearchItem {
  return {
    id: row.id,
    userId: row.userId,
    username: row.username,
    fullName: row.fullName,
    headline: row.headline,
    workMode: row.workMode as WorkMode,
    city: row.city,
    country: row.country,
    hourlyRate: num(row.hourlyRate),
    availabilityStatus: row.availabilityStatus,
    createdAt: row.createdAt.toISOString()
  };
}

export class SearchService {
  async searchJobs(input: SearchJobsQueryDto): Promise<{ items: JobSearchItem[]; total: number }> {
    const page = clampPage(input.page);
    const limit = clampLimit(input.limit);
    const skip = offsetFromPage({ page, limit });

    const base: Prisma.JobWhereInput = {
      deletedAt: null,
      status: JobStatus.OPEN
    };

    if (input.categoryId) {
      base.categoryId = input.categoryId;
    }
    if (input.workMode) {
      base.workMode = input.workMode;
    }
    if (input.city?.trim()) {
      base.city = { contains: input.city.trim(), mode: "insensitive" };
    }
    if (input.keyword?.trim()) {
      const q = input.keyword.trim();
      base.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } }
      ];
    }

    const [rows, total] = await Promise.all([
      db.job.findMany({
        where: base,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          budgetType: true,
          budgetMin: true,
          budgetMax: true,
          currency: true,
          workMode: true,
          city: true,
          categoryId: true,
          subcategoryId: true,
          bidDeadline: true,
          createdAt: true
        }
      }),
      db.job.count({ where: base })
    ]);

    return {
      items: rows.map(mapJob),
      total
    };
  }

  async searchFreelancers(
    input: SearchFreelancersQueryDto
  ): Promise<{ items: FreelancerSearchItem[]; total: number }> {
    const page = clampPage(input.page);
    const limit = clampLimit(input.limit);
    const skip = offsetFromPage({ page, limit });

    const andFilters: Prisma.FreelancerProfileWhereInput[] = [];

    if (input.categoryId) {
      andFilters.push({
        skills: {
          some: {
            skill: {
              categoryId: input.categoryId,
              isActive: true
            }
          }
        }
      });
    }
    if (input.skillId) {
      andFilters.push({
        skills: {
          some: { skillId: input.skillId }
        }
      });
    }
    if (input.keyword?.trim()) {
      const q = input.keyword.trim();
      andFilters.push({
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { fullName: { contains: q, mode: "insensitive" } },
          { headline: { contains: q, mode: "insensitive" } },
          { bio: { contains: q, mode: "insensitive" } }
        ]
      });
    }

    const base: Prisma.FreelancerProfileWhereInput = {
      deletedAt: null,
      ...(input.workMode ? { workMode: input.workMode } : {}),
      ...(input.city?.trim() ? { city: { contains: input.city.trim(), mode: "insensitive" } } : {}),
      ...(andFilters.length > 0 ? { AND: andFilters } : {})
    };

    const [rows, total] = await Promise.all([
      db.freelancerProfile.findMany({
        where: base,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          userId: true,
          username: true,
          fullName: true,
          headline: true,
          workMode: true,
          city: true,
          country: true,
          hourlyRate: true,
          availabilityStatus: true,
          createdAt: true
        }
      }),
      db.freelancerProfile.count({ where: base })
    ]);

    return {
      items: rows.map(mapFreelancer),
      total
    };
  }
}
