import type { CreateJobDto, SearchJobsQueryDto, UpdateJobDto } from "@acme/validators";
import type { AuthActor } from "../domain/auth-actor";
import { JobStatus } from "@acme/types";
import { JobRepository } from "../repositories/job.repository";
import { ClientRepository } from "../repositories/client.repository";
import { JobPolicy } from "../policies/job.policy";
import type { JobSearchItem } from "./search.service";
import { SearchService } from "./search.service";
import { PaymentService } from "./payment.service";

export { MONETIZATION_PRICING_PLACEHOLDER } from "./subscription.service";

/** Legacy list row shape (Decimal-like budget fields) for pages that still expect Prisma-style numbers. */
export type OpenJobListItem = {
  id: string;
  title: string;
  description: string;
  budgetType: string;
  budgetMin: { toString(): string } | null;
  budgetMax: { toString(): string } | null;
  currency: string;
  workMode: string;
  city: string | null;
  isFeatured: boolean;
  featuredUntil: Date | null;
  /** Matches search ranking: true only while `featuredUntil` is unset or in the future. */
  isFeaturedActive: boolean;
};

function decShim(n: number | null): { toString(): string } | null {
  if (n == null || !Number.isFinite(n)) return null;
  return { toString: () => String(n) };
}

function jobSearchItemToOpenListItem(j: JobSearchItem): OpenJobListItem {
  return {
    id: j.id,
    title: j.title,
    description: j.description,
    budgetType: j.budgetType,
    budgetMin: decShim(j.budgetMin),
    budgetMax: decShim(j.budgetMax),
    currency: j.currency,
    workMode: j.workMode,
    city: j.city,
    isFeatured: j.isFeatured,
    featuredUntil: j.featuredUntil ? new Date(j.featuredUntil) : null,
    isFeaturedActive: j.isFeaturedActive
  };
}

/**
 * Job lifecycle orchestration. Authorization via {@link JobPolicy} only.
 */
export class JobService {
  constructor(
    private readonly jobRepo = new JobRepository(),
    private readonly clientRepo = new ClientRepository(),
    private readonly searchService = new SearchService(),
    private readonly payments = new PaymentService()
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

  async listOpenJobs(query: SearchJobsQueryDto): Promise<{ items: OpenJobListItem[]; total: number }> {
    const { items, total } = await this.searchService.listPublicOpenJobsPaginated(query);
    return { items: items.map(jobSearchItemToOpenListItem), total };
  }

  async updateJob(actor: AuthActor, jobId: string, dto: UpdateJobDto) {
    JobPolicy.assertActorMayPerformClientWrites(actor);
    const ownerUserId = await this.jobRepo.getOwnerUserId(jobId);
    JobPolicy.assertClientOwnsJob(actor, ownerUserId);
    return this.jobRepo.updatePartial(jobId, dto);
  }

  /**
   * Client purchases featured placement for their job (mock payment: intent **SUCCEEDED** immediately).
   * Duration defaults from `@acme/config` **MONETIZATION_PRICING_PLACEHOLDER.jobFeaturedDefaultDays** (optional override param for future API).
   */
  async purchaseFeaturedJob(actor: AuthActor, jobId: string, durationDays?: number) {
    JobPolicy.assertActorMayPerformClientWrites(actor);
    const ownerUserId = await this.jobRepo.getOwnerUserId(jobId);
    JobPolicy.assertClientOwnsJob(actor, ownerUserId);
    return this.payments.simulateSuccessfulJobFeaturedPurchase({
      payerUserId: actor.userId,
      jobId,
      durationDays
    });
  }
}
