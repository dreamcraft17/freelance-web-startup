"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchWithCsrf } from "@/features/auth/lib/fetch-with-csrf";
import { cn } from "@/lib/utils";

type Props = {
  jobId: string;
  moderationHiddenAt: Date | string | null;
};

export function AdminJobModerationToggle({ jobId, moderationHiddenAt }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const hidden = moderationHiddenAt != null;

  async function toggle(nextHidden: boolean) {
    setBusy(true);
    try {
      const res = await fetchWithCsrf(`/api/admin/jobs/${encodeURIComponent(jobId)}/moderation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hidden: nextHidden,
          ...(nextHidden ? { reason: "Moderation hide from discovery" } : {})
        })
      });
      if (!res.ok) return;
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <button
        type="button"
        disabled={busy || hidden}
        onClick={() => toggle(true)}
        className={cn(
          "rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1",
          hidden ? "cursor-not-allowed bg-slate-50 text-slate-400 ring-slate-100" : "bg-rose-50 text-rose-900 ring-rose-100 hover:bg-rose-100"
        )}
      >
        Hide
      </button>
      <button
        type="button"
        disabled={busy || !hidden}
        onClick={() => toggle(false)}
        className={cn(
          "rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1",
          !hidden ? "cursor-not-allowed bg-slate-50 text-slate-400 ring-slate-100" : "bg-emerald-50 text-emerald-900 ring-emerald-100 hover:bg-emerald-100"
        )}
      >
        Unhide
      </button>
      {busy ? <Loader2 className="h-3 w-3 animate-spin text-slate-500" aria-hidden /> : null}
    </div>
  );
}
