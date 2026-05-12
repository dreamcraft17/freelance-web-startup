import { db } from "@acme/database";
import { AvailabilityStatus, BidStatus, ContractStatus, JobStatus, JobVisibility } from "@acme/types";
import {
  excludeSyntheticPublicFreelancersWhere,
  excludeSyntheticPublicJobsWhere,
  mergeFreelancerWhere,
  mergeJobWhere
} from "@/lib/server/synthetic-public-content";

/** Open + public + not moderation-hidden; merges automation/E2E title filter on Vercel. */
function jobOpenPublicWhere() {
  return mergeJobWhere(
    {
      deletedAt: null,
      status: JobStatus.OPEN,
      visibility: JobVisibility.PUBLIC,
      moderationHiddenAt: null
    },
    excludeSyntheticPublicJobsWhere()
  );
}

function freelancerAvailablePublicWhere() {
  return mergeFreelancerWhere(
    {
      deletedAt: null,
      availabilityStatus: AvailabilityStatus.AVAILABLE,
      user: { deletedAt: null }
    },
    excludeSyntheticPublicFreelancersWhere()
  );
}

/** DB-backed marketplace aggregates (no invented metrics). */
export type MarketplaceMomentumSnapshot = {
  bidsLast24h: number;
  freelancersAvailable: number;
  openPublicJobs: number;
  /** Open public roles created in the last 24 hours. */
  jobsPostedLast24h: number;
  /** Contracts marked completed in the last 7 days (market-wide). */
  contractsCompletedLast7d: number;
  /** Categories with the most open public listings (top few). */
  hotCategories: Array<{ id: string; name: string; openJobCount: number }>;
};

/** Lightweight, read-only aggregates for public “marketplace pulse” copy (no PII). */
export class PublicStatsService {
  /**
   * Runs pulse counts + hero listing queries in **one** interactive transaction so public pages
   * (`/jobs`, `/freelancers`) do not open two concurrent DB sessions (important when the pooler
   * enforces a low `pool_size`, e.g. EMAXCONNSESSION / max clients reached).
   */
  async getPulseAndHeroForPublicBrowse(): Promise<{
    pulse: {
      bidsLast24h: number;
      freelancersAvailable: number;
      openPublicJobs: number;
    };
    momentum: MarketplaceMomentumSnapshot;
    heroPanelActivity: Awaited<ReturnType<PublicStatsService["getHeroPanelActivity"]>>;
  }> {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const openJobWhere = jobOpenPublicWhere();
    const openFreelancerWhere = freelancerAvailablePublicWhere();

    return db.$transaction(async (tx) => {
      const bidsLast24h = await tx.bid.count({
        where: {
          createdAt: { gte: since24h },
          job: openJobWhere
        }
      });
      const freelancersAvailable = await tx.freelancerProfile.count({
        where: openFreelancerWhere
      });
      const openPublicJobs = await tx.job.count({
        where: openJobWhere
      });
      const jobsPostedLast24h = await tx.job.count({
        where: mergeJobWhere(
          {
            deletedAt: null,
            status: JobStatus.OPEN,
            visibility: JobVisibility.PUBLIC,
            moderationHiddenAt: null,
            createdAt: { gte: since24h }
          },
          excludeSyntheticPublicJobsWhere()
        )
      });
      const contractsCompletedLast7d = await tx.contract.count({
        where: {
          deletedAt: null,
          status: ContractStatus.COMPLETED,
          updatedAt: { gte: since7d }
        }
      });

      const catGrouped = await tx.job.groupBy({
        by: ["categoryId"],
        where: openJobWhere,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5
      });
      const catIds = catGrouped.map((g) => g.categoryId).filter(Boolean);
      const catRows =
        catIds.length === 0
          ? []
          : await tx.category.findMany({
              where: { id: { in: catIds } },
              select: { id: true, name: true }
            });
      const catNameById = new Map(catRows.map((c) => [c.id, c.name]));
      const hotCategories = catGrouped.map((g) => ({
        id: g.categoryId,
        name: catNameById.get(g.categoryId)?.trim() || "",
        openJobCount: g._count.id
      }));

      const momentum: MarketplaceMomentumSnapshot = {
        bidsLast24h,
        freelancersAvailable,
        openPublicJobs,
        jobsPostedLast24h,
        contractsCompletedLast7d,
        hotCategories
      };

      const freelancers = await tx.freelancerProfile.findMany({
        where: openFreelancerWhere,
        orderBy: { updatedAt: "desc" },
        take: 2,
        select: {
          fullName: true,
          headline: true,
          city: true,
          workMode: true,
          availabilityStatus: true
        }
      });

      const jobs = await tx.job.findMany({
        where: openJobWhere,
        orderBy: { createdAt: "desc" },
        take: 2,
        select: {
          title: true,
          city: true,
          workMode: true,
          createdAt: true
        }
      });

      const recentBids = await tx.bid.findMany({
        where: {
          status: { not: BidStatus.WITHDRAWN },
          job: openJobWhere
        },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          createdAt: true,
          freelancer: { select: { fullName: true } },
          job: { select: { title: true } }
        }
      });

      return {
        pulse: { bidsLast24h, freelancersAvailable, openPublicJobs },
        momentum,
        heroPanelActivity: {
          freelancerRows: freelancers.map((item) => ({
            title: item.fullName,
            specialty: item.headline,
            location: item.city,
            workMode: item.workMode,
            availability: item.availabilityStatus
          })),
          jobRows: jobs.map((item) => ({
            title: item.title,
            location: item.city,
            workMode: item.workMode,
            createdAt: item.createdAt.toISOString()
          })),
          proposalRows: recentBids.map((b) => ({
            freelancerName: b.freelancer.fullName,
            jobTitle: b.job.title,
            createdAt: b.createdAt.toISOString()
          }))
        }
      };
    });
  }

  async getHeroPanelActivity(): Promise<{
    freelancerRows: Array<{
      title: string;
      specialty: string | null;
      location: string | null;
      workMode: string;
      availability: string;
    }>;
    jobRows: Array<{
      title: string;
      location: string | null;
      workMode: string;
      createdAt: string;
    }>;
    /** Recent proposal events (real bids only). */
    proposalRows: Array<{
      freelancerName: string;
      jobTitle: string;
      createdAt: string;
    }>;
  }> {
    const openJobWhere = jobOpenPublicWhere();
    const openFreelancerWhere = freelancerAvailablePublicWhere();

    return db.$transaction(async (tx) => {
      const freelancers = await tx.freelancerProfile.findMany({
        where: openFreelancerWhere,
        orderBy: { updatedAt: "desc" },
        take: 2,
        select: {
          fullName: true,
          headline: true,
          city: true,
          workMode: true,
          availabilityStatus: true
        }
      });

      const jobs = await tx.job.findMany({
        where: openJobWhere,
        orderBy: { createdAt: "desc" },
        take: 2,
        select: {
          title: true,
          city: true,
          workMode: true,
          createdAt: true
        }
      });

      const recentBids = await tx.bid.findMany({
        where: {
          status: { not: BidStatus.WITHDRAWN },
          job: openJobWhere
        },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          createdAt: true,
          freelancer: { select: { fullName: true } },
          job: { select: { title: true } }
        }
      });

      return {
        freelancerRows: freelancers.map((item) => ({
          title: item.fullName,
          specialty: item.headline,
          location: item.city,
          workMode: item.workMode,
          availability: item.availabilityStatus
        })),
        jobRows: jobs.map((item) => ({
          title: item.title,
          location: item.city,
          workMode: item.workMode,
          createdAt: item.createdAt.toISOString()
        })),
        proposalRows: recentBids.map((b) => ({
          freelancerName: b.freelancer.fullName,
          jobTitle: b.job.title,
          createdAt: b.createdAt.toISOString()
        }))
      };
    });
  }

  /**
   * Compact momentum snapshot for dashboards / landing (single transaction).
   * Prefer {@link getPulseAndHeroForPublicBrowse} when the page already loads hero panels.
   */
  async getMarketplaceMomentumSnapshot(): Promise<MarketplaceMomentumSnapshot> {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const openJobWhere = jobOpenPublicWhere();
    const openFreelancerWhere = freelancerAvailablePublicWhere();

    return db.$transaction(async (tx) => {
      const bidsLast24h = await tx.bid.count({
        where: {
          createdAt: { gte: since24h },
          job: openJobWhere
        }
      });
      const freelancersAvailable = await tx.freelancerProfile.count({
        where: openFreelancerWhere
      });
      const openPublicJobs = await tx.job.count({
        where: openJobWhere
      });
      const jobsPostedLast24h = await tx.job.count({
        where: mergeJobWhere(
          {
            deletedAt: null,
            status: JobStatus.OPEN,
            visibility: JobVisibility.PUBLIC,
            moderationHiddenAt: null,
            createdAt: { gte: since24h }
          },
          excludeSyntheticPublicJobsWhere()
        )
      });
      const contractsCompletedLast7d = await tx.contract.count({
        where: {
          deletedAt: null,
          status: ContractStatus.COMPLETED,
          updatedAt: { gte: since7d }
        }
      });

      const catGrouped = await tx.job.groupBy({
        by: ["categoryId"],
        where: openJobWhere,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5
      });
      const catIds = catGrouped.map((g) => g.categoryId).filter(Boolean);
      const catRows =
        catIds.length === 0
          ? []
          : await tx.category.findMany({
              where: { id: { in: catIds } },
              select: { id: true, name: true }
            });
      const catNameById = new Map(catRows.map((c) => [c.id, c.name]));
      const hotCategories = catGrouped.map((g) => ({
        id: g.categoryId,
        name: catNameById.get(g.categoryId)?.trim() || "",
        openJobCount: g._count.id
      }));

      return {
        bidsLast24h,
        freelancersAvailable,
        openPublicJobs,
        jobsPostedLast24h,
        contractsCompletedLast7d,
        hotCategories
      };
    });
  }
}
