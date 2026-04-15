"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ApiOk = { success: true; data: { threadId: string; created: boolean } };
type ApiFail = { success: false; error?: string };

export function BidConversationAction({
  threadId,
  jobId,
  freelancerUserId
}: {
  threadId: string | null;
  jobId: string;
  freelancerUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function startConversation() {
    if (pending) return;
    startTransition(async () => {
      setError(null);
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "JOB",
          jobId,
          withUserId: freelancerUserId
        })
      });
      const body = (await res.json()) as ApiOk | ApiFail;
      if (!res.ok || !("success" in body) || !body.success) {
        setError("Could not start conversation.");
        return;
      }
      router.push((`/messages?thread=${encodeURIComponent(body.data.threadId)}` as Route));
    });
  }

  if (threadId) {
    return (
      <Link
        href={`/messages?thread=${encodeURIComponent(threadId)}` as Route}
        className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline"
      >
        Open conversation
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={startConversation}
        disabled={pending}
        className="text-xs font-semibold text-[#433C93] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Starting..." : "Start conversation"}
      </button>
      {error ? <p className="text-[11px] text-rose-600">{error}</p> : null}
    </div>
  );
}
