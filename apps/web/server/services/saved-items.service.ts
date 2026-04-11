import { db } from "@acme/database";
import { JobStatus, JobVisibility } from "@acme/types";
import type { AuthActor } from "../domain/auth-actor";
import { NotFoundError } from "../errors/domain-errors";

const savableJobWhere = {
  deletedAt: null,
  status: JobStatus.OPEN,
  visibility: JobVisibility.PUBLIC
} as const;

/** Row shape returned by {@link SavedItemsService.listSavedJobs} (for UI typing). */
export type SavedJobListItem = {
  savedAt: string;
  job: {
    id: string;
    title: string;
    slug: string;
    description: string;
    budgetType: string;
    budgetMin: unknown;
    budgetMax: unknown;
    currency: string;
    workMode: string;
    city: string | null;
    status: string;
    visibility: string;
    deletedAt: Date | null;
  };
};

/** Row shape returned by {@link SavedItemsService.listSavedFreelancers} (for UI typing). */
export type SavedFreelancerListItem = {
  savedAt: string;
  freelancer: {
    id: string;
    username: string;
    fullName: string;
    headline: string | null;
    workMode: string;
    city: string | null;
    country: string | null;
    deletedAt: Date | null;
  };
};

export class SavedItemsService {
  private async requireSavableJob(jobId: string) {
    const job = await db.job.findFirst({
      where: { id: jobId, ...savableJobWhere },
      select: { id: true }
    });
    if (!job) throw new NotFoundError("Job is not available to save");
  }

  private async requireSavableFreelancerProfile(freelancerProfileId: string) {
    const profile = await db.freelancerProfile.findFirst({
      where: { id: freelancerProfileId, deletedAt: null },
      select: { id: true }
    });
    if (!profile) throw new NotFoundError("Freelancer profile not found");
  }

  async saveJob(actor: AuthActor, jobId: string) {
    await this.requireSavableJob(jobId);
    await db.savedJob.upsert({
      where: { userId_jobId: { userId: actor.userId, jobId } },
      create: { userId: actor.userId, jobId },
      update: {}
    });
    return { jobId, saved: true as const };
  }

  async unsaveJob(actor: AuthActor, jobId: string) {
    await db.savedJob.deleteMany({
      where: { userId: actor.userId, jobId }
    });
    return { jobId, saved: false as const };
  }

  async saveFreelancer(actor: AuthActor, freelancerProfileId: string) {
    await this.requireSavableFreelancerProfile(freelancerProfileId);
    await db.savedFreelancer.upsert({
      where: {
        userId_freelancerProfileId: { userId: actor.userId, freelancerProfileId }
      },
      create: { userId: actor.userId, freelancerProfileId },
      update: {}
    });
    return { freelancerProfileId, saved: true as const };
  }

  async unsaveFreelancer(actor: AuthActor, freelancerProfileId: string) {
    await db.savedFreelancer.deleteMany({
      where: { userId: actor.userId, freelancerProfileId }
    });
    return { freelancerProfileId, saved: false as const };
  }

  async listSavedJobIds(actor: AuthActor) {
    const rows = await db.savedJob.findMany({
      where: { userId: actor.userId },
      select: { jobId: true },
      orderBy: { createdAt: "desc" }
    });
    return { jobIds: rows.map((r) => r.jobId) };
  }

  async listSavedFreelancerProfileIds(actor: AuthActor) {
    const rows = await db.savedFreelancer.findMany({
      where: { userId: actor.userId },
      select: { freelancerProfileId: true },
      orderBy: { createdAt: "desc" }
    });
    return { freelancerProfileIds: rows.map((r) => r.freelancerProfileId) };
  }

  async listSavedJobs(actor: AuthActor): Promise<{ items: SavedJobListItem[] }> {
    const rows = await db.savedJob.findMany({
      where: { userId: actor.userId },
      orderBy: { createdAt: "desc" },
      include: {
        job: {
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
            status: true,
            visibility: true,
            deletedAt: true
          }
        }
      }
    });

    return {
      items: rows.map((row) => ({
        savedAt: row.createdAt.toISOString(),
        job: row.job
      })) satisfies SavedJobListItem[]
    };
  }

  async listSavedFreelancers(actor: AuthActor): Promise<{ items: SavedFreelancerListItem[] }> {
    const rows = await db.savedFreelancer.findMany({
      where: { userId: actor.userId },
      orderBy: { createdAt: "desc" },
      include: {
        freelancerProfile: {
          select: {
            id: true,
            username: true,
            fullName: true,
            headline: true,
            workMode: true,
            city: true,
            country: true,
            deletedAt: true
          }
        }
      }
    });

    return {
      items: rows.map((row) => ({
        savedAt: row.createdAt.toISOString(),
        freelancer: row.freelancerProfile
      })) satisfies SavedFreelancerListItem[]
    };
  }
}
