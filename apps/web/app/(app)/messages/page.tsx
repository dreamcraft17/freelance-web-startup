import { redirect } from "next/navigation";
import { getSessionFromCookies, sessionToActor } from "@src/lib/auth";
import {
  MessagesWorkspace,
  type MessageItem,
  type ThreadListItem
} from "@/components/messaging/MessagesWorkspace";
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
  const [threadResult, sp] = await Promise.all([messageService.listThreadsForActor(actor), searchParams.then(pick)]);
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
    } catch {
      selectedThreadId = null;
      messages = [];
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

      <MessagesWorkspace
        threads={threads}
        messages={messages}
        selectedThreadId={selectedThreadId}
        currentUserId={session.userId}
      />
    </div>
  );
}
