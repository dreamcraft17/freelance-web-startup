import { db } from "@acme/database";
import type { Prisma } from "@acme/database";
import { NotificationType } from "@acme/types";
import type { AuthActor } from "../domain/auth-actor";
import { NotFoundError } from "../errors/domain-errors";

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  payload?: Record<string, unknown>;
};

export class NotificationService {
  async createForUser(input: CreateNotificationInput) {
    const payload =
      input.payload === undefined ? undefined : (input.payload as Prisma.InputJsonValue);

    return db.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        payload
      },
      select: {
        id: true,
        userId: true,
        type: true,
        title: true,
        body: true,
        payload: true,
        readAt: true,
        createdAt: true
      }
    });
  }

  async notifyNewBid(params: {
    clientUserId: string;
    jobId: string;
    jobTitle: string;
    bidId: string;
    freelancerLabel: string;
  }) {
    await this.createForUser({
      userId: params.clientUserId,
      type: NotificationType.BID_SUBMITTED,
      title: "New bid on your job",
      body: `${params.freelancerLabel} submitted a bid on “${params.jobTitle}”.`,
      payload: { jobId: params.jobId, bidId: params.bidId }
    });
  }

  async notifyBidAccepted(params: {
    freelancerUserId: string;
    jobId: string;
    jobTitle: string;
    bidId: string;
    contractId: string;
  }) {
    await this.createForUser({
      userId: params.freelancerUserId,
      type: NotificationType.BID_ACCEPTED,
      title: "Your bid was accepted",
      body: `Your bid on “${params.jobTitle}” was accepted. A contract has been created.`,
      payload: { jobId: params.jobId, bidId: params.bidId, contractId: params.contractId }
    });
  }

  async notifyNewMessage(params: {
    recipientUserId: string;
    threadId: string;
    messageId: string;
    preview: string;
  }) {
    await this.createForUser({
      userId: params.recipientUserId,
      type: NotificationType.NEW_MESSAGE,
      title: "New message",
      body: params.preview,
      payload: { threadId: params.threadId, messageId: params.messageId }
    });
  }

  async listForActor(actor: AuthActor) {
    const rows = await db.notification.findMany({
      where: { userId: actor.userId, dismissedAt: null },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        payload: true,
        readAt: true,
        createdAt: true
      }
    });

    return {
      items: rows.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        payload: n.payload,
        readAt: n.readAt?.toISOString() ?? null,
        createdAt: n.createdAt.toISOString()
      }))
    };
  }

  async notifyVerificationOutcome(params: {
    subjectUserId: string;
    decision: "APPROVED" | "REJECTED";
    requestType: string;
    staffNote?: string | null;
  }) {
    const title =
      params.decision === "APPROVED" ? "Verification approved" : "Verification decision";
    const body =
      params.decision === "APPROVED"
        ? `Your ${params.requestType} verification was approved.`
        : `Your ${params.requestType} verification was rejected.${
            params.staffNote?.trim() ? ` ${params.staffNote.trim()}` : ""
          }`;
    await this.createForUser({
      userId: params.subjectUserId,
      type: NotificationType.VERIFICATION_UPDATED,
      title,
      body,
      payload: { decision: params.decision, type: params.requestType }
    });
  }

  async markNotificationAsRead(actor: AuthActor, notificationId: string) {
    const existing = await db.notification.findFirst({
      where: { id: notificationId, userId: actor.userId, dismissedAt: null },
      select: { id: true }
    });
    if (!existing) {
      throw new NotFoundError("Notification not found");
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() }
    });

    return { notificationId, read: true as const };
  }
}
