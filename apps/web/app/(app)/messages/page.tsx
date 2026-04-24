import { redirect } from "next/navigation";
import { db } from "@acme/database";
import { getSessionFromCookies, sessionToActor } from "@src/lib/auth";
import { getAppLocale } from "@/lib/i18n/server-locale";
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
  const [threadResult, sp, locale] = await Promise.all([
    messageService.listThreadsForActor(actor),
    searchParams.then(pick),
    getAppLocale()
  ]);
  const { items: threadRows } = threadResult;

  const threads: ThreadListItem[] = threadRows.map((t) => ({
    threadId: t.threadId,
    type: t.type,
    jobId: t.jobId,
    contractId: t.contractId,
    updatedAt: t.updatedAt,
    peers: t.peers,
    lastMessage: t.lastMessage
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
        const [jobRow, bidRow] = await Promise.all([
          db.job.findFirst({
            where: { id: selectedThread.jobId, deletedAt: null },
            select: { id: true, title: true }
          }),
          db.bid.findFirst({
            where: {
              jobId: selectedThread.jobId,
              OR: [
                { freelancer: { userId: session.userId } },
                { freelancer: { userId: selectedThread.peers[0]?.userId ?? "" } }
              ]
            },
            orderBy: { createdAt: "desc" },
            select: { status: true }
          })
        ]);
        if (jobRow) {
          selectedContext = {
            jobId: jobRow.id,
            jobTitle: jobRow.title,
            counterpartLabel: selectedThread.peers.map((p) => p.displayName).join(" · ") || "Counterpart",
            proposalStatus: bidRow?.status ?? null
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
          Messages
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Inbox and chat in one workspace—threads stay tied to jobs or contracts when they matter.
        </p>
      </header>
      {sp.from === "proposal" || sp.from === "job-conversation" ? (
        <ProposalHandoffBanner
          message={
            sp.from === "proposal"
              ? locale === "id"
                ? "Percakapan dibuka dari proposal terbaru Anda."
                : "Conversation opened from your latest proposal."
              : locale === "id"
                ? "Percakapan dibuka dari review proposal job. Lanjutkan diskusi dan tentukan langkah berikutnya."
                : "Conversation opened from job proposal review. Continue the discussion and choose your next step."
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
