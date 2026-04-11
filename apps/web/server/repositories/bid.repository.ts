import { db } from "@acme/database";
import type { SubmitBidDto } from "@acme/validators";

export class BidRepository {
  async hasSubmittedToJob(jobId: string, freelancerProfileId: string): Promise<boolean> {
    const existing = await db.bid.findUnique({
      where: {
        jobId_freelancerId: {
          jobId,
          freelancerId: freelancerProfileId
        }
      },
      select: { id: true }
    });
    return Boolean(existing);
  }

  async createBid(freelancerProfileId: string, dto: SubmitBidDto) {
    return db.bid.create({
      data: {
        jobId: dto.jobId,
        freelancerId: freelancerProfileId,
        bidAmount: dto.bidAmount,
        coverLetter: dto.coverLetter,
        estimatedDays: dto.estimatedDays
      }
    });
  }
}
