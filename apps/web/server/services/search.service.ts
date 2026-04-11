import type { SearchFreelancersQueryDto, SearchJobsQueryDto } from "@acme/validators";
import { AvailabilityStatus, JobStatus, WorkMode } from "@acme/types";
import { db, Prisma } from "@acme/database";
import { clampLimit, clampPage, offsetFromPage } from "@acme/utils";
import { isFreelancerBoostActiveAt, isJobFeaturedActiveAt } from "../lib/promotion-expiry";

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
  isFeatured: boolean;
  featuredUntil: string | null;
  /** True only when featured promotion is still within `featuredUntil` (if set). Matches ranking. */
  isFeaturedActive: boolean;
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
  availabilityStatus: AvailabilityStatus;
  createdAt: string;
  isFeatured: boolean;
  isBoosted: boolean;
  boostedUntil: string | null;
  /** True only when boost is still within `boostedUntil` (if set). Matches ranking. */
  isBoostedActive: boolean;
};

function parseWorkMode(value: string): WorkMode {
  switch (value) {
    case WorkMode.REMOTE:
    case WorkMode.ONSITE:
    case WorkMode.HYBRID:
      return value;
    default:
      throw new Error(`Unexpected workMode: ${value}`);
  }
}

function parseAvailabilityStatus(value: string): AvailabilityStatus {
  switch (value) {
    case AvailabilityStatus.AVAILABLE:
    case AvailabilityStatus.LIMITED:
    case AvailabilityStatus.UNAVAILABLE:
    case AvailabilityStatus.ON_LEAVE:
      return value;
    default:
      throw new Error(`Unexpected availabilityStatus: ${value}`);
  }
}

function num(v: { toString(): string } | null | undefined): number | null {
  if (v == null) return null;
  return Number(v);
}

function mapJob(
  row: {
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
    isFeatured: boolean;
    featuredUntil: Date | null;
  },
  now: Date
): JobSearchItem {
  const featuredUntilIso = row.featuredUntil?.toISOString() ?? null;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    budgetType: row.budgetType,
    budgetMin: num(row.budgetMin),
    budgetMax: num(row.budgetMax),
    currency: row.currency,
    workMode: parseWorkMode(row.workMode),
    city: row.city,
    categoryId: row.categoryId,
    subcategoryId: row.subcategoryId,
    bidDeadline: row.bidDeadline?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    isFeatured: row.isFeatured,
    featuredUntil: featuredUntilIso,
    isFeaturedActive: isJobFeaturedActiveAt(now, row.isFeatured, row.featuredUntil)
  };
}

function mapFreelancer(
  row: {
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
    isFeatured: boolean;
    isBoosted: boolean;
    boostedUntil: Date | null;
  },
  now: Date
): FreelancerSearchItem {
  return {
    id: row.id,
    userId: row.userId,
    username: row.username,
    fullName: row.fullName,
    headline: row.headline,
    workMode: parseWorkMode(row.workMode),
    city: row.city,
    country: row.country,
    hourlyRate: num(row.hourlyRate),
    availabilityStatus: parseAvailabilityStatus(row.availabilityStatus),
    createdAt: row.createdAt.toISOString(),
    isFeatured: row.isFeatured,
    isBoosted: row.isBoosted,
    boostedUntil: row.boostedUntil?.toISOString() ?? null,
    isBoostedActive: isFreelancerBoostActiveAt(now, row.isBoosted, row.boostedUntil)
  };
}

type JobSearchOptions = { publicVisibilityOnly: boolean };

export class SearchService {
  /**
   * Public job board + search API: featured (non-expired) first, then recency.
   */
  async searchJobs(input: SearchJobsQueryDto): Promise<{ items: JobSearchItem[]; total: number }> {
    return this.searchJobsInternal(input, { publicVisibilityOnly: false });
  }

  /**
   * Same ranking rules as {@link searchJobs}, restricted to `visibility = PUBLIC` (home/listing pages).
   */
  async listPublicOpenJobsPaginated(
    input: SearchJobsQueryDto
  ): Promise<{ items: JobSearchItem[]; total: number }> {
    return this.searchJobsInternal(input, { publicVisibilityOnly: true });
  }

  private async searchJobsInternal(
    input: SearchJobsQueryDto,
    opts: JobSearchOptions
  ): Promise<{ items: JobSearchItem[]; total: number }> {
    const page = clampPage(input.page);
    const limit = clampLimit(input.limit);
    const skip = offsetFromPage({ page, limit });
    const now = new Date();

    const parts: Prisma.Sql[] = [
      Prisma.sql`j."deletedAt" IS NULL`,
      Prisma.sql`j."status" = 'OPEN'::"JobStatus"`
    ];
    if (opts.publicVisibilityOnly) {
      parts.push(Prisma.sql`j."visibility" = 'PUBLIC'::"JobVisibility"`);
    }
    if (input.categoryId) {
      parts.push(Prisma.sql`j."categoryId" = ${input.categoryId}`);
    }
    if (input.workMode) {
      parts.push(Prisma.sql`j."workMode" = ${input.workMode}::"WorkMode"`);
    }
    if (input.city?.trim()) {
      const c = input.city.trim();
      parts.push(Prisma.sql`j."city" ILIKE ${"%" + c + "%"}`);
    }
    if (input.keyword?.trim()) {
      const q = `%${input.keyword.trim()}%`;
      parts.push(
        Prisma.sql`(j."title" ILIKE ${q} OR j."description" ILIKE ${q})`
      );
    }

    const whereSql = Prisma.join(parts, " AND ");

    const [rows, countRows] = await Promise.all([
      db.$queryRaw<
        {
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
          isFeatured: boolean;
          featuredUntil: Date | null;
        }[]
      >`
        SELECT
          j."id",
          j."title",
          j."slug",
          j."description",
          j."budgetType"::text AS "budgetType",
          j."budgetMin",
          j."budgetMax",
          j."currency",
          j."workMode"::text AS "workMode",
          j."city",
          j."categoryId",
          j."subcategoryId",
          j."bidDeadline",
          j."createdAt",
          j."isFeatured",
          j."featuredUntil"
        FROM "Job" j
        WHERE ${whereSql}
        ORDER BY
          -- Expired featured (until <= now) sort as 0; mirrors isJobFeaturedActiveAt()
          (
            CASE
              WHEN j."isFeatured" = true
                AND (j."featuredUntil" IS NULL OR j."featuredUntil" > ${now})
              THEN 1
              ELSE 0
            END
          ) DESC,
          j."createdAt" DESC
        LIMIT ${limit} OFFSET ${skip}
      `,
      db.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count
        FROM "Job" j
        WHERE ${whereSql}
      `
    ]);

    const total = Number(countRows[0]?.count ?? 0n);
    return {
      items: rows.map((r) => mapJob(r, now)),
      total
    };
  }

  /**
   * Freelancer directory: active boost first, then legacy featured flag, then recency.
   * Boost expiry uses `boostedUntil` vs `now` in SQL (same rules as {@link isFreelancerBoostActiveAt}).
   */
  async searchFreelancers(
    input: SearchFreelancersQueryDto
  ): Promise<{ items: FreelancerSearchItem[]; total: number }> {
    const page = clampPage(input.page);
    const limit = clampLimit(input.limit);
    const skip = offsetFromPage({ page, limit });
    const now = new Date();

    const parts: Prisma.Sql[] = [Prisma.sql`fp."deletedAt" IS NULL`];
    if (input.workMode) {
      parts.push(Prisma.sql`fp."workMode" = ${input.workMode}::"WorkMode"`);
    }
    if (input.city?.trim()) {
      const c = input.city.trim();
      parts.push(Prisma.sql`fp."city" ILIKE ${"%" + c + "%"}`);
    }
    if (input.categoryId) {
      parts.push(Prisma.sql`
        EXISTS (
          SELECT 1 FROM "FreelancerSkill" fs
          INNER JOIN "Skill" s ON s."id" = fs."skillId"
          WHERE fs."freelancerProfileId" = fp."id"
            AND s."categoryId" = ${input.categoryId}
            AND s."isActive" = true
        )
      `);
    }
    if (input.skillId) {
      parts.push(Prisma.sql`
        EXISTS (
          SELECT 1 FROM "FreelancerSkill" fs
          WHERE fs."freelancerProfileId" = fp."id"
            AND fs."skillId" = ${input.skillId}
        )
      `);
    }
    if (input.keyword?.trim()) {
      const q = `%${input.keyword.trim()}%`;
      parts.push(
        Prisma.sql`(fp."username" ILIKE ${q} OR fp."fullName" ILIKE ${q} OR fp."headline" ILIKE ${q} OR fp."bio" ILIKE ${q})`
      );
    }

    const whereSql = Prisma.join(parts, " AND ");

    const [rows, countRows] = await Promise.all([
      db.$queryRaw<
        {
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
          isFeatured: boolean;
          isBoosted: boolean;
          boostedUntil: Date | null;
        }[]
      >`
        SELECT
          fp."id",
          fp."userId",
          fp."username",
          fp."fullName",
          fp."headline",
          fp."workMode"::text AS "workMode",
          fp."city",
          fp."country",
          fp."hourlyRate",
          fp."availabilityStatus"::text AS "availabilityStatus",
          fp."createdAt",
          fp."isFeatured",
          fp."isBoosted",
          fp."boostedUntil"
        FROM "FreelancerProfile" fp
        WHERE ${whereSql}
        ORDER BY
          -- Expired boost sorts as 0; mirrors isFreelancerBoostActiveAt()
          (
            CASE
              WHEN fp."isBoosted" = true
                AND (fp."boostedUntil" IS NULL OR fp."boostedUntil" > ${now})
              THEN 1
              ELSE 0
            END
          ) DESC,
          (CASE WHEN fp."isFeatured" = true THEN 1 ELSE 0 END) DESC,
          fp."createdAt" DESC
        LIMIT ${limit} OFFSET ${skip}
      `,
      db.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count
        FROM "FreelancerProfile" fp
        WHERE ${whereSql}
      `
    ]);

    const total = Number(countRows[0]?.count ?? 0n);
    return {
      items: rows.map((r) => mapFreelancer(r, now)),
      total
    };
  }
}
