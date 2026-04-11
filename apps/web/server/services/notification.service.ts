import { NotificationType } from "@acme/types";
import type { AuthActor } from "../domain/auth-actor";
import { PolicyDeniedError } from "../errors/domain-errors";

/**
 * Fan-out to email/push workers later; DB writes for in-app notifications TODO.
 */
export class NotificationService {
  async listForActor(_actor: AuthActor) {
    return { items: [] as const };
  }

  async createForUser(_userId: string, _type: NotificationType, _payload?: Record<string, unknown>) {
    // TODO: insert Notification row + enqueue worker
    return { ok: true as const };
  }

  async markNotificationAsRead(actor: AuthActor, notificationId: string) {
    // TODO: load notification by id; assert actor.userId === notification.userId
    if (!notificationId) {
      throw new PolicyDeniedError("Invalid notification");
    }
    return { userId: actor.userId, notificationId, read: true as const };
  }
}
