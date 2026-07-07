"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = {
  suspensionReason?: string | null;
  className?: string;
};

export function AppealSuspensionPanel({ suspensionReason, className }: Props) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (reason.trim().length < 20) {
      setError("Please explain your appeal in at least 20 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const csrfRes = await fetch("/api/auth/csrf");
      const csrfJson = (await csrfRes.json()) as { data?: { token?: string } };
      const token = csrfJson.data?.token ?? "";
      const res = await fetch("/api/moderation/appeals", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
        body: JSON.stringify({ appealReason: reason.trim() })
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const json = (await res.json()) as { error?: { message?: string } };
        setError(json.error?.message ?? "Could not submit appeal. You may not have an active suspension.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <Card className={className}>
        <div className="nw-empty-state border-solid">
          <p className="font-semibold text-slate-900">Appeal submitted</p>
          <p className="mt-2 text-sm text-slate-600">Our moderation team will review within 7 business days.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-nw-danger/10 text-nw-danger">
            <ShieldAlert className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Suspension appeal</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {suspensionReason
                ? `Reason on record: ${suspensionReason}`
                : "If your account is suspended, submit a clear explanation for review."}
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="appeal-reason" className="block text-sm font-medium text-slate-800 dark:text-slate-200">
              Your appeal *
            </label>
            <textarea
              id="appeal-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              className="nw-input mt-2 w-full min-h-[120px] resize-y"
              placeholder="Explain why the suspension should be lifted…"
              required
              minLength={20}
            />
          </div>
          {error && (
            <p className="rounded-lg border border-nw-danger/30 bg-nw-danger/10 px-3 py-2 text-sm text-red-800">{error}</p>
          )}
          <Button type="submit" disabled={busy} className="min-h-11">
            {busy ? "Submitting…" : "Submit appeal"}
          </Button>
        </form>
      </div>
    </Card>
  );
}
