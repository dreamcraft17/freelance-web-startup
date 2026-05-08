"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { fetchWithCsrf } from "@/features/auth/lib/fetch-with-csrf";
import { useI18n } from "@/features/i18n/I18nProvider";
import { cn } from "@/lib/utils";

type ReportCategory = "spam" | "harassment" | "scam" | "policy" | "ip" | "other";

const CATEGORY_ORDER: ReportCategory[] = ["spam", "harassment", "scam", "policy", "ip", "other"];

export type ModerationReportTargetPayload =
  | { subjectType: "USER"; subjectUserId: string }
  | { subjectType: "JOB"; subjectJobId: string }
  | { subjectType: "BID"; subjectBidId: string }
  | { subjectType: "REVIEW"; subjectReviewId: string }
  | { subjectType: "MESSAGE_THREAD"; subjectThreadId: string }
  | { subjectType: "MESSAGE"; subjectMessageId: string };

export type ModerationReportIntent = "job" | "user" | "bid" | "review" | "thread" | "message";

type Props = {
  target: ModerationReportTargetPayload;
  intent: ModerationReportIntent;
  variant?: "button" | "text";
  /** Narrower trigger for dense tables / mobile trust row */
  density?: "default" | "compact";
  className?: string;
};

/** Generic intake UI for `POST /api/reports` (double-submit CSRF handled by fetchWithCsrf). */
export function ModerationReportButton({
  target,
  intent,
  variant = "button",
  density = "default",
  className
}: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ReportCategory>("policy");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function categoryLabel(cat: ReportCategory): string {
    switch (cat) {
      case "spam":
        return t("public.moderation.spam");
      case "harassment":
        return t("public.moderation.harassment");
      case "scam":
        return t("public.moderation.scam");
      case "policy":
        return t("public.moderation.policy");
      case "ip":
        return t("public.moderation.ip");
      case "other":
        return t("public.moderation.other");
      default:
        return cat;
    }
  }

  function ctaAria(): string {
    switch (intent) {
      case "job":
        return t("public.moderation.reportJobAria");
      case "user":
        return t("public.moderation.reportUserAria");
      case "bid":
        return t("public.moderation.reportBidAria");
      case "review":
        return t("public.moderation.reportReviewAria");
      case "thread":
        return t("public.moderation.reportThreadAria");
      case "message":
        return t("public.moderation.reportMessageAria");
      default:
        return t("public.moderation.reportGenericAria");
    }
  }

  function ctaLabel(): string {
    switch (intent) {
      case "job":
        return t("public.moderation.reportJobCta");
      case "user":
        return t("public.moderation.reportUserCta");
      case "bid":
        return t("public.moderation.reportBidCta");
      case "review":
        return t("public.moderation.reportReviewCta");
      case "thread":
        return t("public.moderation.reportThreadCta");
      case "message":
        return t("public.moderation.reportMessageCta");
      default:
        return t("public.moderation.reportGenericCta");
    }
  }

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetchWithCsrf("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...target,
          category,
          description
        })
      });
      const body = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !body.success) {
        setError(body.error ?? t("public.moderation.error"));
        return;
      }
      setFeedback(t("public.moderation.success"));
      setDescription("");
      window.setTimeout(() => {
        setOpen(false);
        setFeedback(null);
      }, 1200);
    } catch {
      setError(t("public.moderation.error"));
    } finally {
      setBusy(false);
    }
  }

  const triggerClass =
    variant === "text"
      ? density === "compact"
        ? "text-[10px] font-semibold uppercase tracking-wide text-slate-500 underline-offset-2 hover:text-[#433C93] hover:underline disabled:opacity-50 px-1 py-2"
        : "text-[11px] font-semibold text-slate-500 underline-offset-2 hover:text-[#433C93] hover:underline disabled:opacity-50"
      : density === "compact"
        ? "inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50"
        : "inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50";

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError(null);
          setFeedback(null);
        }}
        className={cn(triggerClass, className)}
        aria-label={ctaAria()}
      >
        {variant === "button" ? <Flag className="h-3.5 w-3.5" aria-hidden /> : null}
        {ctaLabel()}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label={t("public.moderation.cancel")}
            onClick={() => !busy && setOpen(false)}
          />
          <div className="relative z-[61] mb-0 w-full max-w-lg rounded-t-2xl border border-slate-200 bg-white p-5 shadow-xl sm:m-4 sm:rounded-2xl">
            <h2 className="text-lg font-semibold text-slate-900">{t("public.moderation.dialogTitle")}</h2>
            <p className="mt-1 text-sm text-slate-600">{t("public.moderation.dialogLead")}</p>

            <label className="mt-4 block">
              <span className="text-xs font-semibold text-slate-700">{t("public.moderation.categoryLabel")}</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReportCategory)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
                disabled={busy}
              >
                {CATEGORY_ORDER.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabel(cat)}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-3 block">
              <span className="text-xs font-semibold text-slate-700">{t("public.moderation.descriptionLabel")}</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={busy}
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#3525cd]/35 focus:ring-2 focus:ring-[#3525cd]/20"
                placeholder={t("public.moderation.descriptionHint")}
                required
              />
              <span className="mt-1 block text-[11px] text-slate-500">{t("public.moderation.descriptionHint")}</span>
            </label>

            {error ? (
              <p className="mt-2 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</p>
            ) : null}
            {feedback ? (
              <p className="mt-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                {feedback}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={busy}
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
              >
                {t("public.moderation.cancel")}
              </button>
              <button
                type="button"
                disabled={busy || description.trim().length < 10}
                onClick={() => submit()}
                className="rounded-lg bg-[#3525cd] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d20b0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("public.moderation.submit")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
