"use client";

import { useMemo, useState } from "react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ProposalHandoffBannerProps = {
  message: string;
};

export function ProposalHandoffBanner({ message }: ProposalHandoffBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const visible = useMemo(() => !dismissed, [dismissed]);
  if (!visible) return null;

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
      <p>{message}</p>
      <button
        type="button"
        className="shrink-0 text-xs font-semibold text-slate-500 hover:text-slate-800"
        onClick={() => {
          setDismissed(true);
          const next = new URLSearchParams(searchParams.toString());
          next.delete("from");
          const query = next.toString();
          router.replace((query ? `${pathname}?${query}` : pathname) as Route, { scroll: false });
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
