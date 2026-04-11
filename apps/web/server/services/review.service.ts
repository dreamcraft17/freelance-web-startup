import { db } from "@acme/database";
import type { Prisma } from "@acme/database";
import { ContractStatus, ReviewTargetType } from "@acme/types";
import type { CreateReviewDto } from "@acme/validators";
import type { AuthActor } from "../domain/auth-actor";
import { NotFoundError, PolicyDeniedError } from "../errors/domain-errors";
import { ReviewPolicy } from "../policies/review.policy";

function isPrismaUniqueViolation(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: string }).code === "P2002"
  );
}

export class ReviewService {
  private async refreshFreelancerAggregate(tx: Prisma.TransactionClient, freelancerProfileId: string) {
    const agg = await tx.review.aggregate({
      where: { targetFreelancerProfileId: freelancerProfileId },
      _avg: { rating: true },
      _count: { _all: true }
    });
    await tx.freelancerProfile.update({
      where: { id: freelancerProfileId },
      data: {
        reviewCount: agg._count._all,
        averageReviewRating: agg._avg.rating ?? null
      }
    });
  }

  private async refreshClientAggregate(tx: Prisma.TransactionClient, clientProfileId: string) {
    const agg = await tx.review.aggregate({
      where: { targetClientProfileId: clientProfileId },
      _avg: { rating: true },
      _count: { _all: true }
    });
    await tx.clientProfile.update({
      where: { id: clientProfileId },
      data: {
        reviewCount: agg._count._all,
        averageReviewRating: agg._avg.rating ?? null
      }
    });
  }

  async createReview(actor: AuthActor, input: CreateReviewDto) {
    ReviewPolicy.assertActorMayWriteReview(actor);

    const contract = await db.contract.findFirst({
      where: { id: input.contractId, deletedAt: null },
      select: {
        id: true,
        status: true,
        clientUserId: true,
        freelancerUserId: true
      }
    });
    if (!contract) throw new NotFoundError("Contract not found");

    const participants = {
      clientUserId: contract.clientUserId,
      freelancerUserId: contract.freelancerUserId,
      status: contract.status as ContractStatus
    };

    /** Must match contract lifecycle: reviews only after {@link ContractService.completeContract}. */
    ReviewPolicy.assertContractEligibleForReview(participants);
    ReviewPolicy.assertActorIsContractParticipant(actor.userId, participants);
    ReviewPolicy.assertTargetTypeMatchesParticipant(actor.userId, participants, input.targetType);

    const [clientProfile, freelancerProfile] = await Promise.all([
      db.clientProfile.findFirst({
        where: { userId: contract.clientUserId, deletedAt: null },
        select: { id: true }
      }),
      db.freelancerProfile.findFirst({
        where: { userId: contract.freelancerUserId, deletedAt: null },
        select: { id: true }
      })
    ]);
    if (!clientProfile || !freelancerProfile) {
      throw new NotFoundError("Contract participant profile not found");
    }

    const targetIsFreelancer = input.targetType === ReviewTargetType.FREELANCER;

    try {
      const review = await db.$transaction(async (tx) => {
        const row = await tx.review.create({
          data: {
            contractId: contract.id,
            authorUserId: actor.userId,
            targetType: input.targetType,
            rating: input.rating,
            comment: input.comment,
            ...(targetIsFreelancer
              ? {
                  targetFreelancerUserId: contract.freelancerUserId,
                  targetFreelancerProfileId: freelancerProfile.id,
                  targetClientUserId: null,
                  targetClientProfileId: null
                }
              : {
                  targetClientUserId: contract.clientUserId,
                  targetClientProfileId: clientProfile.id,
                  targetFreelancerUserId: null,
                  targetFreelancerProfileId: null
                })
          },
          select: {
            id: true,
            contractId: true,
            targetType: true,
            rating: true,
            comment: true,
            createdAt: true
          }
        });

        if (targetIsFreelancer) {
          await this.refreshFreelancerAggregate(tx, freelancerProfile.id);
        } else {
          await this.refreshClientAggregate(tx, clientProfile.id);
        }

        return row;
      });

      return {
        id: review.id,
        contractId: review.contractId,
        targetType: review.targetType,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString()
      };
    } catch (e) {
      if (isPrismaUniqueViolation(e)) {
        throw new PolicyDeniedError("You have already submitted a review for this party on this contract");
      }
      throw e;
    }
  }

  async listForFreelancerProfile(freelancerProfileId: string) {
    const profile = await db.freelancerProfile.findFirst({
      where: { id: freelancerProfileId, deletedAt: null },
      select: { id: true, reviewCount: true, averageReviewRating: true }
    });
    if (!profile) throw new NotFoundError("Freelancer profile not found");

    const items = await db.review.findMany({
      where: { targetFreelancerProfileId: freelancerProfileId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true
      }
    });

    return {
      target: "FREELANCER" as const,
      profileId: profile.id,
      aggregate: {
        reviewCount: profile.reviewCount,
        averageReviewRating: profile.averageReviewRating
      },
      items: items.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString()
      }))
    };
  }

  async listForClientProfile(clientProfileId: string) {
    const profile = await db.clientProfile.findFirst({
      where: { id: clientProfileId, deletedAt: null },
      select: { id: true, reviewCount: true, averageReviewRating: true }
    });
    if (!profile) throw new NotFoundError("Client profile not found");

    const items = await db.review.findMany({
      where: { targetClientProfileId: clientProfileId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true
      }
    });

    return {
      target: "CLIENT" as const,
      profileId: profile.id,
      aggregate: {
        reviewCount: profile.reviewCount,
        averageReviewRating: profile.averageReviewRating
      },
      items: items.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString()
      }))
    };
  }
}
