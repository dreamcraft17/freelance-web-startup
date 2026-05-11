"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { NotificationType } from "@acme/types";
import { useI18n } from "@/features/i18n/I18nProvider";
import { fetchWithCsrf } from "@/features/auth/lib/fetch-with-csrf";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/lib/i18n/types";
import type { Translator } from "@/lib/i18n/create-translator";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import { withWorkspaceLocale } from "@/lib/i18n/workspace-path";
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

function formatNotificationWhen(iso: string, locale: AppLocale, t: Translator): string {
  const d = new Date(iso);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return t("notifications.time.justNow");
  if (mins < 60) return t("notifications.time.minutesAgo", { count: mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t("notifications.time.hoursAgo", { count: hrs });
  const days = Math.floor(hrs / 24);
  if (days < 7) return t("notifications.time.daysAgo", { count: days });
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(d);
}

function linkForNotification(item: NotificationListItem, locale: AppLocale): string | null {
  const p = item.payload;
  if (!p || typeof p !== "object") return null;
  const o = p as Record<string, unknown>;
  if (typeof o.threadId === "string") {
    return withWorkspaceLocale(locale, `/messages?thread=${encodeURIComponent(o.threadId)}`);
  }
  if (typeof o.contractId === "string") return `/api/contracts/${encodeURIComponent(o.contractId)}`;
  if (typeof o.jobId === "string") return `${withPublicLocale(locale, "/jobs")}/${encodeURIComponent(o.jobId)}`;
  return null;
}

function notificationActivityLabel(type: string, t: Translator): string {
  switch (type) {
    case NotificationType.BID_SUBMITTED:
    case NotificationType.BID_SHORTLISTED:
      return t("notifications.activity.bidProposal");
    case NotificationType.BID_ACCEPTED:
      return t("notifications.activity.bidAccepted");
    case NotificationType.NEW_MESSAGE:
      return t("notifications.activity.newMessage");
    case NotificationType.CONTRACT_STARTED:
      return t("notifications.activity.contractUpdate");
    case NotificationType.REVIEW_RECEIVED:
      return t("notifications.activity.reviewReceived");
    case NotificationType.VERIFICATION_UPDATED:
      return t("notifications.activity.verificationUpdated");
    case NotificationType.BILLING_UPDATED:
      return t("notifications.activity.billingUpdated");
    case NotificationType.ADMIN_MODERATION_EVENT:
      return t("notifications.activity.adminModeration");
    default:
      return t("notifications.activity.default");
  }
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

const READ_SECTION_RECENT_MS = 7 * 24 * 60 * 60 * 1000;

type NotificationCategory = "all" | "proposals" | "messages" | "contracts";

function categoryForType(type: string): NotificationCategory {
  if (
    type === NotificationType.BID_SUBMITTED ||
    type === NotificationType.BID_SHORTLISTED ||
    type === NotificationType.BID_ACCEPTED
  ) {
    return "proposals";
  }
  if (type === NotificationType.NEW_MESSAGE) return "messages";
  if (type === NotificationType.CONTRACT_STARTED) return "contracts";
  return "all";
}

export function NotificationsCenter({ items }: NotificationsCenterProps) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [category, setCategory] = useState<NotificationCategory>("all");

  const counts = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          acc.all += 1;
          const itemCategory = categoryForType(item.type);
          if (itemCategory !== "all") acc[itemCategory] += 1;
          return acc;
        },
        { all: 0, proposals: 0, messages: 0, contracts: 0 } as Record<NotificationCategory, number>
      ),
    [items]
  );

  const filteredItems = useMemo(() => {
    if (category === "all") return items;
    return items.filter((n) => categoryForType(n.type) === category);
  }, [items, category]);

  const { unread, read } = useMemo(() => {
    const u: NotificationListItem[] = [];
    const r: NotificationListItem[] = [];
    for (const n of filteredItems) {
      if (n.readAt == null) u.push(n);
      else r.push(n);
    }
    return { unread: u, read: r };
  }, [filteredItems]);

  const { recentRead, olderRead } = useMemo(() => {
    const recent: NotificationListItem[] = [];
    const older: NotificationListItem[] = [];
    const now = Date.now();
    for (const n of read) {
      const ts = new Date(n.createdAt).getTime();
      if (!Number.isFinite(ts)) {
        older.push(n);
        continue;
      }
      if (now - ts <= READ_SECTION_RECENT_MS) recent.push(n);
      else older.push(n);
    }
    return { recentRead: recent, olderRead: older };
  }, [read]);

  async function handleActivate(n: NotificationListItem) {
    const href = linkForNotification(n, locale);
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
      <div className="nw-card-elevated overflow-hidden p-1">
        <DashboardEmptyState
          tone="elevated"
          kicker={t("nav.notifications")}
          icon={Inbox}
          title={t("notifications.emptyTitle")}
          description={t("notifications.emptyDescription")}
          action={{ label: t("notifications.emptyPrimary"), href: withWorkspaceLocale(locale, "/messages") as Route }}
          secondaryAction={{
            label: t("notifications.emptySecondary"),
            href: withPublicLocale(locale, "/jobs") as Route
          }}
        />
      </div>
    );
  }

  return (
    <div className="nw-stack-loose">
      <section aria-label={t("notifications.categoriesAria")} className="flex flex-wrap gap-2">
        {[
          { id: "all", label: t("notifications.categoryAll") },
          { id: "proposals", label: t("notifications.categoryProposals") },
          { id: "messages", label: t("notifications.categoryMessages") },
          { id: "contracts", label: t("notifications.categoryContracts") }
        ].map((chip) => {
          const active = category === chip.id;
          const count = counts[chip.id as NotificationCategory];
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setCategory(chip.id as NotificationCategory)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ring-1",
                active
                  ? "bg-[#3525cd] text-white ring-[#3525cd] shadow-sm"
                  : "nw-chip nw-chip-muted rounded-full normal-case tracking-normal ring-slate-200/90 hover:bg-white"
              )}
            >
              <span>{chip.label}</span>
              <span className={cn("ml-1.5 text-[11px]", active ? "text-white/80" : "text-slate-500")}>
                ({count})
              </span>
            </button>
          );
        })}
      </section>

      {filteredItems.length === 0 ? (
        <div className="nw-card-elevated overflow-hidden p-1">
          <DashboardEmptyState
            tone="elevated"
            kicker={t("nav.notifications")}
            icon={Inbox}
            title={t("notifications.filterEmptyTitle")}
            description={t("notifications.filterEmptyDescription")}
            action={{ label: t("notifications.emptyPrimary"), href: withWorkspaceLocale(locale, "/messages") as Route }}
            secondaryAction={{
              label: t("notifications.emptySecondary"),
              href: withPublicLocale(locale, "/jobs") as Route
            }}
          />
        </div>
      ) : null}

      {filteredItems.length > 0 ? <div className="space-y-10">
      {unread.length > 0 ? (
        <section aria-labelledby="notif-unread-heading" className="space-y-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#3525cd] shadow-sm shadow-[#3525cd]/30" aria-hidden />
              <h2 id="notif-unread-heading" className="nw-type-section text-base">
                {t("notifications.unreadLabel")}
              </h2>
              <span className="rounded-full bg-[#3525cd]/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-[#3525cd] ring-1 ring-[#3525cd]/10">
                {unread.length}
              </span>
            </div>
            <p className="nw-type-meta mt-1 font-medium normal-case tracking-normal">{t("notifications.unreadCaption")}</p>
          </div>
          <ul className="nw-card divide-y divide-slate-100 overflow-hidden rounded-xl">
            {unread.map((n) => (
              <NotificationRow
                key={n.id}
                item={n}
                isUnread
                busy={loadingId === n.id}
                onActivate={() => handleActivate(n)}
                locale={locale}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {recentRead.length > 0 ? (
        <section aria-labelledby="notif-read-heading" className="space-y-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden />
              <h2 id="notif-read-heading" className="nw-type-section text-base text-slate-600">
                {t("notifications.readRecentLabel")}
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-500 ring-1 ring-slate-200/80">
                {recentRead.length}
              </span>
            </div>
            <p className="nw-type-meta mt-1 font-medium normal-case tracking-normal">{t("notifications.readRecentCaption")}</p>
          </div>
          <ul className="nw-card divide-y divide-slate-100 overflow-hidden rounded-xl bg-slate-50/60">
            {recentRead.map((n) => (
              <NotificationRow
                key={n.id}
                item={n}
                isUnread={false}
                busy={loadingId === n.id}
                onActivate={() => handleActivate(n)}
                locale={locale}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {olderRead.length > 0 ? (
        <section aria-labelledby="notif-read-older-heading" className="space-y-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-200" aria-hidden />
              <h2 id="notif-read-older-heading" className="nw-type-section text-base text-slate-500">
                {t("notifications.readOlderLabel")}
              </h2>
              <span className="rounded-full bg-slate-100/90 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-400 ring-1 ring-slate-200/70">
                {olderRead.length}
              </span>
            </div>
            <p className="nw-type-meta mt-1 font-medium normal-case tracking-normal text-slate-500">
              {t("notifications.readOlderCaption")}
            </p>
          </div>
          <ul className="nw-card divide-y divide-slate-100 overflow-hidden rounded-xl bg-slate-50/40">
            {olderRead.map((n) => (
              <NotificationRow
                key={n.id}
                item={n}
                isUnread={false}
                busy={loadingId === n.id}
                onActivate={() => handleActivate(n)}
                locale={locale}
              />
            ))}
          </ul>
        </section>
      ) : null}
      </div> : null}
    </div>
  );
}

function NotificationRow({
  item,
  isUnread,
  busy,
  onActivate,
  locale
}: {
  item: NotificationListItem;
  isUnread: boolean;
  busy: boolean;
  onActivate: () => void;
  locale: AppLocale;
}) {
  const { t } = useI18n();
  const href = linkForNotification(item, locale);

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
              {formatNotificationWhen(item.createdAt, locale, t)}
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
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "nw-chip px-1.5 py-0.5 text-[10px] normal-case tracking-normal ring-1",
                isUnread ? "nw-chip-muted ring-slate-200/90" : "bg-slate-100 text-slate-600 ring-slate-200/70"
              )}
            >
              {notificationActivityLabel(item.type, t)}
            </span>
            {href ? <p className="nw-link-action text-xs font-semibold">{t("notifications.openRelated")}</p> : null}
          </div>
        </div>
      </button>
    </li>
  );
}
