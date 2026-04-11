"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

type ApiOk<T> = { success: true; data: T };
type ApiErr = { success: false; error?: string };

async function readJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

type SaveFreelancerButtonProps = {
  freelancerProfileId: string;
  initialSaved?: boolean;
  onSavedChange?: (saved: boolean) => void;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
};

export function SaveFreelancerButton({
  freelancerProfileId,
  initialSaved,
  onSavedChange,
  size = "sm",
  variant = "outline",
  className
}: SaveFreelancerButtonProps) {
  const pathname = usePathname();
  const controlled = initialSaved !== undefined && onSavedChange !== undefined;
  const [saved, setSaved] = useState<boolean | null>(controlled ? initialSaved : null);
  const [busy, setBusy] = useState(false);
  const onSavedChangeRef = useRef(onSavedChange);
  onSavedChangeRef.current = onSavedChange;

  useEffect(() => {
    if (controlled) {
      setSaved(initialSaved);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/saved-items/freelancers?idsOnly=1", { credentials: "include" });
      if (cancelled) return;
      if (res.status === 401) {
        setSaved(false);
        return;
      }
      const body = await readJson<ApiOk<{ freelancerProfileIds: string[] }> | ApiErr>(res);
      if (!body.success || !("data" in body)) {
        setSaved(false);
        return;
      }
      setSaved(body.data.freelancerProfileIds.includes(freelancerProfileId));
    })();
    return () => {
      cancelled = true;
    };
  }, [controlled, initialSaved, freelancerProfileId]);

  const applySaved = useCallback((next: boolean) => {
    setSaved(next);
    onSavedChangeRef.current?.(next);
  }, []);

  const toggle = async () => {
    if (busy || saved === null) return;
    setBusy(true);
    try {
      if (!saved) {
        const res = await fetch("/api/saved-items/freelancers", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ freelancerProfileId })
        });
        if (res.status === 401) {
          window.location.href = `/login?returnUrl=${encodeURIComponent(pathname || "/freelancers")}`;
          return;
        }
        const body = await readJson<ApiOk<{ saved: true }> | ApiErr>(res);
        if (body.success) applySaved(true);
      } else {
        const res = await fetch("/api/saved-items/freelancers", {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ freelancerProfileId })
        });
        if (res.status === 401) {
          window.location.href = `/login?returnUrl=${encodeURIComponent(pathname || "/freelancers")}`;
          return;
        }
        const body = await readJson<ApiOk<{ saved: false }> | ApiErr>(res);
        if (body.success) applySaved(false);
      }
    } finally {
      setBusy(false);
    }
  };

  if (saved === null) {
    return (
      <Button type="button" size={size} variant={variant} className={className} disabled>
        …
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size={size}
      variant={saved ? "secondary" : variant}
      className={className}
      disabled={busy}
      onClick={() => void toggle()}
    >
      {busy ? "…" : saved ? "Saved" : "Save freelancer"}
    </Button>
  );
}
