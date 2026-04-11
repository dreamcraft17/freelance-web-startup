import { BidStatus } from "@acme/types";
import type { Prisma } from "@acme/database";
import { db } from "@acme/database";
import type { SubmitBidDto } from "@acme/validators";
import { PolicyDeniedError } from "../errors/domain-errors";

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

  /**
   * Inserts a bid with `SUBMITTED` status. Duplicate `(jobId, freelancerId)` is blocked inside a transaction
   * so concurrent requests cannot bypass {@link BidPolicy.assertNoExistingBidForJob}.
   */
  async createBid(freelancerProfileId: string, dto: SubmitBidDto) {
    try {
      return await db.$transaction(async (tx: Prisma.TransactionClient) => {
        const existing = await tx.bid.findUnique({
          where: {
            jobId_freelancerId: {
              jobId: dto.jobId,
              freelancerId: freelancerProfileId
            }
          },
          select: { id: true }
        });
        if (existing) {
          throw new PolicyDeniedError("You have already submitted a bid for this job");
        }

        return tx.bid.create({
          data: {
            jobId: dto.jobId,
            freelancerId: freelancerProfileId,
            bidAmount: dto.bidAmount,
            coverLetter: dto.coverLetter,
            estimatedDays: dto.estimatedDays,
            status: BidStatus.SUBMITTED
          }
        });
      });
    } catch (e) {
      if (
        typeof e === "object" &&
        e !== null &&
        "code" in e &&
        (e as { code: string }).code === "P2002"
      ) {
        throw new PolicyDeniedError("You have already submitted a bid for this job");
      }
      throw e;
    }
  }
}
