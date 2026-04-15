"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function BidDecisionAction({ bidId, currentStatus }: { bidId: string; currentStatus: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const canAccept = currentStatus === "SUBMITTED" || currentStatus === "SHORTLISTED";
  const canShortlist = currentStatus === "SUBMITTED";
  const isAccepted = currentStatus === "ACCEPTED";
  const isShortlisted = currentStatus === "SHORTLISTED";
  const isResolved = currentStatus === "REJECTED" || currentStatus === "WITHDRAWN";

  function onShortlist() {
    if (!canShortlist || pending) return;
    startTransition(async () => {
      setError(null);
      const res = await fetch(`/api/bids/${encodeURIComponent(bidId)}/shortlist`, { method: "POST" });
      if (!res.ok) {
        setError("Could not shortlist this bid.");
        return;
      }
      router.refresh();
    });
  }

  function onAccept() {
    if (!canAccept || pending) return;
    startTransition(async () => {
      setError(null);
      const res = await fetch(`/api/bids/${encodeURIComponent(bidId)}/accept`, { method: "POST" });
      if (!res.ok) {
        setError("Could not accept this bid right now.");
        return;
      }
      router.refresh();
    });
  }

  if (isAccepted) {
    return <span className="inline-flex rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">Hired</span>;
  }
  if (isResolved) {
    return <span className="text-xs font-medium text-slate-500">Resolved</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        {canShortlist ? (
          <button
            type="button"
            onClick={onShortlist}
            disabled={pending}
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "..." : "Shortlist"}
          </button>
        ) : isShortlisted ? (
          <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
            Shortlisted
          </span>
        ) : null}

        <button
          type="button"
          onClick={onAccept}
          disabled={pending}
          className="inline-flex items-center rounded-md bg-[#433C93] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#4d45a5] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Accepting..." : "Accept bid"}
        </button>
      </div>
      {error ? <p className="text-[11px] text-rose-600">{error}</p> : null}
    </div>
  );
}
