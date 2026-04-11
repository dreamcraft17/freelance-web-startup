import type { AuthActor } from "../domain/auth-actor";

export class SavedItemsService {
  async saveJob(_actor: AuthActor, jobId: string) {
    return { jobId, saved: true as const };
  }

  async unsaveJob(_actor: AuthActor, jobId: string) {
    return { jobId, saved: false as const };
  }

  async saveFreelancer(_actor: AuthActor, freelancerProfileId: string) {
    return { freelancerProfileId, saved: true as const };
  }

  async unsaveFreelancer(_actor: AuthActor, freelancerProfileId: string) {
    return { freelancerProfileId, saved: false as const };
  }

  async listSavedJobs(_actor: AuthActor) {
    return { items: [] as const };
  }

  async listSavedFreelancers(_actor: AuthActor) {
    return { items: [] as const };
  }
}
