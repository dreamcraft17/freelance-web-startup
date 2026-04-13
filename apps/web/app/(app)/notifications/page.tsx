import { redirect } from "next/navigation";
import { getSessionFromCookies, sessionToActor } from "@src/lib/auth";
import {
  NotificationsCenter,
  type NotificationListItem
} from "@/components/notifications/NotificationsCenter";
import { NotificationService } from "@/server/services/notification.service";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?returnUrl=/notifications");
  }

  const actor = sessionToActor(session);
  const { items } = await new NotificationService().listForActor(actor);

  const list: NotificationListItem[] = items.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    payload: n.payload,
    readAt: n.readAt,
    createdAt: n.createdAt
  }));

  return (
    <div className="mx-auto max-w-xl space-y-8 pb-12">
      <header className="border-b border-slate-200/70 pb-6">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">NearWork</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-[1.65rem]">
          Notifications
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
          One place for bids, messages, verification, and billing—unread items stay highlighted until you open them.
        </p>
      </header>

      <NotificationsCenter items={list} />
    </div>
  );
}
