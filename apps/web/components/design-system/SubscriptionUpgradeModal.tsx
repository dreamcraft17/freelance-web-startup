"use client";

import { useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/design-system/PriceDisplay";

type Props = {
  currentPlan?: string;
  proPriceCents?: number;
  currency?: string;
};

export function SubscriptionUpgradeModal({
  currentPlan = "Free",
  proPriceCents = 990_000,
  currency = "IDR"
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [method, setMethod] = useState<"stripe" | "midtrans" | "mock">("stripe");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function open() {
    setMessage(null);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  async function upgrade() {
    setBusy(true);
    setMessage(null);
    try {
      const csrfRes = await fetch("/api/auth/csrf");
      const csrfJson = (await csrfRes.json()) as { data?: { token?: string } };
      const token = csrfJson.data?.token ?? "";
      const res = await fetch("/api/subscriptions/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
        body: JSON.stringify({ planId: "PRO", paymentMethod: method })
      });
      const json = (await res.json()) as { error?: { message?: string }; data?: unknown };
      if (res.ok) {
        setMessage("Upgrade initiated. Complete payment to activate PRO.");
      } else {
        setMessage(json.error?.message ?? "Upgrade failed. Sign in and try again.");
      }
    } catch {
      setMessage("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button onClick={open} className="min-h-11 gap-2">
        <Sparkles className="h-4 w-4" aria-hidden />
        Upgrade to PRO
      </Button>

      <dialog
        ref={dialogRef}
        className="w-[min(100%,28rem)] max-h-[90vh] overflow-auto rounded-2xl border border-slate-200 bg-white p-0 shadow-nw-elevated backdrop:bg-slate-900/50 dark:border-slate-700 dark:bg-slate-900"
        aria-labelledby="upgrade-modal-title"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-nw-brand">Subscription</p>
            <h2 id="upgrade-modal-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
              Upgrade from {currentPlan}
            </h2>
          </div>
          <button type="button" onClick={close} className="nw-touch-target rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
          <ul className="space-y-2">
            <li>Unlimited active bids</li>
            <li>Featured profile placement</li>
            <li>Priority support</li>
          </ul>
          <PriceDisplay amountCents={proPriceCents} currency={currency} label="PRO monthly" size="lg" />
          <div className="space-y-2">
            <p className="font-medium text-slate-900 dark:text-slate-50">Payment method</p>
            {(["stripe", "midtrans", "mock"] as const).map((m) => (
              <label key={m} className="flex min-h-11 items-center gap-2">
                <input type="radio" name="upgradeMethod" checked={method === m} onChange={() => setMethod(m)} />
                {m === "stripe" ? "Card (Stripe)" : m === "midtrans" ? "Midtrans" : "Mock (dev)"}
              </label>
            ))}
          </div>
          {message && <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800">{message}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
          <Button variant="outline" onClick={close} className="min-h-11">
            Cancel
          </Button>
          <Button onClick={upgrade} disabled={busy} className="min-h-11">
            {busy ? "Processing…" : "Confirm upgrade"}
          </Button>
        </div>
      </dialog>
    </>
  );
}
