"use client";

import { useState, useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  compact?: boolean;
  className?: string;
};

export function SignOutButton({ compact = false, className }: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSignOut = () => {
    if (isPending) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/logout", { method: "POST" });
        if (!res.ok) {
          setError("Could not sign out");
          return;
        }
        // Hard navigation guarantees protected UI unmounts immediately.
        window.location.assign("/");
      } catch {
        setError("Could not sign out");
      }
    });
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <Button
        type="button"
        onClick={onSignOut}
        disabled={isPending}
        variant={compact ? "ghost" : "outline"}
        className={cn(
          "w-full justify-start gap-2",
          compact
            ? "h-9 rounded-lg border-l-[3px] border-l-transparent px-3 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-rose-700"
            : "h-9 rounded-lg border-slate-200 bg-white text-slate-700 hover:text-slate-900"
        )}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogOut className="h-4 w-4" aria-hidden />}
        {isPending ? "Signing out..." : "Sign out"}
      </Button>
      {error ? <p className="px-1 text-[11px] text-rose-600">{error}</p> : null}
    </div>
  );
}
