"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function BidDecisionAction({ bidId, currentStatus }: { bidId: string; currentStatus: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const canAccept = currentStatus === "SUBMITTED";

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

  if (!canAccept) {
    return <span className="text-xs font-medium text-slate-500">No action</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onAccept}
        disabled={pending}
        className="inline-flex items-center rounded-md bg-[#433C93] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#4d45a5] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Accepting..." : "Accept bid"}
      </button>
      {error ? <p className="text-[11px] text-rose-600">{error}</p> : null}
    </div>
  );
}
