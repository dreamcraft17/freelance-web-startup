"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { fetchWithCsrf } from "@/features/auth/lib/fetch-with-csrf";
import { useI18n } from "@/features/i18n/I18nProvider";

type ReportCategory = "spam" | "harassment" | "scam" | "policy" | "ip" | "other";

const CATEGORY_ORDER: ReportCategory[] = ["spam", "harassment", "scam", "policy", "ip", "other"];

type Props = { jobId: string };

export function ReportJobButton({ jobId }: Props) {
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

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetchWithCsrf("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectType: "JOB",
          subjectJobId: jobId,
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

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError(null);
          setFeedback(null);
        }}
        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50"
        aria-label={t("public.moderation.reportJobAria")}
      >
        <Flag className="h-3.5 w-3.5" aria-hidden />
        {t("public.moderation.reportJobCta")}
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
