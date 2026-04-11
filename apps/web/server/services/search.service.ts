import type { SearchFreelancersQueryDto, SearchJobsQueryDto } from "@acme/validators";

/**
 * Query construction and ranking will delegate to repositories + FTS / search engine later.
 */
export class SearchService {
  async searchFreelancers(_input: SearchFreelancersQueryDto) {
    return { items: [] as const, total: 0 };
  }

  async searchJobs(_input: SearchJobsQueryDto) {
    return { items: [] as const, total: 0 };
  }
}
