import type { CreateVerificationRequestDto, StaffReviewVerificationDto } from "@acme/validators";
import { VerificationStatus, VerificationType } from "@acme/types";
import type { Prisma } from "@acme/database";
import { db } from "@acme/database";
import type { AuthActor } from "../domain/auth-actor";
import { DomainError, NotFoundError, PolicyDeniedError } from "../errors/domain-errors";
import { VerificationPolicy } from "../policies/verification.policy";
import { NotificationService } from "./notification.service";

const EVIDENCE_JSON_MAX_CHARS = 48_000;

function toVerificationType(type: CreateVerificationRequestDto["type"]): VerificationType {
  return type as VerificationType;
}

function serializeRequest(row: {
  id: string;
  userId: string;
  type: string;
  status: string;
  note: string | null;
  evidence: unknown;
  reviewedByUserId: string | null;
  reviewedAt: Date | null;
  reviewNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    status: row.status,
    note: row.note,
    evidence: row.evidence ?? null,
    reviewedByUserId: row.reviewedByUserId,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    reviewNote: row.reviewNote,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

/**
 * Freelancer verification intake (Prisma) and staff approve/reject with profile + notification updates.
 */
export class VerificationService {
  constructor(private readonly notifications = new NotificationService()) {}

  async listOwnRequests(actor: AuthActor) {
    VerificationPolicy.assertFreelancerMayUseSelfServiceVerification(actor);

    const rows = await db.verificationRequest.findMany({
      where: { userId: actor.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        userId: true,
        type: true,
        status: true,
        note: true,
        evidence: true,
        reviewedByUserId: true,
        reviewedAt: true,
        reviewNote: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return {
      userId: actor.userId,
      items: rows.map(serializeRequest)
    };
  }

  async createVerificationRequest(actor: AuthActor, input: CreateVerificationRequestDto) {
    VerificationPolicy.assertFreelancerMayUseSelfServiceVerification(actor);

    const profile = await db.freelancerProfile.findFirst({
      where: { userId: actor.userId, deletedAt: null },
      select: { id: true, verificationStatus: true }
    });
    if (!profile) {
      throw new PolicyDeniedError("A freelancer profile is required before requesting verification");
    }

    const vType = toVerificationType(input.type);
    const pendingSameType = await db.verificationRequest.findFirst({
      where: {
        userId: actor.userId,
        type: vType,
        status: VerificationStatus.PENDING
      },
      select: { id: true }
    });
    if (pendingSameType) {
      throw new DomainError(
        "A pending verification request already exists for this type",
        "DUPLICATE_VERIFICATION_REQUEST",
        409
      );
    }

    let evidenceJson: Prisma.InputJsonValue | undefined;
    if (input.evidence !== undefined) {
      const raw = JSON.stringify(input.evidence);
      if (raw.length > EVIDENCE_JSON_MAX_CHARS) {
        throw new DomainError("Evidence payload is too large", "EVIDENCE_TOO_LARGE", 400);
      }
      evidenceJson = input.evidence as Prisma.InputJsonValue;
    }

    const row = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.verificationRequest.create({
        data: {
          userId: actor.userId,
          type: vType,
          status: VerificationStatus.PENDING,
          note: input.note ?? null,
          evidence: evidenceJson ?? undefined
        },
        select: {
          id: true,
          userId: true,
          type: true,
          status: true,
          note: true,
          evidence: true,
          reviewedByUserId: true,
          reviewedAt: true,
          reviewNote: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (profile.verificationStatus !== VerificationStatus.VERIFIED) {
        await tx.freelancerProfile.update({
          where: { id: profile.id },
          data: { verificationStatus: VerificationStatus.PENDING }
        });
      }

      return created;
    });

    return serializeRequest(row);
  }

  async getRequestForActor(actor: AuthActor, requestId: string) {
    const row = await db.verificationRequest.findFirst({
      where: { id: requestId },
      select: {
        id: true,
        userId: true,
        type: true,
        status: true,
        note: true,
        evidence: true,
        reviewedByUserId: true,
        reviewedAt: true,
        reviewNote: true,
        createdAt: true,
        updatedAt: true
      }
    });
    if (!row) {
      throw new NotFoundError("Verification request not found");
    }

    VerificationPolicy.assertActorMayReadVerificationRequest(actor, row.userId);
    return serializeRequest(row);
  }

  async reviewVerificationRequest(
    actor: AuthActor,
    requestId: string,
    input: StaffReviewVerificationDto
  ) {
    VerificationPolicy.assertActorMayReviewVerificationRequest(actor);

    const row = await db.verificationRequest.findFirst({
      where: { id: requestId },
      select: {
        id: true,
        userId: true,
        type: true,
        status: true
      }
    });
    if (!row) {
      throw new NotFoundError("Verification request not found");
    }

    VerificationPolicy.assertVerificationRequestIsPending(row.status as VerificationStatus);

    const profile = await db.freelancerProfile.findFirst({
      where: { userId: row.userId, deletedAt: null },
      select: { id: true }
    });
    if (!profile) {
      throw new NotFoundError("Subject freelancer profile not found");
    }

    const nextRequestStatus =
      input.decision === "APPROVED" ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED;
    const nextProfileStatus =
      input.decision === "APPROVED" ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED;

    const updated = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const u = await tx.verificationRequest.update({
        where: { id: row.id },
        data: {
          status: nextRequestStatus,
          reviewedByUserId: actor.userId,
          reviewedAt: new Date(),
          reviewNote: input.note ?? null
        },
        select: {
          id: true,
          userId: true,
          type: true,
          status: true,
          note: true,
          evidence: true,
          reviewedByUserId: true,
          reviewedAt: true,
          reviewNote: true,
          createdAt: true,
          updatedAt: true
        }
      });

      await tx.freelancerProfile.update({
        where: { id: profile.id },
        data: { verificationStatus: nextProfileStatus }
      });

      return u;
    });

    await this.notifications.notifyVerificationOutcome({
      subjectUserId: row.userId,
      decision: input.decision,
      requestType: row.type,
      staffNote: input.note ?? null
    });

    return serializeRequest(updated);
  }
}
