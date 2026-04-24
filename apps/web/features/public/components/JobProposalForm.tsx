"use client";

import { useState } from "react";
import { submitBidSchema } from "@acme/validators";
import { fetchWithCsrf } from "@/features/auth/lib/fetch-with-csrf";
import { AuthSubmitOverlay } from "@/features/auth/components/AuthSubmitOverlay";

type JobProposalFormProps = {
  jobId: string;
  currency: string;
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
  };
  onSubmitted?: () => void;
};

export function JobProposalForm({ jobId, currency, labels, onSubmitted }: JobProposalFormProps) {
  const [intro, setIntro] = useState("");
  const [approach, setApproach] = useState("");
  const [timeline, setTimeline] = useState("");
  const [amount, setAmount] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{labels.title}</p>
          <p className="mt-1 text-xs text-slate-600">{labels.subtitle}</p>
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
