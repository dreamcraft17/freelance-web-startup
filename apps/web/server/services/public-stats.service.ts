import { db } from "@acme/database";
import { AvailabilityStatus, JobStatus, JobVisibility } from "@acme/types";

/** Lightweight, read-only aggregates for public “marketplace pulse” copy (no PII). */
export class PublicStatsService {
  async getMarketplacePulse(): Promise<{
    bidsLast24h: number;
    freelancersAvailable: number;
    openPublicJobs: number;
  }> {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [bidsLast24h, freelancersAvailable, openPublicJobs] = await Promise.all([
      db.bid.count({ where: { createdAt: { gte: since24h } } }),
      db.freelancerProfile.count({
        where: {
          deletedAt: null,
          availabilityStatus: AvailabilityStatus.AVAILABLE,
          user: { deletedAt: null }
        }
      }),
      db.job.count({
        where: {
          deletedAt: null,
          status: JobStatus.OPEN,
          visibility: JobVisibility.PUBLIC
        }
      })
    ]);
    return { bidsLast24h, freelancersAvailable, openPublicJobs };
  }
}
