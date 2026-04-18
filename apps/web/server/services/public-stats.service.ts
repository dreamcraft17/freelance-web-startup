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
    // One interactive transaction = one pooled connection; avoids tripling
    // concurrent checkouts vs Promise.all (important for small pool_size caps).
    return db.$transaction(async (tx) => {
      const bidsLast24h = await tx.bid.count({ where: { createdAt: { gte: since24h } } });
      const freelancersAvailable = await tx.freelancerProfile.count({
        where: {
          deletedAt: null,
          availabilityStatus: AvailabilityStatus.AVAILABLE,
          user: { deletedAt: null }
        }
      });
      const openPublicJobs = await tx.job.count({
        where: {
          deletedAt: null,
          status: JobStatus.OPEN,
          visibility: JobVisibility.PUBLIC
        }
      });
      return { bidsLast24h, freelancersAvailable, openPublicJobs };
    });
  }
}
