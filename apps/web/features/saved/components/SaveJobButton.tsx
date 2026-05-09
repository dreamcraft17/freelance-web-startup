"use client";

import { fetchWithCsrf } from "@/features/auth/lib/fetch-with-csrf";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/features/i18n/I18nProvider";

type ApiOk<T> = { success: true; data: T };
type ApiErr = { success: false; error?: string };

async function readJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

type SaveJobButtonProps = {
  jobId: string;
  /** When set, skips loading ids from the API (e.g. server-resolved saved state). */
  initialSaved?: boolean;
  onSavedChange?: (saved: boolean) => void;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
  /** Compact bookmark control for dense cards (labels from i18n). */
  appearance?: "label" | "icon";
};

export function SaveJobButton({
  jobId,
  initialSaved,
  onSavedChange,
  size = "sm",
  variant = "outline",
  className,
  appearance = "label"
}: SaveJobButtonProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const controlled = initialSaved !== undefined;
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
      const res = await fetch("/api/saved-items/jobs?idsOnly=1", { credentials: "include" });
      if (cancelled) return;
      if (res.status === 401) {
        setSaved(false);
        return;
      }
      const body = await readJson<ApiOk<{ jobIds: string[] }> | ApiErr>(res);
      if (!body.success || !("data" in body)) {
        setSaved(false);
        return;
      }
      setSaved(body.data.jobIds.includes(jobId));
    })();
    return () => {
      cancelled = true;
    };
  }, [controlled, initialSaved, jobId]);

  const applySaved = useCallback((next: boolean) => {
    setSaved(next);
    onSavedChangeRef.current?.(next);
  }, []);

  const toggle = async () => {
    if (busy || saved === null) return;
    setBusy(true);
    try {
      if (!saved) {
        const res = await fetchWithCsrf("/api/saved-items/jobs", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId })
        });
        if (res.status === 401) {
          window.location.href = `/login?intent=save-job&returnUrl=${encodeURIComponent(pathname || "/jobs")}`;
          return;
        }
        const body = await readJson<ApiOk<{ saved: true }> | ApiErr>(res);
        if (body.success) applySaved(true);
      } else {
        const res = await fetchWithCsrf("/api/saved-items/jobs", {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId })
        });
        if (res.status === 401) {
          window.location.href = `/login?intent=save-job&returnUrl=${encodeURIComponent(pathname || "/jobs")}`;
          return;
        }
        const body = await readJson<ApiOk<{ saved: false }> | ApiErr>(res);
        if (body.success) applySaved(false);
      }
    } finally {
      setBusy(false);
    }
  };

  const iconSize = appearance === "icon" ? "icon" : size;
  const iconVariant = appearance === "icon" ? "ghost" : variant;

  if (saved === null) {
    return (
      <Button
        type="button"
        size={iconSize}
        variant={iconVariant}
        className={className}
        disabled
        aria-busy
      >
        {appearance === "icon" ? (
          <Bookmark className="h-4 w-4 opacity-40" aria-hidden />
        ) : (
          "…"
        )}
      </Button>
    );
  }

  const labelBusy = busy ? "…" : saved ? t("public.jobs.savedJobShort") : t("public.jobs.saveJobShort");
  const aria = saved ? t("public.jobs.savedJobShort") : t("public.jobs.saveJobShort");

  return (
    <Button
      type="button"
      size={iconSize}
      variant={saved && appearance === "icon" ? "secondary" : appearance === "icon" ? iconVariant : saved ? "secondary" : variant}
      className={className}
      disabled={busy}
      aria-label={appearance === "icon" ? aria : undefined}
      aria-pressed={appearance === "icon" ? saved : undefined}
      onClick={() => void toggle()}
    >
      {appearance === "icon" ? (
        <Bookmark
          className={["h-4 w-4", saved ? "fill-[#3525cd] text-[#3525cd]" : "text-slate-500"].join(" ")}
          aria-hidden
        />
      ) : (
        labelBusy
      )}
    </Button>
  );
}
