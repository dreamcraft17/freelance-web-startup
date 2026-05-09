import type { SearchFreelancersQueryDto, SearchJobsQueryDto } from "@acme/validators";
import { AvailabilityStatus, JobStatus, JobVisibility, VerificationStatus, WorkMode } from "@acme/types";
import { db, Prisma } from "@acme/database";
import { clampLimit, clampPage, offsetFromPage } from "@acme/utils";
import { isFreelancerBoostActiveAt, isJobFeaturedActiveAt } from "../lib/promotion-expiry";
import type { AppLocale } from "@/lib/i18n/types";

/**
 * **`$queryRaw`:** digunakan hanya untuk pencarian **freelancer** (JOIN subquery ranking).
 * **Daftar job publik** (`listPublicOpenJobsPaginated`, `searchJobs`) memakai
 * **`db.job.findMany` + `db.job.count`** agar stabilitas query sama di dev/production.
 */

/** Empty sibling fragment for freelancer optional filters only. */
const SQL_NOOP_FP_WHERE = Prisma.sql``;

type JobSearchOptions = { publicVisibilityOnly: boolean; locale: AppLocale };

type FreelancerListingWhereFragments = {
  wfWorkMode: Prisma.Sql;
  wfCity: Prisma.Sql;
  wfCategory: Prisma.Sql;
  wfSkill: Prisma.Sql;
  wfKeyword: Prisma.Sql;
};

function buildFreelancerListingWhereFragments(
  input: SearchFreelancersQueryDto
): FreelancerListingWhereFragments {
  const wfWorkMode = input.workMode
    ? Prisma.sql` AND fp."workMode" = ${input.workMode}::"WorkMode"`
    : SQL_NOOP_FP_WHERE;

  const cityTrimmed = input.city?.trim();
  const wfCity = cityTrimmed
    ? Prisma.sql` AND fp."city" ILIKE ${"%" + cityTrimmed + "%"}`
    : SQL_NOOP_FP_WHERE;

  const wfCategory = input.categoryId
    ? Prisma.sql`
        AND EXISTS (
          SELECT 1 FROM "FreelancerSkill" fs
          INNER JOIN "Skill" s ON s."id" = fs."skillId"
          WHERE fs."freelancerProfileId" = fp."id"
            AND s."categoryId" = ${input.categoryId}
            AND s."isActive" = true
        )
      `
    : SQL_NOOP_FP_WHERE;

  const wfSkill = input.skillId
    ? Prisma.sql`
        AND EXISTS (
          SELECT 1 FROM "FreelancerSkill" fs
          WHERE fs."freelancerProfileId" = fp."id"
            AND fs."skillId" = ${input.skillId}
        )
      `
    : SQL_NOOP_FP_WHERE;

  const kwTrimmed = input.keyword?.trim();
  const wfKeyword = kwTrimmed
    ? Prisma.sql` AND (fp."username" ILIKE ${"%" + kwTrimmed + "%"} OR fp."fullName" ILIKE ${"%" + kwTrimmed + "%"} OR fp."headline" ILIKE ${"%" + kwTrimmed + "%"} OR fp."bio" ILIKE ${"%" + kwTrimmed + "%"})`
    : SQL_NOOP_FP_WHERE;

  return { wfWorkMode, wfCity, wfCategory, wfSkill, wfKeyword };
}

/** Open jobs listing filters for public discovery APIs (moderation-visible only). */
function buildJobsListingWhere(
  input: SearchJobsQueryDto,
  opts: JobSearchOptions,
  now: Date
): Prisma.JobWhereInput {
  const clauses: Prisma.JobWhereInput[] = [
    { deletedAt: null },
    { status: JobStatus.OPEN },
    { moderationHiddenAt: null }
  ];

  if (opts.publicVisibilityOnly) {
    clauses.push({ visibility: JobVisibility.PUBLIC });
  }

  if (input.categoryId?.trim()) {
    clauses.push({ categoryId: input.categoryId.trim() });
  }

  if (input.workMode) {
    clauses.push({ workMode: input.workMode });
  }

  const cityTrimmed = input.city?.trim();
  if (cityTrimmed) {
    clauses.push({
      city: { contains: cityTrimmed, mode: "insensitive" }
    });
  }

  if (input.minBudget != null && Number.isFinite(input.minBudget)) {
    clauses.push({
      OR: [{ budgetMax: null }, { budgetMax: { gte: input.minBudget } }]
    });
  }

  if (input.maxBudget != null && Number.isFinite(input.maxBudget)) {
    clauses.push({
      OR: [{ budgetMin: null }, { budgetMin: { lte: input.maxBudget } }]
    });
  }

  if (input.postedWithinDays != null && Number.isFinite(input.postedWithinDays)) {
    const days = Math.max(1, Math.min(30, Math.trunc(input.postedWithinDays)));
    const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    clauses.push({ createdAt: { gte: since } });
  }

  const kw = input.keyword?.trim();
  if (kw) {
    const mode = "insensitive" as const;
    clauses.push({
      OR: [
        { title: { contains: kw, mode } },
        { description: { contains: kw, mode } },
        { titleEn: { contains: kw, mode } },
        { titleId: { contains: kw, mode } },
        { descriptionEn: { contains: kw, mode } },
        { descriptionId: { contains: kw, mode } }
      ]
    });
  }

  return { AND: clauses };
}

const JOB_LIST_SELECT = {
  id: true,
  title: true,
  titleEn: true,
  titleId: true,
  slug: true,
  description: true,
  descriptionEn: true,
  descriptionId: true,
  language: true,
  budgetType: true,
  budgetMin: true,
  budgetMax: true,
  currency: true,
  workMode: true,
  city: true,
  categoryId: true,
  subcategoryId: true,
  bidDeadline: true,
  createdAt: true,
  isFeatured: true,
  featuredUntil: true,
  clientProfile: {
    select: {
      displayName: true,
      companyName: true,
      verificationStatus: true
    }
  },
  _count: {
    select: { bids: true }
  },
  skills: {
    take: 5,
    orderBy: { createdAt: "asc" },
    select: {
      skill: { select: { name: true } }
    }
  }
} satisfies Prisma.JobSelect;

export type JobSearchItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  translationSource: AppLocale;
  isTranslated: boolean;
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
  /** Display label from client profile (company name preferred). */
  clientDisplayName: string;
  clientVerified: boolean;
  /** Open proposals on this job (real count). */
  bidCount: number;
  /** Skill names attached to the job listing (limited). */
  skillNames: string[];
};

export type FreelancerSearchItem = {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  headline: string | null;
  /** First active skill category name (display order), for directory cards. */
  primaryCategoryName: string | null;
  workMode: WorkMode;
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  hourlyRate: number | null;
  availabilityStatus: AvailabilityStatus;
  reviewCount: number;
  averageReviewRating: number | null;
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
  row: Prisma.JobGetPayload<{ select: typeof JOB_LIST_SELECT }>,
  now: Date,
  locale: AppLocale
): JobSearchItem {
  const featuredUntilIso = row.featuredUntil?.toISOString() ?? null;
  const source = row.language === "id" ? "id" : "en";
  const preferredTitle = locale === "id" ? row.titleId : row.titleEn;
  const preferredDescription = locale === "id" ? row.descriptionId : row.descriptionEn;
  const company = row.clientProfile.companyName?.trim();
  const display = row.clientProfile.displayName.trim();
  const clientDisplayName = (company && company.length > 0 ? company : display) || display;
  const clientVerified = row.clientProfile.verificationStatus === VerificationStatus.VERIFIED;
  const skillNames = row.skills.map((s) => s.skill.name).filter((n) => n && n.trim().length > 0);
  return {
    id: row.id,
    title: preferredTitle ?? row.title,
    slug: row.slug,
    description: preferredDescription ?? row.description,
    translationSource: source,
    isTranslated: locale !== source && Boolean(preferredTitle && preferredDescription),
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
    isFeaturedActive: isJobFeaturedActiveAt(now, row.isFeatured, row.featuredUntil),
    clientDisplayName,
    clientVerified,
    bidCount: row._count.bids,
    skillNames
  };
}

function mapFreelancer(
  row: {
    id: string;
    userId: string;
    username: string;
    fullName: string;
    headline: string | null;
    primaryCategoryName: string | null;
    workMode: string;
    city: string | null;
    country: string | null;
    lat: { toString(): string } | null;
    lng: { toString(): string } | null;
    hourlyRate: { toString(): string } | null;
    availabilityStatus: string;
    reviewCount: number | bigint;
    averageReviewRating: number | { toString(): string } | null;
    createdAt: Date;
    isFeatured: boolean;
    isBoosted: boolean;
    boostedUntil: Date | null;
  },
  now: Date
): FreelancerSearchItem {
  const rc = typeof row.reviewCount === "bigint" ? Number(row.reviewCount) : row.reviewCount;
  const ar =
    row.averageReviewRating == null
      ? null
      : typeof row.averageReviewRating === "number"
        ? row.averageReviewRating
        : Number(row.averageReviewRating);
  return {
    id: row.id,
    userId: row.userId,
    username: row.username,
    fullName: row.fullName,
    headline: row.headline,
    primaryCategoryName: row.primaryCategoryName,
    workMode: parseWorkMode(row.workMode),
    city: row.city,
    country: row.country,
    lat: num(row.lat),
    lng: num(row.lng),
    hourlyRate: num(row.hourlyRate),
    availabilityStatus: parseAvailabilityStatus(row.availabilityStatus),
    reviewCount: Number.isFinite(rc) ? rc : 0,
    averageReviewRating: ar != null && Number.isFinite(ar) ? ar : null,
    createdAt: row.createdAt.toISOString(),
    isFeatured: row.isFeatured,
    isBoosted: row.isBoosted,
    boostedUntil: row.boostedUntil?.toISOString() ?? null,
    isBoostedActive: isFreelancerBoostActiveAt(now, row.isBoosted, row.boostedUntil)
  };
}

export class SearchService {
  /**
   * Job board + search API: ordered by **`createdAt` descending** (Prisma listing; ranking can be enriched later).
   */
  async searchJobs(input: SearchJobsQueryDto): Promise<{ items: JobSearchItem[]; total: number }> {
    return this.searchJobsInternal(input, { publicVisibilityOnly: false, locale: "en" });
  }

  /**
   * Same filters and ordering as {@link searchJobs}, restricted to `visibility = PUBLIC` (home/API listing).
   */
  async listPublicOpenJobsPaginated(
    input: SearchJobsQueryDto,
    locale: AppLocale = "en"
  ): Promise<{ items: JobSearchItem[]; total: number }> {
    return this.searchJobsInternal(input, { publicVisibilityOnly: true, locale });
  }

  private async searchJobsInternal(
    input: SearchJobsQueryDto,
    opts: JobSearchOptions
  ): Promise<{ items: JobSearchItem[]; total: number }> {
    const page = clampPage(input.page);
    const limit = clampLimit(input.limit);
    const skip = offsetFromPage({ page, limit });
    const now = new Date();

    const where = buildJobsListingWhere(input, opts, now);

    // Sequential count → findMany: avoids holding 2 pool connections at once (session poolers
    // e.g. `pool_size: 15` / EMAXCONNSESSION under parallel page loads).
    const total = await db.job.count({ where });
    const rows = await db.job.findMany({
      where,
      select: JOB_LIST_SELECT,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip
    });

    return {
      items: rows.map((r) => mapJob(r, now, opts.locale)),
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

    const fw = buildFreelancerListingWhereFragments(input);

    const listSql = db.$queryRaw<
      {
        id: string;
        userId: string;
        username: string;
        fullName: string;
        headline: string | null;
        primaryCategoryName: string | null;
        workMode: string;
        city: string | null;
        country: string | null;
        lat: { toString(): string } | null;
        lng: { toString(): string } | null;
        hourlyRate: { toString(): string } | null;
        availabilityStatus: string;
        reviewCount: number | bigint;
        averageReviewRating: number | { toString(): string } | null;
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
          (
            SELECT c."name"
            FROM "FreelancerSkill" fs
            INNER JOIN "Skill" s ON s."id" = fs."skillId" AND s."isActive" = true
            INNER JOIN "Category" c ON c."id" = s."categoryId" AND c."isActive" = true
            WHERE fs."freelancerProfileId" = fp."id"
            ORDER BY c."displayOrder" ASC, c."slug" ASC
            LIMIT 1
          ) AS "primaryCategoryName",
          fp."workMode"::text AS "workMode",
          fp."city",
          fp."country",
          fp."lat",
          fp."lng",
          fp."hourlyRate",
          fp."availabilityStatus"::text AS "availabilityStatus",
          fp."reviewCount",
          fp."averageReviewRating",
          fp."createdAt",
          fp."isFeatured",
          fp."isBoosted",
          fp."boostedUntil"
        FROM "FreelancerProfile" fp
        WHERE
          fp."deletedAt" IS NULL
          ${fw.wfWorkMode}
          ${fw.wfCity}
          ${fw.wfCategory}
          ${fw.wfSkill}
          ${fw.wfKeyword}
        ORDER BY
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
      `;
    const countSql = db.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count
        FROM "FreelancerProfile" fp
        WHERE
          fp."deletedAt" IS NULL
          ${fw.wfWorkMode}
          ${fw.wfCity}
          ${fw.wfCategory}
          ${fw.wfSkill}
          ${fw.wfKeyword}
      `;
    const countRows = await countSql;
    const rows = await listSql;

    const total = Number(countRows[0]?.count ?? 0n);
    return {
      items: rows.map((r) => mapFreelancer(r, now)),
      total
    };
  }
}
