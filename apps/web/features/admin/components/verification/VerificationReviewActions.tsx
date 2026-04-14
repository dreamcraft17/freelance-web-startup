"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  requestId: string;
};

/**
 * Staff moderation: PATCH /api/verification/:id (existing VerificationService).
 * Only rendered for PENDING rows.
 */
export function VerificationReviewActions({ requestId }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(decision: "APPROVED" | "REJECTED") {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/verification/${encodeURIComponent(requestId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          decision,
          ...(decision === "REJECTED" && note.trim() ? { note: note.trim() } : {})
        })
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        setError(payload.error ?? payload.message ?? `Request failed (${res.status})`);
        return;
      }
      setRejectOpen(false);
      setNote("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-[10rem] flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          disabled={busy}
          onClick={() => submit("APPROVED")}
          className={cn(
            "inline-flex items-center justify-center gap-1 rounded-md bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
          )}
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
          Approve
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setRejectOpen((v) => !v)}
          className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-60"
        >
          Reject…
        </button>
      </div>
      {rejectOpen ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={2000}
            placeholder="Shown to the user in notification context"
            className="mt-1 w-full resize-y rounded border border-slate-200 px-2 py-1 text-xs text-slate-900"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => submit("REJECTED")}
            className="mt-1.5 w-full rounded-md bg-rose-700 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-800 disabled:opacity-60"
          >
            Confirm reject
          </button>
        </div>
      ) : null}
      {error ? <p className="text-[11px] text-rose-600">{error}</p> : null}
    </div>
  );
}
