import { redirect } from "next/navigation";
import { BidStatus, UserRole } from "@acme/types";
import { db } from "@acme/database";
import { getSessionFromCookies, sessionToActor } from "@src/lib/auth";
import { getServerTranslator } from "@/lib/i18n/server-translator";
import { localizedBidStatusLabel, localizedJobStatusLabel } from "@/lib/i18n/marketplace-status-labels";
import {
  MessagesWorkspace,
  type MessageItem,
  type ThreadContextSummary,
  type ThreadListItem
} from "@/components/messaging/MessagesWorkspace";
import { ProposalHandoffBanner } from "@/components/messaging/ProposalHandoffBanner";
import { MessageService } from "@/server/services/message.service";

type SearchParams = Record<string, string | string[] | undefined>;

function pick(sp: SearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (v === undefined) continue;
    out[k] = Array.isArray(v) ? (v[0] ?? "") : v;
  }
  return out;
}

export default async function MessagesPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?returnUrl=/messages");
  }

  const actor = sessionToActor(session);
  const messageService = new MessageService();
  const [threadResult, sp, { t }] = await Promise.all([
    messageService.listThreadsForActor(actor),
    searchParams.then(pick),
    getServerTranslator()
  ]);
  const { items: threadRows } = threadResult;

  const threads: ThreadListItem[] = threadRows.map((row) => ({
    threadId: row.threadId,
    type: row.type,
    jobId: row.jobId,
    contractId: row.contractId,
    updatedAt: row.updatedAt,
    peers: row.peers,
    lastMessage: row.lastMessage
  }));

  const validIds = new Set(threads.map((t) => t.threadId));
  const threadParam = sp.thread?.trim() ?? "";

  let messages: MessageItem[] = [];
  let selectedThreadId: string | null = null;
  let selectedContext: ThreadContextSummary | null = null;

  if (threadParam && validIds.has(threadParam)) {
    try {
      const data = await messageService.listMessagesForActor(actor, threadParam);
      messages = data.items.map((m) => ({
        id: m.id,
        body: m.body,
        createdAt: m.createdAt,
        senderId: m.senderId,
        isSystem: m.isSystem
      }));
      selectedThreadId = threadParam;
      const selectedThread = threads.find((t) => t.threadId === threadParam) ?? null;
      if (selectedThread?.jobId) {
        const peerUserId =
          selectedThread.peers.find((p) => p.userId !== session.userId)?.userId ?? "";
        const freelancerForBid =
          session.role === UserRole.FREELANCER ? session.userId : peerUserId || null;

        const jobRowPromise = db.job.findFirst({
          where: { id: selectedThread.jobId, deletedAt: null },
          select: { id: true, title: true, status: true }
        });
        const bidRowPromise =
          freelancerForBid && selectedThread.jobId
            ? db.bid.findFirst({
                where: {
                  jobId: selectedThread.jobId,
                  freelancer: { userId: freelancerForBid }
                },
                orderBy: { createdAt: "desc" },
                select: { status: true }
              })
            : Promise.resolve(null);

        const [jobRow, bidRow] = await Promise.all([jobRowPromise, bidRowPromise]);

        if (jobRow) {
          const proposalRaw = bidRow?.status ?? null;
          let nextSuggested = t("messages.nextSuggestedDefault");

          const nonSystem = messages.filter((m) => !m.isSystem);
          const viewerSent = nonSystem.some((m) => m.senderId === session.userId);
          const otherSent = nonSystem.some((m) => m.senderId !== session.userId);

          if (session.role === UserRole.CLIENT) {
            if (!proposalRaw) {
              nextSuggested = t("messages.nextSuggestedClientInvite");
            } else if (proposalRaw === BidStatus.SUBMITTED) {
              if (!viewerSent) {
                nextSuggested = t("messages.nextSuggestedClientFirstReply");
              } else if (!otherSent) {
                nextSuggested = t("messages.nextSuggestedClientAwaitingFreelancer");
              } else {
                nextSuggested = t("messages.nextSuggestedClientCompare");
              }
            } else if (proposalRaw === BidStatus.SHORTLISTED) {
              nextSuggested = t("messages.nextSuggestedClientShortlisted");
            } else if (proposalRaw === BidStatus.ACCEPTED) {
              nextSuggested = t("messages.nextSuggestedClientAccepted");
            } else if (proposalRaw === BidStatus.REJECTED || proposalRaw === BidStatus.WITHDRAWN) {
              nextSuggested = t("messages.nextSuggestedClientStale");
            }
          } else if (session.role === UserRole.FREELANCER) {
            if (!proposalRaw) {
              nextSuggested = t("messages.nextSuggestedFreelancerDiscover");
            } else if (proposalRaw === BidStatus.SUBMITTED) {
              if (!otherSent) {
                nextSuggested = t("messages.nextSuggestedFreelancerAwaitReview");
              } else if (!viewerSent) {
                nextSuggested = t("messages.nextSuggestedFreelancerReply");
              } else {
                nextSuggested = t("messages.nextSuggestedFreelancerClarify");
              }
            } else if (proposalRaw === BidStatus.SHORTLISTED) {
              nextSuggested = t("messages.nextSuggestedFreelancerShortlisted");
            } else if (proposalRaw === BidStatus.ACCEPTED) {
              nextSuggested = t("messages.nextSuggestedFreelancerAccepted");
            }
          }

          selectedContext = {
            jobId: jobRow.id,
            jobTitle: jobRow.title,
            jobStatusLabel: localizedJobStatusLabel(jobRow.status, t),
            counterpartLabel: selectedThread.peers.map((p) => p.displayName).join(" · ") || "Counterpart",
            proposalStatusRaw: proposalRaw,
            proposalStatusLabel: proposalRaw ? localizedBidStatusLabel(proposalRaw, t) : null,
            nextSuggested
          };
        }
      }
    } catch {
      selectedThreadId = null;
      messages = [];
      selectedContext = null;
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8">
      <header className="border-b border-slate-200/80 pb-5">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">NearWork</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 md:text-[1.65rem]">
          {t("nav.messages")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{t("messages.pageSubtitle")}</p>
      </header>
      {sp.from === "proposal" || sp.from === "job-conversation" ? (
        <ProposalHandoffBanner
          message={
            sp.from === "proposal"
              ? t("messages.handoffFromProposal")
              : t("messages.handoffFromConversation")
          }
        />
      ) : null}

      <MessagesWorkspace
        threads={threads}
        messages={messages}
        selectedThreadId={selectedThreadId}
        currentUserId={session.userId}
        selectedContext={selectedContext}
      />
    </div>
  );
}
