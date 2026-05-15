"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchWithCsrf } from "@/features/auth/lib/fetch-with-csrf";
import { cn } from "@/lib/utils";

type Props = {
  userId: string;
  /** Only marketplace roles should render this component. */
  role: string;
  accountStatus: string;
};

export function AdminUserSuspendToggle({ userId, role, accountStatus }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (role !== "CLIENT" && role !== "FREELANCER") return null;

  const suspended = accountStatus === "SUSPENDED";

  async function setStatus(next: "ACTIVE" | "SUSPENDED") {
    setBusy(true);
    try {
      const res = await fetchWithCsrf(`/api/admin/users/${encodeURIComponent(userId)}/moderation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountStatus: next === "SUSPENDED" ? "SUSPENDED" : "ACTIVE"
        })
      });
      if (!res.ok) return;
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-1">
      <button
        type="button"
        disabled={busy || suspended}
        onClick={() => setStatus("SUSPENDED")}
        className={cn(
          "rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1",
          suspended ? "cursor-not-allowed bg-slate-50 text-slate-400 ring-slate-100" : "bg-rose-50 text-rose-900 ring-rose-100"
        )}
      >
        Suspend
      </button>
      <button
        type="button"
        disabled={busy || !suspended}
        onClick={() => setStatus("ACTIVE")}
        className={cn(
          "rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1",
          !suspended ? "cursor-not-allowed bg-slate-50 text-slate-400 ring-slate-100" : "bg-emerald-50 text-emerald-900 ring-emerald-100"
        )}
      >
        Activate
      </button>
      {busy ? <Loader2 className="h-3 w-3 animate-spin text-slate-500" aria-hidden /> : null}
    </div>
  );
}
