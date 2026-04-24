import type { SearchFreelancersQueryDto, SearchJobsQueryDto } from "@acme/validators";
import { AvailabilityStatus, JobStatus, WorkMode } from "@acme/types";
import { db, Prisma } from "@acme/database";
import { clampLimit, clampPage, offsetFromPage } from "@acme/utils";
import { isFreelancerBoostActiveAt, isJobFeaturedActiveAt } from "../lib/promotion-expiry";
import type { AppLocale } from "@/lib/i18n/types";

/**
 * Prisma raw-query safety: this file is the only `$queryRaw` usage in the repo.
 * User-controlled filters are passed only as `${}` values inside {@link Prisma.sql}
 * fragments, then combined with {@link Prisma.join} — PostgreSQL receives bound
 * parameters (no string-built SQL from request input). Do not switch to
 * `$queryRawUnsafe` / string templates with embedded user text.
 */

type JobColumnSupport = {
  language: boolean;
  titleEn: boolean;
  titleId: boolean;
  descriptionEn: boolean;
  descriptionId: boolean;
};

let jobColumnSupportPromise: Promise<JobColumnSupport> | null = null;

async function getJobColumnSupport(): Promise<JobColumnSupport> {
  if (jobColumnSupportPromise) return jobColumnSupportPromise;
  jobColumnSupportPromise = (async () => {
    const rows = await db.$queryRaw<{ column_name: string }[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'Job'
        AND column_name IN ('language', 'titleEn', 'titleId', 'descriptionEn', 'descriptionId')
    `;
    const existing = new Set(rows.map((r) => r.column_name));
    return {
      language: existing.has("language"),
      titleEn: existing.has("titleEn"),
      titleId: existing.has("titleId"),
      descriptionEn: existing.has("descriptionEn"),
      descriptionId: existing.has("descriptionId")
    };
  })();
  return jobColumnSupportPromise;
}

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
  row: {
    id: string;
    title: string;
    titleEn: string | null;
    titleId: string | null;
    slug: string;
    description: string;
    descriptionEn: string | null;
    descriptionId: string | null;
    language: string;
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
  now: Date,
  locale: AppLocale
): JobSearchItem {
  const featuredUntilIso = row.featuredUntil?.toISOString() ?? null;
  const source = row.language === "id" ? "id" : "en";
  const preferredTitle = locale === "id" ? row.titleId : row.titleEn;
  const preferredDescription = locale === "id" ? row.descriptionId : row.descriptionEn;
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

type JobSearchOptions = { publicVisibilityOnly: boolean; locale: AppLocale };

export class SearchService {
  /**
   * Public job board + search API: featured (non-expired) first, then recency.
   */
  async searchJobs(input: SearchJobsQueryDto): Promise<{ items: JobSearchItem[]; total: number }> {
    return this.searchJobsInternal(input, { publicVisibilityOnly: false, locale: "en" });
  }

  /**
   * Same ranking rules as {@link searchJobs}, restricted to `visibility = PUBLIC` (home/listing pages).
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
    const col = await getJobColumnSupport();

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
    if (input.minBudget != null && Number.isFinite(input.minBudget)) {
      parts.push(Prisma.sql`j."budgetMax" IS NULL OR j."budgetMax" >= ${input.minBudget}`);
    }
    if (input.maxBudget != null && Number.isFinite(input.maxBudget)) {
      parts.push(Prisma.sql`j."budgetMin" IS NULL OR j."budgetMin" <= ${input.maxBudget}`);
    }
    if (input.postedWithinDays != null && Number.isFinite(input.postedWithinDays)) {
      const days = Math.max(1, Math.min(30, Math.trunc(input.postedWithinDays)));
      const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      parts.push(Prisma.sql`j."createdAt" >= ${since}`);
    }
    if (input.keyword?.trim()) {
      const q = `%${input.keyword.trim()}%`;
      const keywordParts: Prisma.Sql[] = [
        Prisma.sql`j."title" ILIKE ${q}`,
        Prisma.sql`j."description" ILIKE ${q}`
      ];
      if (col.titleEn) keywordParts.push(Prisma.sql`j."titleEn" ILIKE ${q}`);
      if (col.titleId) keywordParts.push(Prisma.sql`j."titleId" ILIKE ${q}`);
      if (col.descriptionEn) keywordParts.push(Prisma.sql`j."descriptionEn" ILIKE ${q}`);
      if (col.descriptionId) keywordParts.push(Prisma.sql`j."descriptionId" ILIKE ${q}`);
      parts.push(Prisma.sql`(${Prisma.join(keywordParts, " OR ")})`);
    }

    const whereSql = Prisma.join(parts, " AND ");

    const rows = await db.$queryRaw<
      {
        id: string;
        title: string;
        titleEn: string | null;
        titleId: string | null;
        slug: string;
        description: string;
        descriptionEn: string | null;
        descriptionId: string | null;
        language: string;
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
          ${col.titleEn ? Prisma.sql`j."titleEn"` : Prisma.sql`NULL::text`} AS "titleEn",
          ${col.titleId ? Prisma.sql`j."titleId"` : Prisma.sql`NULL::text`} AS "titleId",
          j."slug",
          j."description",
          ${col.descriptionEn ? Prisma.sql`j."descriptionEn"` : Prisma.sql`NULL::text`} AS "descriptionEn",
          ${col.descriptionId ? Prisma.sql`j."descriptionId"` : Prisma.sql`NULL::text`} AS "descriptionId",
          ${col.language ? Prisma.sql`j."language"` : Prisma.sql`'en'::text`} AS "language",
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
      `;
    const countRows = await db.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM "Job" j
      WHERE ${whereSql}
    `;

    const total = Number(countRows[0]?.count ?? 0n);
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
