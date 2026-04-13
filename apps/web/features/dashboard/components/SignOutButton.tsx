"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  compact?: boolean;
  className?: string;
};

export function SignOutButton({ compact = false, className }: SignOutButtonProps) {
  const router = useRouter();
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
        router.replace("/");
        router.refresh();
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
          "w-full justify-start gap-2 text-slate-700 hover:text-slate-900",
          compact ? "h-8 px-2.5 text-xs font-semibold" : "h-9 rounded-lg border-slate-200 bg-white"
        )}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogOut className="h-4 w-4" aria-hidden />}
        {isPending ? "Signing out..." : "Sign out"}
      </Button>
      {error ? <p className="px-1 text-[11px] text-rose-600">{error}</p> : null}
    </div>
  );
}
