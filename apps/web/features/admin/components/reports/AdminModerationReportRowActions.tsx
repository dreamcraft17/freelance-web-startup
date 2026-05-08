"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchWithCsrf } from "@/features/auth/lib/fetch-with-csrf";
import { cn } from "@/lib/utils";

type Props = {
  reportId: string;
  status: string;
  assigneeId: string | null;
  staffUserId: string;
};

function TinyButton({
  children,
  onClick,
  disabled,
  variant = "neutral"
}: {
  children: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "neutral" | "primary" | "danger";
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm disabled:opacity-50",
        variant === "neutral" && "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
        variant === "primary" && "border-indigo-900/40 bg-[#433C93] text-white hover:bg-[#392f82]",
        variant === "danger" && "border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100"
      )}
    >
      {children}
    </button>
  );
}

/** Dense triage controls for a single moderation report row (CSRF-backed PATCH). */
export function AdminModerationReportRowActions({ reportId, status, assigneeId, staffUserId }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function patch(payload: Record<string, unknown>) {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetchWithCsrf(`/api/admin/reports/${encodeURIComponent(reportId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErr(body.error ?? `Request failed (${res.status})`);
        return;
      }
      setNote("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const mine = assigneeId === staffUserId;

  return (
    <div className="flex min-w-[11rem] max-w-[16rem] flex-col gap-1.5">
      <div className="flex flex-wrap gap-1">
        {!mine ? (
          <TinyButton
            disabled={busy}
            variant="neutral"
            onClick={() => patch({ assignedToStaffUserId: staffUserId })}
          >
            Assign me
          </TinyButton>
        ) : (
          <TinyButton disabled={busy} variant="neutral" onClick={() => patch({ assignedToStaffUserId: null })}>
            Unassign
          </TinyButton>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        <TinyButton
          disabled={busy || status === "IN_REVIEW"}
          variant="neutral"
          onClick={() => patch({ status: "IN_REVIEW" })}
        >
          Review
        </TinyButton>
        <TinyButton
          disabled={busy || status === "RESOLVED"}
          variant="primary"
          onClick={() => patch({ status: "RESOLVED" })}
        >
          Resolve
        </TinyButton>
        <TinyButton
          disabled={busy || status === "DISMISSED"}
          variant="neutral"
          onClick={() => patch({ status: "DISMISSED" })}
        >
          Dismiss
        </TinyButton>
        <TinyButton disabled={busy || status === "OPEN"} variant="neutral" onClick={() => patch({ status: "OPEN" })}>
          Reopen
        </TinyButton>
      </div>
      <label className="block">
        <span className="sr-only">Internal note</span>
        <textarea
          rows={2}
          value={note}
          placeholder="Internal note…"
          onChange={(e) => setNote(e.target.value)}
          className="w-full resize-y rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-900"
          maxLength={4000}
        />
      </label>
      <div className="flex flex-wrap items-center gap-1">
        <TinyButton disabled={busy || note.trim().length < 1} variant="neutral" onClick={() => patch({ addNote: note })}>
          Append note
        </TinyButton>
        <TinyButton
          disabled={busy || note.trim().length < 1}
          variant="neutral"
          onClick={() =>
            patch({
              status: "IN_REVIEW",
              addNote: note.trim()
            })
          }
        >
          Note + Review
        </TinyButton>
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" aria-hidden /> : null}
      </div>
      {err ? <p className="text-[10px] text-rose-600">{err}</p> : null}
    </div>
  );
}
