"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { NotificationType } from "@acme/types";
import { fetchWithCsrf } from "@/features/auth/lib/fetch-with-csrf";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Bell,
  Briefcase,
  CheckCircle2,
  CreditCard,
  FileText,
  Inbox,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Star
} from "lucide-react";

export type NotificationListItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  payload: unknown;
  readAt: string | null;
  createdAt: string;
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(d);
}

function linkForNotification(item: NotificationListItem): string | null {
  const p = item.payload;
  if (!p || typeof p !== "object") return null;
  const o = p as Record<string, unknown>;
  if (typeof o.threadId === "string") return `/messages?thread=${encodeURIComponent(o.threadId)}`;
  if (typeof o.jobId === "string") return `/jobs/${encodeURIComponent(o.jobId)}`;
  return null;
}

function TypeIcon({ type }: { type: string }) {
  const common = "h-5 w-5 shrink-0";
  switch (type) {
    case NotificationType.NEW_MESSAGE:
      return <MessageSquare className={cn(common, "text-[#3525cd]")} aria-hidden />;
    case NotificationType.BID_SUBMITTED:
    case NotificationType.BID_SHORTLISTED:
      return <Briefcase className={cn(common, "text-slate-700")} aria-hidden />;
    case NotificationType.BID_ACCEPTED:
      return <CheckCircle2 className={cn(common, "text-emerald-600")} aria-hidden />;
    case NotificationType.CONTRACT_STARTED:
      return <FileText className={cn(common, "text-slate-700")} aria-hidden />;
    case NotificationType.REVIEW_RECEIVED:
      return <Star className={cn(common, "text-amber-600")} aria-hidden />;
    case NotificationType.VERIFICATION_UPDATED:
      return <ShieldCheck className={cn(common, "text-slate-700")} aria-hidden />;
    case NotificationType.BILLING_UPDATED:
      return <CreditCard className={cn(common, "text-slate-700")} aria-hidden />;
    case NotificationType.ADMIN_MODERATION_EVENT:
      return <AlertCircle className={cn(common, "text-amber-700")} aria-hidden />;
    default:
      return <Bell className={cn(common, "text-slate-500")} aria-hidden />;
  }
}

type NotificationsCenterProps = {
  items: NotificationListItem[];
};

export function NotificationsCenter({ items }: NotificationsCenterProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { unread, read } = useMemo(() => {
    const u: NotificationListItem[] = [];
    const r: NotificationListItem[] = [];
    for (const n of items) {
      if (n.readAt == null) u.push(n);
      else r.push(n);
    }
    return { unread: u, read: r };
  }, [items]);

  async function handleActivate(n: NotificationListItem) {
    const href = linkForNotification(n);
    setLoadingId(n.id);
    try {
      if (n.readAt == null) {
        const res = await fetchWithCsrf(`/api/notifications/${n.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true })
        });
        if (res.ok) router.refresh();
      }
      if (href) router.push(href as Route);
      else if (n.readAt == null) router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-1 shadow-sm ring-1 ring-slate-900/[0.02]">
        <DashboardEmptyState
          tone="elevated"
          kicker="Notifications"
          icon={Inbox}
          title="You are all caught up"
          description="We will post bids, messages, verification, and billing updates here. Check messages or the job board anytime."
          action={{ label: "Open messages", href: "/messages" }}
          secondaryAction={{ label: "Browse jobs", href: "/jobs" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {unread.length > 0 ? (
        <section aria-labelledby="notif-unread-heading" className="space-y-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#3525cd] shadow-sm shadow-[#3525cd]/30" aria-hidden />
              <h2 id="notif-unread-heading" className="text-sm font-semibold text-slate-900">
                Unread
              </h2>
              <span className="rounded-full bg-[#3525cd]/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-[#3525cd] ring-1 ring-[#3525cd]/10">
                {unread.length}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Tap to mark read and jump to the related page when available.</p>
          </div>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/75 bg-white shadow-sm ring-1 ring-slate-900/[0.02]">
            {unread.map((n) => (
              <NotificationRow
                key={n.id}
                item={n}
                isUnread
                busy={loadingId === n.id}
                onActivate={() => handleActivate(n)}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {read.length > 0 ? (
        <section aria-labelledby="notif-read-heading" className="space-y-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden />
              <h2 id="notif-read-heading" className="text-sm font-semibold text-slate-600">
                Read
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-500 ring-1 ring-slate-200/80">
                {read.length}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Opened or cleared—still available for reference.</p>
          </div>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/50 bg-slate-50/70 shadow-sm ring-1 ring-slate-900/[0.02]">
            {read.map((n) => (
              <NotificationRow
                key={n.id}
                item={n}
                isUnread={false}
                busy={loadingId === n.id}
                onActivate={() => handleActivate(n)}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function NotificationRow({
  item,
  isUnread,
  busy,
  onActivate
}: {
  item: NotificationListItem;
  isUnread: boolean;
  busy: boolean;
  onActivate: () => void;
}) {
  const href = linkForNotification(item);

  return (
    <li>
      <button
        type="button"
        onClick={onActivate}
        disabled={busy}
        className={cn(
          "flex w-full gap-3 px-4 py-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3525cd]/30 focus-visible:ring-offset-2 md:gap-4 md:px-5 md:py-4",
          isUnread
            ? "border-l-[3px] border-l-[#3525cd] bg-[#3525cd]/[0.035] hover:bg-[#3525cd]/[0.06]"
            : "border-l-[3px] border-l-transparent bg-transparent hover:bg-slate-100/60"
        )}
      >
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1",
            isUnread ? "bg-white ring-[#3525cd]/12" : "bg-white ring-slate-200/70"
          )}
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin text-[#3525cd]" aria-hidden /> : <TypeIcon type={item.type} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
            <p
              className={cn(
                "text-sm leading-snug",
                isUnread ? "font-semibold text-slate-900" : "font-medium text-slate-600"
              )}
            >
              {item.title}
            </p>
            <time
              className={cn(
                "shrink-0 text-[11px] tabular-nums",
                isUnread ? "font-medium text-slate-500" : "text-slate-400"
              )}
              dateTime={item.createdAt}
            >
              {formatWhen(item.createdAt)}
            </time>
          </div>
          <p
            className={cn(
              "mt-1 text-sm leading-relaxed",
              isUnread ? "text-slate-600" : "text-slate-500"
            )}
          >
            {item.body}
          </p>
          {href ? (
            <p className="mt-2 text-xs font-semibold text-[#3525cd]">Open related page →</p>
          ) : null}
        </div>
      </button>
    </li>
  );
}
