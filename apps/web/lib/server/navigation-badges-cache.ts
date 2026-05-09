import { cache } from "react";
import { MessageService } from "@/server/services/message.service";
import { NotificationService } from "@/server/services/notification.service";

const messages = new MessageService();
const notifications = new NotificationService();

/**
 * Per-request dedupe for nav badge queries (layout + MarketingShell + dashboard pages often
 * recomputed in the same RSC render). Avoids duplicate Prisma load against tight DB pools.
 */
export const getAwaitingReplyThreadCountCached = cache(async (userId: string) =>
  messages.countAwaitingReplyThreadsForUser(userId));

export const getUnreadNotificationCountCached = cache(async (userId: string) =>
  notifications.countUnreadForUser(userId));
