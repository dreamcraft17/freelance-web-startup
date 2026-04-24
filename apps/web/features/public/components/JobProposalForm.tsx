"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { submitBidSchema } from "@acme/validators";
import { fetchWithCsrf } from "@/features/auth/lib/fetch-with-csrf";
import { AuthSubmitOverlay } from "@/features/auth/components/AuthSubmitOverlay";

type JobProposalFormProps = {
  jobId: string;
  currency: string;
  userId?: string | null;
  clientUserId?: string | null;
  labels: {
    title: string;
    subtitle: string;
    introLabel: string;
    introPlaceholder: string;
    approachLabel: string;
    approachPlaceholder: string;
    timelineLabel: string;
    timelinePlaceholder: string;
    amountLabel: string;
    daysLabel: string;
    reassurance: string;
    firstStep: string;
    send: string;
    sending: string;
    loadingOverlay: string;
    success: string;
    genericError: string;
    networkError: string;
    draftRestored: string;
    savedLocally: string;
    clearDraft: string;
    draftCleared: string;
    openConversation: string;
    conversationHint: string;
    conversationError: string;
  };
  onSubmitted?: () => void;
};

type DraftShape = {
  intro: string;
  approach: string;
  timeline: string;
  amount: string;
  estimatedDays: string;
};

const REDIRECT_DELAY_MS = 400;

export function JobProposalForm({
  jobId,
  currency,
  userId,
  clientUserId,
  labels,
  onSubmitted
}: JobProposalFormProps) {
  const router = useRouter();
  const [intro, setIntro] = useState("");
  const [approach, setApproach] = useState("");
  const [timeline, setTimeline] = useState("");
  const [amount, setAmount] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [conversationThreadId, setConversationThreadId] = useState<string | null>(null);

  const draftKey = useMemo(
    () => `nearwork:proposalDraft:${jobId}:${userId ?? "anon"}`,
    [jobId, userId]
  );
  const hasHydratedRef = useRef(false);
  const hasRestoredRef = useRef(false);

  function readDraft(): DraftShape | null {
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<DraftShape>;
      return {
        intro: typeof parsed.intro === "string" ? parsed.intro : "",
        approach: typeof parsed.approach === "string" ? parsed.approach : "",
        timeline: typeof parsed.timeline === "string" ? parsed.timeline : "",
        amount: typeof parsed.amount === "string" ? parsed.amount : "",
        estimatedDays: typeof parsed.estimatedDays === "string" ? parsed.estimatedDays : ""
      };
    } catch {
      return null;
    }
  }

  function clearDraftStorage() {
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      // localStorage can be blocked; fail silently.
    }
  }

  useEffect(() => {
    const draft = readDraft();
    hasHydratedRef.current = true;
    if (!draft) return;
    const hasValue = Object.values(draft).some((v) => v.trim().length > 0);
    if (!hasValue) return;
    setIntro(draft.intro);
    setApproach(draft.approach);
    setTimeline(draft.timeline);
    setAmount(draft.amount);
    setEstimatedDays(draft.estimatedDays);
    hasRestoredRef.current = true;
    setDraftNotice(labels.draftRestored);
  }, [draftKey, labels.draftRestored]);

  useEffect(() => {
    if (!hasHydratedRef.current || submitting) return;
    const timer = window.setTimeout(() => {
      try {
        const draft: DraftShape = { intro, approach, timeline, amount, estimatedDays };
        const hasValue = Object.values(draft).some((v) => v.trim().length > 0);
        if (!hasValue) {
          clearDraftStorage();
          return;
        }
        window.localStorage.setItem(draftKey, JSON.stringify(draft));
        if (!hasRestoredRef.current) setDraftNotice(labels.savedLocally);
      } catch {
        // localStorage unavailable; no-op.
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [intro, approach, timeline, amount, estimatedDays, draftKey, labels.savedLocally, submitting]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(null);

    const payload = {
      jobId,
      bidAmount: Number(amount),
      estimatedDays: Number(estimatedDays),
      coverLetter: `Intro:\n${intro.trim()}\n\nApproach:\n${approach.trim()}\n\nTimeline/availability:\n${timeline.trim()}`
    };

    const parsed = submitBidSchema.safeParse(payload);
    if (!parsed.success) {
      const field = parsed.error.flatten().fieldErrors;
      const first = field.coverLetter?.[0] ?? field.bidAmount?.[0] ?? field.estimatedDays?.[0] ?? labels.genericError;
      setError(first);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetchWithCsrf("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data)
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !json.success) {
        setError(json.error ?? labels.genericError);
        return;
      }
      setSuccess(labels.success);
      setIntro("");
      setApproach("");
      setTimeline("");
      setAmount("");
      setEstimatedDays("");
      clearDraftStorage();
      setDraftNotice(null);
      if (clientUserId) {
        try {
          const threadRes = await fetchWithCsrf("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "JOB",
              jobId,
              withUserId: clientUserId
            })
          });
          const threadJson = (await threadRes.json()) as {
            success?: boolean;
            data?: { threadId?: string };
          };
          if (threadRes.ok && threadJson.success && threadJson.data?.threadId) {
            setConversationThreadId(threadJson.data.threadId);
            await new Promise((resolve) => window.setTimeout(resolve, REDIRECT_DELAY_MS));
            router.push((`/messages?thread=${encodeURIComponent(threadJson.data.threadId)}&from=proposal` as Route));
          } else {
            setConversationThreadId(null);
          }
        } catch {
          setConversationThreadId(null);
        }
      }
      onSubmitted?.();
    } catch {
      setError(labels.networkError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AuthSubmitOverlay active={submitting} message={labels.loadingOverlay} />
      <form className="space-y-3" onSubmit={onSubmit}>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{labels.title}</p>
          <p className="mt-1 text-xs text-slate-600">{labels.subtitle}</p>
          {draftNotice ? <p className="text-[11px] font-medium text-slate-500">{draftNotice}</p> : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700" htmlFor="proposal-intro">
            {labels.introLabel}
          </label>
          <textarea
            id="proposal-intro"
            className="min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#3525cd]/40 focus:ring-2 focus:ring-[#3525cd]/20"
            placeholder={labels.introPlaceholder}
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700" htmlFor="proposal-approach">
            {labels.approachLabel}
          </label>
          <textarea
            id="proposal-approach"
            className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#3525cd]/40 focus:ring-2 focus:ring-[#3525cd]/20"
            placeholder={labels.approachPlaceholder}
            value={approach}
            onChange={(e) => setApproach(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700" htmlFor="proposal-timeline">
            {labels.timelineLabel}
          </label>
          <textarea
            id="proposal-timeline"
            className="min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#3525cd]/40 focus:ring-2 focus:ring-[#3525cd]/20"
            placeholder={labels.timelinePlaceholder}
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-700">{labels.amountLabel}</span>
            <input
              type="number"
              min={1}
              step="1"
              inputMode="decimal"
              placeholder={currency}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#3525cd]/40 focus:ring-2 focus:ring-[#3525cd]/20"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={submitting}
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-700">{labels.daysLabel}</span>
            <input
              type="number"
              min={1}
              max={365}
              step="1"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#3525cd]/40 focus:ring-2 focus:ring-[#3525cd]/20"
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(e.target.value)}
              disabled={submitting}
              required
            />
          </label>
        </div>

        <p className="text-xs text-slate-600">{labels.reassurance}</p>
        <p className="text-xs text-slate-500">{labels.firstStep}</p>

        {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</p> : null}
        {success ? <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">{success}</p> : null}
        {success && conversationThreadId ? (
          <p className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
            {labels.conversationHint}{" "}
            <a
              href={`/messages?thread=${encodeURIComponent(conversationThreadId)}&from=proposal`}
              className="font-semibold text-[#3525cd] hover:underline"
            >
              {labels.openConversation}
            </a>
          </p>
        ) : null}
        {success && !conversationThreadId && clientUserId ? (
          <p className="text-[11px] text-slate-500">{labels.conversationError}</p>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setIntro("");
            setApproach("");
            setTimeline("");
            setAmount("");
            setEstimatedDays("");
            clearDraftStorage();
            setDraftNotice(labels.draftCleared);
          }}
          className="inline-flex text-xs font-semibold text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
        >
          {labels.clearDraft}
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="nw-cta-primary inline-flex w-full items-center justify-center px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? labels.sending : labels.send}
        </button>
      </form>
    </>
  );
}
