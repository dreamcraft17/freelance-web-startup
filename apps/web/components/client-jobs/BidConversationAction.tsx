"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { fetchWithCsrf } from "@/features/auth/lib/fetch-with-csrf";
import { useI18n } from "@/features/i18n/I18nProvider";
import { cn } from "@/lib/utils";

type ApiOk = { success: true; data: { threadId: string; created: boolean } };
type ApiFail = { success: false; error?: string };

export function BidConversationAction({
  threadId,
  jobId,
  freelancerUserId,
  prominence = "secondary"
}: {
  threadId: string | null;
  jobId: string;
  freelancerUserId: string;
  prominence?: "primary" | "secondary";
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function startConversation() {
    if (pending) return;
    startTransition(async () => {
      setError(null);
      const res = await fetchWithCsrf("/api/messages", {
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
        setError(t("public.jobDetail.bidDiscussError"));
        return;
      }
      router.push((`/messages?thread=${encodeURIComponent(body.data.threadId)}&from=job-conversation` as Route));
    });
  }

  const primaryCls =
    "inline-flex min-h-[44px] w-full touch-manipulation items-center justify-center rounded-xl bg-[#3525cd] px-4 text-sm font-semibold text-white shadow-md shadow-[#3525cd]/25 transition hover:bg-[#2d1fb0] disabled:cursor-not-allowed disabled:opacity-65 sm:w-auto";

  const secondaryOpenCls =
    "inline-flex min-h-[44px] touch-manipulation items-center text-xs font-semibold text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline";
  const secondaryStartCls =
    "inline-flex min-h-[44px] touch-manipulation items-center justify-start text-left text-xs font-semibold text-[#433C93] underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-60";
  const linkPrimaryCls =
    "inline-flex min-h-[44px] w-full touch-manipulation items-center justify-center rounded-xl border border-[#3525cd]/35 bg-white px-4 text-sm font-semibold text-[#3525cd] shadow-sm hover:bg-[#3525cd]/[0.05] sm:w-auto";

  if (threadId) {
    return (
      <Link
        href={`/messages?thread=${encodeURIComponent(threadId)}&from=job-conversation` as Route}
        className={cn(prominence === "primary" ? linkPrimaryCls : secondaryOpenCls)}
      >
        {t("public.jobDetail.bidDiscussOpen")}
      </Link>
    );
  }

  return (
    <div className="flex w-full flex-col items-stretch gap-1 sm:w-auto">
      <button
        type="button"
        onClick={startConversation}
        disabled={pending}
        className={cn(prominence === "primary" ? primaryCls : secondaryStartCls)}
      >
        {pending ? t("public.jobDetail.bidDiscussStarting") : t("public.jobDetail.bidDiscussStart")}
      </button>
      {error ? <p className="text-[11px] font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
