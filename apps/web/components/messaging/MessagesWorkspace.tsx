"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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

function formatThreadTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  if (sameDay) {
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(d);
  }
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays < 7) {
    return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(d);
  }
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(d);
}

function formatMessageTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(iso));
}

function threadTitle(peers: ThreadListItem["peers"]): string {
  if (peers.length === 0) return "Conversation";
  return peers.map((p) => p.displayName).join(" · ");
}

function peerInitials(peers: ThreadListItem["peers"]): string {
  const name = threadTitle(peers);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  const a = parts[0]![0] ?? "";
  const b = parts[1]![0] ?? "";
  return `${a}${b}`.toUpperCase() || "?";
}

function threadTypeLabel(type: string): string {
  switch (type) {
    case "JOB":
      return "Job";
    case "CONTRACT":
      return "Contract";
    case "DIRECT":
      return "Direct";
    default:
      return type;
  }
}

function previewText(body: string, max = 80): string {
  const t = body.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

type MessagesWorkspaceProps = {
  threads: ThreadListItem[];
  messages: MessageItem[];
  selectedThreadId: string | null;
  currentUserId: string;
};

export function MessagesWorkspace({ threads, messages, selectedThreadId, currentUserId }: MessagesWorkspaceProps) {
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
      const res = await fetch(`/api/messages/${selectedThreadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text })
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || json.success === false) {
        setSendError(json.error ?? "Could not send message");
        return;
      }
      setBody("");
      router.refresh();
    });
  };

  const hideListOnMobileWhenThread = Boolean(selectedThreadId);

  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-900/[0.06] ring-1 ring-slate-900/[0.03]",
        "min-h-[min(82dvh,860px)] max-h-[calc(100dvh-9.5rem)] md:max-h-[min(82dvh,860px)]"
      )}
    >
      <aside
        className={cn(
          "flex min-h-0 w-full shrink-0 flex-col border-slate-200/80 bg-white md:border-r",
          threads.length === 0 ? "md:max-w-none md:flex-1" : "md:w-[min(100%,360px)]",
          hideListOnMobileWhenThread ? "hidden md:flex" : "flex"
        )}
        aria-label="Conversations"
      >
        <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/95 to-white px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3525cd]/10 text-[#3525cd] ring-1 ring-[#3525cd]/15">
              <Inbox className="h-4 w-4" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Inbox</p>
              <p className="text-sm font-medium text-slate-800">
                {threads.length} conversation{threads.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-4 sm:p-5">
              <DashboardEmptyState
                tone="elevated"
                kicker="Messages"
                icon={MessageCircle}
                title="No threads yet"
                description="When you reach out from a job, contract, or direct thread, your conversations land here with previews and timestamps—ready to pick up anytime."
                action={{ label: "Browse jobs", href: "/jobs" }}
                secondaryAction={{ label: "Browse freelancers", href: "/freelancers" }}
              />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {threads.map((t) => {
                const active = t.threadId === selectedThreadId;
                const last = t.lastMessage;
                const unread = Boolean(last && last.senderId !== currentUserId);
                const title = threadTitle(t.peers);
                const previewSource = last?.body ?? "";
                const preview = previewSource ? previewText(previewSource) : "No messages yet — say hello";
                const prefix = last
                  ? last.senderId === currentUserId
                    ? "You · "
                    : ""
                  : "";

                return (
                  <li key={t.threadId}>
                    <Link
                      href={`/messages?thread=${t.threadId}` as Route}
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
                          {peerInitials(t.peers)}
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
                            {title}
                          </p>
                          <time
                            className="shrink-0 text-[11px] font-medium tabular-nums text-slate-400"
                            dateTime={t.updatedAt}
                          >
                            {formatThreadTime(t.updatedAt)}
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
                          <span className="rounded-md bg-slate-100/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            {threadTypeLabel(t.type)}
                          </span>
                          {unread ? (
                            <span className="text-[10px] font-semibold text-[#3525cd]">Awaiting your reply</span>
                          ) : last && last.senderId === currentUserId ? (
                            <span className="text-[10px] font-medium text-slate-400">Sent</span>
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
        aria-label="Conversation"
      >
        {!selectedThreadId ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md">
              <DashboardEmptyState
                tone="elevated"
                kicker="Workspace"
                icon={MessageSquare}
                title="Select a conversation"
                description="Pick a thread from the list to read the full history and reply. On your phone, tap a name to open the chat—use the back control to return to your inbox."
                action={{ label: "Browse jobs", href: "/jobs" }}
                secondaryAction={{ label: "Notifications", href: "/notifications" }}
              />
            </div>
          </div>
        ) : (
          <>
            <header className="shrink-0 border-b border-slate-200/90 bg-white px-4 py-3 md:px-5">
              <Link
                href={"/messages" as Route}
                className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3525cd] hover:underline md:hidden"
                scroll={false}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Inbox
              </Link>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3525cd]/15 to-violet-500/10 text-sm font-bold text-[#3525cd] ring-1 ring-[#3525cd]/15 sm:flex">
                    {selectedThread ? peerInitials(selectedThread.peers) : "?"}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
                      {selectedThread ? threadTitle(selectedThread.peers) : "Thread"}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {selectedThread ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                          {threadTypeLabel(selectedThread.type)}
                        </span>
                      ) : null}
                      {selectedThread?.jobId ? (
                        <Link
                          href={`/jobs/${selectedThread.jobId}` as Route}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#3525cd] hover:underline"
                        >
                          <Briefcase className="h-3.5 w-3.5" aria-hidden />
                          View job
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <div className="flex min-h-0 flex-1 flex-col">
              {messages.length === 0 ? (
                <div className="flex flex-1 flex-col justify-center px-4 py-8 md:px-8">
                  <div className="mx-auto w-full max-w-lg rounded-2xl border border-dashed border-slate-200/90 bg-white/80 px-6 py-8 text-center shadow-sm ring-1 ring-slate-100/80">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3525cd]/10 text-[#3525cd] ring-1 ring-[#3525cd]/15">
                      <Sparkles className="h-6 w-6" aria-hidden />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-slate-900">Start this thread</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      Send an opening note to align on scope, timing, or next steps. Messages deliver instantly to the
                      other party.
                    </p>
                    <ul className="mt-5 space-y-2 text-left text-xs text-slate-500">
                      <li className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#3525cd]/50" aria-hidden />
                        Confirm availability and preferred working hours early.
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#3525cd]/50" aria-hidden />
                        Reference the job or contract so context stays clear.
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
                            {formatMessageTime(m.createdAt)}
                          </time>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="shrink-0 border-t border-slate-200/90 bg-white p-4 shadow-[0_-6px_24px_rgba(15,23,42,0.04)] md:px-6">
                {sendError ? <p className="mb-2 text-sm font-medium text-red-600">{sendError}</p> : null}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write a message…"
                    rows={3}
                    className="min-h-[5.25rem] flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#3525cd]/35 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3525cd]/20"
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
                        Sending
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" aria-hidden />
                        Send
                      </>
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">Enter to send · Shift+Enter for a new line</p>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
