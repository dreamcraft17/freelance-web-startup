import type { CreateJobDto, SearchJobsQueryDto, UpdateJobDto } from "@acme/validators";
import type { AuthActor } from "../domain/auth-actor";
import { JobStatus } from "@acme/types";
import { JobRepository } from "../repositories/job.repository";
import { ClientRepository } from "../repositories/client.repository";
import { JobPolicy } from "../policies/job.policy";
import { clampLimit, clampPage, offsetFromPage } from "@acme/utils";

/**
 * Job lifecycle orchestration. Authorization via {@link JobPolicy} only.
 */
export class JobService {
  constructor(
    private readonly jobRepo = new JobRepository(),
    private readonly clientRepo = new ClientRepository()
  ) {}

  async createDraftJob(actor: AuthActor, dto: CreateJobDto) {
    JobPolicy.assertActorMayPerformClientWrites(actor);
    const clientProfileId = await this.clientRepo.requireClientProfileIdForUser(actor.userId);
    return this.jobRepo.createOpenJob(clientProfileId, dto);
  }

  async closeJob(actor: AuthActor, jobId: string) {
    JobPolicy.assertActorMayPerformClientWrites(actor);
    const ownerUserId = await this.jobRepo.getOwnerUserId(jobId);
    JobPolicy.assertClientOwnsJob(actor, ownerUserId);
    return this.jobRepo.updateStatus(jobId, JobStatus.CLOSED);
  }

  /** Open, public-visibility job with category, subcategory, and client summary for listing/detail UIs. */
  async getJobByIdForPublic(jobId: string) {
    return this.jobRepo.findByIdPublic(jobId);
  }

  async listOpenJobs(query: SearchJobsQueryDto) {
    const page = clampPage(query.page);
    const limit = clampLimit(query.limit);
    const skip = offsetFromPage({ page, limit });
    return this.jobRepo.listPublicPaginated({ skip, take: limit });
  }

  async updateJob(actor: AuthActor, jobId: string, dto: UpdateJobDto) {
    JobPolicy.assertActorMayPerformClientWrites(actor);
    const ownerUserId = await this.jobRepo.getOwnerUserId(jobId);
    JobPolicy.assertClientOwnsJob(actor, ownerUserId);
    return this.jobRepo.updatePartial(jobId, dto);
  }
}
