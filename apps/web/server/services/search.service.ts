import type { SearchFreelancersQueryDto, SearchJobsQueryDto } from "@acme/validators";
import {
  AvailabilityStatus,
  BidStatus,
  JobStatus,
  JobVisibility,
  VerificationStatus,
  WorkMode
} from "@acme/types";
import { db, Prisma } from "@acme/database";
import { clampLimit, clampPage, offsetFromPage } from "@acme/utils";
import { isFreelancerBoostActiveAt, isJobFeaturedActiveAt } from "../lib/promotion-expiry";
import type { AppLocale } from "@/lib/i18n/types";
import {
  excludeSyntheticPublicFreelancersWhere,
  excludeSyntheticPublicJobsWhere,
  publicSyntheticListingsHidden
} from "@/lib/server/synthetic-public-content";

const FREELANCER_SEARCH_WORK_MODES = new Set<string>(["REMOTE", "ONSITE", "HYBRID"]);

/** Narrow runtime shapes so raw SQL never binds objects as jsonb (Postgres 42804). */
function sanitizeFreelancerSearchInput(input: SearchFreelancersQueryDto): SearchFreelancersQueryDto {
  const rawPage =
    typeof input.page === "number" && Number.isFinite(input.page) ? input.page : Number(input.page);
  const page = clampPage(Number.isFinite(rawPage) ? rawPage : 1);

  const rawLimit =
    typeof input.limit === "number" && Number.isFinite(input.limit) ? input.limit : Number(input.limit);
  const limit = clampLimit(Number.isFinite(rawLimit) ? rawLimit : 20);

  const keyword = typeof input.keyword === "string" ? input.keyword : undefined;
  const city = typeof input.city === "string" ? input.city : undefined;
  const categoryId = typeof input.categoryId === "string" ? input.categoryId : undefined;
  const skillId = typeof input.skillId === "string" ? input.skillId : undefined;

  let workMode: SearchFreelancersQueryDto["workMode"] = undefined;
  if (typeof input.workMode === "string" && FREELANCER_SEARCH_WORK_MODES.has(input.workMode)) {
    workMode = input.workMode as SearchFreelancersQueryDto["workMode"];
  }

  return { page, limit, keyword, city, workMode, categoryId, skillId };
}

/** Mirrors {@link buildFreelancerPublicWhereSql} for `count` — avoids embedding the same `Sql` twice in raw queries. */
function buildFreelancerDirectoryWhereInput(input: SearchFreelancersQueryDto): Prisma.FreelancerProfileWhereInput {
  const and: Prisma.FreelancerProfileWhereInput[] = [{ deletedAt: null }];

  if (input.workMode) {
    and.push({ workMode: input.workMode });
  }

  const cityTrimmed = input.city?.trim();
  if (cityTrimmed) {
    and.push({ city: { contains: cityTrimmed, mode: "insensitive" } });
  }

  if (input.categoryId?.trim()) {
    const categoryId = input.categoryId.trim();
    and.push({
      skills: { some: { skill: { categoryId, isActive: true } } }
    });
  }

  if (input.skillId?.trim()) {
    const skillId = input.skillId.trim();
    and.push({ skills: { some: { skillId } } });
  }

  const kwTrimmed = input.keyword?.trim();
  if (kwTrimmed) {
    and.push({
      OR: [
        { username: { contains: kwTrimmed, mode: "insensitive" } },
        { fullName: { contains: kwTrimmed, mode: "insensitive" } },
        { headline: { contains: kwTrimmed, mode: "insensitive" } },
        { bio: { contains: kwTrimmed, mode: "insensitive" } }
      ]
    });
  }

  const synthetic = excludeSyntheticPublicFreelancersWhere();
  if (synthetic) and.push(synthetic);

  return { AND: and };
}

/**
 * **`$queryRaw`:** digunakan hanya untuk pencarian **freelancer** (JOIN subquery ranking).
 * **Daftar job publik** (`listPublicOpenJobsPaginated`, `searchJobs`) memakai
 * **`db.job.findMany` + `db.job.count`** agar stabilitas query sama di dev/production.
 */

type JobSearchOptions = { publicVisibilityOnly: boolean; locale: AppLocale };

/**
 * Dynamic `WHERE` for freelancer directory raw SQL, built by chaining `Prisma.sql` fragments.
 * Avoids `Prisma.join` here: nesting `join` output inside `db.$queryRaw` has caused parameter
 * mis-binding (Postgres `42804` — boolean vs `jsonb`) in some Next/webpack builds.
 */
function buildFreelancerPublicWhereSql(input: SearchFreelancersQueryDto): Prisma.Sql {
  let clause = Prisma.sql`fp."deletedAt" IS NULL`;

  if (input.workMode) {
    clause = Prisma.sql`${clause} AND fp."workMode" = CAST(${input.workMode} AS "WorkMode")`;
  }

  const cityTrimmed = input.city?.trim();
  if (cityTrimmed) {
    clause = Prisma.sql`${clause} AND fp."city" ILIKE ${"%" + cityTrimmed + "%"}`;
  }

  const categoryId = input.categoryId?.trim();
  if (categoryId) {
    clause = Prisma.sql`${clause} AND EXISTS (
      SELECT 1 FROM "FreelancerSkill" fs
      INNER JOIN "Skill" s ON s."id" = fs."skillId"
      WHERE fs."freelancerProfileId" = fp."id"
        AND s."categoryId" = ${categoryId}
        AND s."isActive" = true
    )`;
  }

  const skillId = input.skillId?.trim();
  if (skillId) {
    clause = Prisma.sql`${clause} AND EXISTS (
      SELECT 1 FROM "FreelancerSkill" fs
      WHERE fs."freelancerProfileId" = fp."id"
        AND fs."skillId" = ${skillId}
    )`;
  }

  const kwTrimmed = input.keyword?.trim();
  if (kwTrimmed) {
    const a = "%" + kwTrimmed + "%";
    clause = Prisma.sql`${clause} AND (fp."username" ILIKE ${a} OR fp."fullName" ILIKE ${a} OR fp."headline" ILIKE ${a} OR fp."bio" ILIKE ${a})`;
  }

  if (publicSyntheticListingsHidden()) {
    clause = Prisma.sql`${clause} AND NOT (
      fp."username" ILIKE 'pw_%'
      OR fp."username" ILIKE 'e2e_%'
      OR fp."fullName" ILIKE '%playwright%'
      OR COALESCE(fp."headline"::text, '') ILIKE '%playwright%'
    )`;
  }

  return clause;
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

  const synthetic = excludeSyntheticPublicJobsWhere();
  if (synthetic) clauses.push(synthetic);

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
  /** Shortlisted proposals on this job (real count). */
  shortlistedCount: number;
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
  locale: AppLocale,
  shortlistedCount: number
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
    shortlistedCount,
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

    let shortlistedByJob = new Map<string, number>();
    if (rows.length > 0) {
      const jobIds = rows.map((r) => r.id);
      const shortGrouped = await db.bid.groupBy({
        by: ["jobId"],
        where: { jobId: { in: jobIds }, status: BidStatus.SHORTLISTED },
        _count: { id: true }
      });
      shortlistedByJob = new Map(shortGrouped.map((g) => [g.jobId, g._count.id]));
    }

    return {
      items: rows.map((r) => mapJob(r, now, opts.locale, shortlistedByJob.get(r.id) ?? 0)),
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
    const safe = sanitizeFreelancerSearchInput(input);
    const page = safe.page;
    const limit = safe.limit;
    const skip = offsetFromPage({ page, limit });
    const now = new Date();
    const whereSql = buildFreelancerPublicWhereSql(safe);

    const total = await db.freelancerProfile.count({
      where: buildFreelancerDirectoryWhereInput(safe)
    });

    const rows = await db.$queryRaw<
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
    >(Prisma.sql`
      SELECT
        fp."id",
        fp."userId",
        fp."username",
        fp."fullName",
        fp."headline",
        fc."primaryCategoryName",
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
      LEFT JOIN (
        SELECT DISTINCT ON (fs_sub."freelancerProfileId")
          fs_sub."freelancerProfileId",
          c_sub."name" AS "primaryCategoryName"
        FROM "FreelancerSkill" fs_sub
        INNER JOIN "Skill" s_sub ON s_sub."id" = fs_sub."skillId" AND s_sub."isActive" = true
        INNER JOIN "Category" c_sub ON c_sub."id" = s_sub."categoryId" AND c_sub."isActive" = true
        ORDER BY fs_sub."freelancerProfileId", c_sub."displayOrder" ASC NULLS LAST, c_sub."slug" ASC
      ) fc ON fc."freelancerProfileId" = fp."id"
      WHERE ${whereSql}
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
      LIMIT ${Number(limit)} OFFSET ${Number(skip)}
    `);

    return {
      items: rows.map((r) => mapFreelancer(r, now)),
      total
    };
  }
}
