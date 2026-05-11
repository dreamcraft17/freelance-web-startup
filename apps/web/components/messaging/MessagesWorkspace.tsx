"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ModerationReportButton } from "@/features/moderation/components/ModerationReportButton";
import { fetchWithCsrf } from "@/features/auth/lib/fetch-with-csrf";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Briefcase,
  Inbox,
  Loader2,
  MessageCircle,
  MessageSquare,
  Send,
  Sparkles
} from "lucide-react";
import { useI18n } from "@/features/i18n/I18nProvider";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import { withWorkspaceLocale } from "@/lib/i18n/workspace-path";

export type ThreadListItem = {
  threadId: string;
  type: string;
  jobId: string | null;
  contractId: string | null;
  updatedAt: string;
  peers: { userId: string; displayName: string }[];
  lastMessage: {
    id: string;
    body: string;
    createdAt: string;
    senderId: string;
  } | null;
};

export type MessageItem = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  isSystem: boolean;
};

export type ThreadContextSummary = {
  jobId: string;
  jobTitle: string;
  /** Localized job listing status label */
  jobStatusLabel: string;
  counterpartLabel: string;
  /** Raw enum from DB (optional analytics) */
  proposalStatusRaw: string | null;
  /** Localized proposal state for the counterparty on this job */
  proposalStatusLabel: string | null;
  /** Short hiring-oriented next step for this thread */
  nextSuggested: string;
};

function formatThreadTime(iso: string, appLocale: "en" | "id"): string {
  const tag = appLocale === "id" ? "id-ID" : "en-US";
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  if (sameDay) {
    return new Intl.DateTimeFormat(tag, { hour: "numeric", minute: "2-digit" }).format(d);
  }
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays < 7) {
    return new Intl.DateTimeFormat(tag, { weekday: "short" }).format(d);
  }
  return new Intl.DateTimeFormat(tag, { month: "short", day: "numeric" }).format(d);
}

function formatMessageTime(iso: string, appLocale: "en" | "id"): string {
  const tag = appLocale === "id" ? "id-ID" : "en-US";
  return new Intl.DateTimeFormat(tag, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(iso));
}

function threadTitle(peers: ThreadListItem["peers"], emptyLabel: string): string {
  if (peers.length === 0) return emptyLabel;
  return peers.map((p) => p.displayName).join(" · ");
}

function peerInitials(peers: ThreadListItem["peers"], emptyLabel: string): string {
  const name = threadTitle(peers, emptyLabel);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  const a = parts[0]![0] ?? "";
  const b = parts[1]![0] ?? "";
  return `${a}${b}`.toUpperCase() || "?";
}

function previewText(body: string, max = 80): string {
  const snippet = body.replace(/\s+/g, " ").trim();
  if (snippet.length <= max) return snippet;
  return `${snippet.slice(0, max)}…`;
}

type MessagesWorkspaceProps = {
  threads: ThreadListItem[];
  messages: MessageItem[];
  selectedThreadId: string | null;
  currentUserId: string;
  selectedContext: ThreadContextSummary | null;
};

export function MessagesWorkspace({
  threads,
  messages,
  selectedThreadId,
  currentUserId,
  selectedContext
}: MessagesWorkspaceProps) {
  const { t, locale } = useI18n();
  const jobsBrowseRoot = withPublicLocale(locale, "/jobs");
  const freelancersBrowseRoot = withPublicLocale(locale, "/freelancers");
  const wp = (path: string) => withWorkspaceLocale(locale, path) as Route;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);

  const selectedThread = threads.find((t) => t.threadId === selectedThreadId);

  const submit = () => {
    const text = body.trim();
    if (!selectedThreadId || !text) return;
    setSendError(null);
    startTransition(async () => {
      const res = await fetchWithCsrf(`/api/messages/${selectedThreadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text })
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || json.success === false) {
        setSendError(json.error ?? t("messages.sendErrorFallback"));
        return;
      }
      setBody("");
      router.refresh();
    });
  };

  const hideListOnMobileWhenThread = Boolean(selectedThreadId);
  const threadTitleFallback = t("messages.threadTitleFallback");

  const threadTypeLabel = (threadType: string) => {
    switch (threadType) {
      case "JOB":
        return t("messages.threadTypeJob");
      case "CONTRACT":
        return t("messages.threadTypeContract");
      case "DIRECT":
        return t("messages.threadTypeDirect");
      default:
        return threadType;
    }
  };

  return (
    <div
      className={cn(
        "nw-card flex overflow-hidden rounded-xl shadow-nw-elevated",
        "min-h-[min(82dvh,860px)] max-h-[calc(100dvh-9.5rem)] md:max-h-[min(82dvh,860px)]"
      )}
    >
      <aside
        className={cn(
          "flex min-h-0 w-full shrink-0 flex-col border-slate-200/80 bg-white md:border-r",
          threads.length === 0 ? "md:max-w-none md:flex-1" : "md:w-[min(100%,360px)]",
          hideListOnMobileWhenThread ? "hidden md:flex" : "flex"
        )}
        aria-label={t("messages.inboxAria")}
      >
        <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3525cd]/10 text-[#3525cd] ring-1 ring-[#3525cd]/15">
              <Inbox className="h-4 w-4" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <p className="nw-type-micro">{t("messages.inboxHeading")}</p>
              <p className="text-sm font-medium text-slate-800">
                {threads.length === 1
                  ? t("messages.inboxOneConversation")
                  : t("messages.inboxManyConversations", { count: threads.length })}
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-4 sm:p-5">
              <DashboardEmptyState
                tone="elevated"
                kicker={t("nav.messages")}
                icon={MessageCircle}
                title={t("messages.emptyThreadsTitle")}
                description={t("messages.emptyThreadsDescription")}
                action={{ label: t("messages.emptyThreadsBrowseJobs"), href: jobsBrowseRoot as Route }}
                secondaryAction={{ label: t("messages.emptyThreadsFreelancers"), href: freelancersBrowseRoot as Route }}
              />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {threads.map((thread) => {
                const active = thread.threadId === selectedThreadId;
                const last = thread.lastMessage;
                const unread = Boolean(last && last.senderId !== currentUserId);
                const rowTitle = threadTitle(thread.peers, threadTitleFallback);
                const previewSource = last?.body ?? "";
                const preview = previewSource ? previewText(previewSource) : t("messages.previewEmpty");
                const prefix = last
                  ? last.senderId === currentUserId
                    ? t("messages.youPrefix")
                    : ""
                  : "";

                return (
                  <li key={thread.threadId}>
                    <Link
                      href={wp(`/messages?thread=${thread.threadId}`)}
                      scroll={false}
                      className={cn(
                        "flex gap-3 px-4 py-3.5 transition hover:bg-slate-50/90",
                        active && "bg-[#3525cd]/[0.06] ring-1 ring-inset ring-[#3525cd]/12"
                      )}
                    >
                      <div className="relative shrink-0">
                        <div
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold ring-2 ring-white",
                            unread
                              ? "bg-gradient-to-br from-[#3525cd]/20 to-violet-500/15 text-[#3525cd]"
                              : "bg-gradient-to-br from-slate-100 to-slate-50 text-slate-600 ring-slate-200/80"
                          )}
                        >
                          {peerInitials(thread.peers, threadTitleFallback)}
                        </div>
                        {unread ? (
                          <span
                            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#3525cd] shadow-sm"
                            aria-hidden
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "min-w-0 truncate text-sm leading-tight",
                              unread ? "font-semibold text-slate-900" : "font-medium text-slate-800"
                            )}
                          >
                            {rowTitle}
                          </p>
                          <time
                            className="shrink-0 text-[11px] font-medium tabular-nums text-slate-400"
                            dateTime={thread.updatedAt}
                          >
                            {formatThreadTime(thread.updatedAt, locale)}
                          </time>
                        </div>
                        <p
                          className={cn(
                            "mt-1 line-clamp-2 text-xs leading-snug",
                            last ? "text-slate-500" : "italic text-slate-400"
                          )}
                        >
                          <span className="font-medium text-slate-600">{prefix}</span>
                          {preview}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="nw-chip nw-chip-muted px-1.5 py-0.5 text-[10px] normal-case tracking-normal text-slate-600">
                            {threadTypeLabel(thread.type)}
                          </span>
                          {unread ? (
                            <span className="text-[10px] font-semibold text-[#3525cd]">
                              {t("messages.awaitingReply")}
                            </span>
                          ) : last && last.senderId === currentUserId ? (
                            <span className="text-[10px] font-medium text-slate-400">{t("messages.sent")}</span>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      <section
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col bg-slate-50/40",
          threads.length === 0 && "hidden",
          !selectedThreadId ? "hidden md:flex" : "flex"
        )}
        aria-label={t("messages.conversationPanel")}
      >
        {!selectedThreadId ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md">
              <DashboardEmptyState
                tone="elevated"
                kicker={t("messages.workspaceKicker")}
                icon={MessageSquare}
                title={t("messages.pickThreadTitle")}
                description={t("messages.pickThreadDescription")}
                action={{ label: t("messages.pickBrowseJobs"), href: jobsBrowseRoot as Route }}
                secondaryAction={{ label: t("messages.pickNotifications"), href: wp("/notifications") }}
              />
            </div>
          </div>
        ) : (
          <>
            <header className="shrink-0 border-b border-slate-200/90 bg-white px-4 py-3 md:px-5 md:py-4">
              <Link
                href={wp("/messages")}
                className="nw-link-action mb-3 inline-flex items-center gap-1.5 text-sm font-semibold md:hidden"
                scroll={false}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                {t("messages.backToInbox")}
              </Link>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3525cd]/15 to-violet-500/10 text-sm font-bold text-[#3525cd] ring-1 ring-[#3525cd]/15 sm:flex">
                    {selectedThread ? peerInitials(selectedThread.peers, threadTitleFallback) : "?"}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
                      {selectedThread
                        ? threadTitle(selectedThread.peers, threadTitleFallback)
                        : t("messages.threadHeaderFallback")}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {selectedThread ? (
                        <span className="nw-chip nw-chip-muted rounded-full px-2 py-0.5 text-[11px] normal-case tracking-normal">
                          {threadTypeLabel(selectedThread.type)}
                        </span>
                      ) : null}
                      {selectedThread?.jobId ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`${jobsBrowseRoot}/${selectedThread.jobId}` as Route}
                            className="nw-link-action inline-flex items-center gap-1 text-xs font-semibold"
                          >
                            <Briefcase className="h-3.5 w-3.5" aria-hidden />
                            {t("messages.viewJob")}
                          </Link>
                          {selectedContext ? (
                            <span className="nw-chip nw-chip-muted rounded-full px-2 py-0.5 text-[10px] normal-case tracking-normal">
                              {selectedContext.jobStatusLabel}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      {selectedThread?.lastMessage ? (
                        <span className="text-xs text-slate-500">
                          {t("messages.lastActivityPrefix")}{" "}
                          {formatThreadTime(selectedThread.lastMessage.createdAt, locale)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                {selectedThreadId ? (
                  <ModerationReportButton
                    intent="thread"
                    variant="text"
                    density="compact"
                    className="touch-manipulation min-h-[44px] shrink-0 self-start sm:min-h-0"
                    target={{ subjectType: "MESSAGE_THREAD", subjectThreadId: selectedThreadId }}
                  />
                ) : null}
              </div>
            </header>
            {selectedContext ? (
              <div className="border-b border-slate-200/80 bg-slate-50/90 px-4 py-3 md:px-5">
                <p className="nw-type-micro">{t("messages.hiringContextKicker")}</p>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700">
                  <span className="font-semibold">{selectedContext.jobTitle}</span>
                  <span className="text-slate-500">·</span>
                  <span>
                    <span className="font-semibold text-slate-800">{t("messages.contextListingStatus")}</span>{" "}
                    {selectedContext.jobStatusLabel}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>
                    <span className="font-semibold text-slate-700">{t("messages.contextWithLabel")}</span>{" "}
                    {selectedContext.counterpartLabel}
                  </span>
                  {selectedContext.proposalStatusLabel ? (
                    <span>
                      <span className="font-semibold text-slate-700">{t("messages.contextProposalLabel")}</span>{" "}
                      {selectedContext.proposalStatusLabel}
                    </span>
                  ) : (
                    <span className="text-slate-500">{t("messages.contextProposalPending")}</span>
                  )}
                  <Link
                    href={`${jobsBrowseRoot}/${selectedContext.jobId}` as Route}
                    className="font-semibold text-[#3525cd] hover:underline"
                  >
                    {t("messages.backToJob")}
                  </Link>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">{t("messages.threadTiedHint")}</p>
                <div className="nw-card-trust mt-3 border-[#3525cd]/18 px-3 py-2.5">
                  <p className="nw-section-title text-[10px]">{t("messages.nextSuggestedKicker")}</p>
                  <p className="nw-type-body mt-1 text-slate-800">{selectedContext.nextSuggested}</p>
                </div>
              </div>
            ) : null}

            <div className="flex min-h-0 flex-1 flex-col">
              {messages.length === 0 ? (
                <div className="flex flex-1 flex-col justify-center px-4 py-8 md:px-8">
                  <div className="nw-empty-state mx-auto w-full max-w-lg text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3525cd]/10 text-[#3525cd] ring-1 ring-[#3525cd]/15">
                      <Sparkles className="h-6 w-6" aria-hidden />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-slate-900">{t("messages.startThreadTitle")}</h3>
                    <p className="nw-type-body mt-2">{t("messages.startThreadBody")}</p>
                    <ul className="mt-5 space-y-2 text-left text-xs text-slate-500">
                      <li className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#3525cd]/50" aria-hidden />
                        {t("messages.startBullet1")}
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#3525cd]/50" aria-hidden />
                        {t("messages.startBullet2")}
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 md:space-y-4 md:px-6 md:py-5">
                  {messages.map((m) => {
                    const mine = m.senderId === currentUserId && !m.isSystem;
                    return (
                      <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[min(100%,34rem)] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                            m.isSystem
                              ? "border border-amber-200/80 bg-amber-50/95 text-amber-950"
                              : mine
                                ? "bg-[#3525cd] text-white shadow-md shadow-[#3525cd]/15"
                                : "border border-slate-200/90 bg-white text-slate-900 ring-1 ring-slate-100/80"
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words leading-relaxed">{m.body}</p>
                          <time
                            className={cn(
                              "mt-1.5 block text-[11px] tabular-nums",
                              mine && !m.isSystem ? "text-white/70" : "text-slate-400"
                            )}
                            dateTime={m.createdAt}
                          >
                            {formatMessageTime(m.createdAt, locale)}
                          </time>
                          {!m.isSystem && !mine ? (
                            <div className="mt-1.5 flex justify-end">
                              <ModerationReportButton
                                variant="text"
                                density="compact"
                                intent="message"
                                target={{ subjectType: "MESSAGE", subjectMessageId: m.id }}
                                className="touch-manipulation min-h-[40px] justify-end text-right"
                              />
                            </div>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="sticky bottom-0 z-10 shrink-0 border-t border-slate-200/90 bg-white p-4 shadow-[0_-8px_28px_rgba(15,23,42,0.06)] md:px-6">
                {sendError ? <p className="mb-2 text-sm font-medium text-red-600">{sendError}</p> : null}
                {selectedContext ? (
                  <p className="mb-2 text-[11px] leading-relaxed text-slate-500">{t("messages.composeWorkplaceReminder")}</p>
                ) : null}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={t("messages.composePlaceholder")}
                    rows={3}
                    className="min-h-[5.25rem] flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#3525cd]/35 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3525cd]/20 sm:text-sm"
                    disabled={isPending}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        submit();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    className="h-11 shrink-0 rounded-xl bg-[#3525cd] px-6 text-sm font-semibold text-white shadow-md shadow-[#3525cd]/20 hover:bg-[#2d1fb0] sm:min-w-[7.5rem]"
                    disabled={isPending || !body.trim()}
                    onClick={submit}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        {t("messages.send")}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" aria-hidden />
                        {t("messages.sendCta")}
                      </>
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">{t("messages.composeHint")}</p>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
