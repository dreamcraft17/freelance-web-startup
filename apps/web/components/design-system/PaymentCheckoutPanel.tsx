"use client";

import { useMemo, useState } from "react";
import { V2_PRICING } from "@acme/config";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EscrowStatus } from "@/components/design-system/EscrowStatus";
import { PriceBreakdown } from "@/components/design-system/PriceDisplay";
import { cn } from "@/lib/utils";

type PaymentMethod = "stripe" | "midtrans" | "mock";

type Props = {
  contractId?: string;
  paymentIntentId?: string;
  contractTitle?: string;
  freelancerName?: string;
  bidAmountCents?: number;
  currency?: string;
  className?: string;
};

export function PaymentCheckoutPanel({
  contractId = "",
  paymentIntentId = "",
  contractTitle = "Contract work",
  freelancerName = "Freelancer",
  bidAmountCents = 400_000,
  currency = "IDR",
  className
}: Props) {
  const [method, setMethod] = useState<PaymentMethod>("stripe");
  const [agreedEscrow, setAgreedEscrow] = useState(false);
  const [agreedBid, setAgreedBid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<"idle" | "success" | "error">("idle");

  const lines = useMemo(() => {
    const escrowFee = Math.round(bidAmountCents * V2_PRICING.escrowFeeRate);
    const tax = Math.round((bidAmountCents + escrowFee) * 0.1);
    return [
      { label: "Bid amount", amountCents: bidAmountCents },
      { label: `Escrow fee (${V2_PRICING.escrowFeeRate * 100}%)`, amountCents: escrowFee },
      { label: "Tax (PPN 10%)", amountCents: tax }
    ];
  }, [bidAmountCents]);

  const totalCents = lines.reduce((sum, l) => sum + l.amountCents, 0);
  const canPay = agreedEscrow && agreedBid && (contractId.length > 0 || paymentIntentId.length > 0);

  async function payNow() {
    if (!canPay) return;
    setBusy(true);
    setResult("idle");
    try {
      const csrfRes = await fetch("/api/auth/csrf");
      const csrfJson = (await csrfRes.json()) as { data?: { token?: string } };
      const token = csrfJson.data?.token ?? "";
      const endpoint =
        method === "midtrans" ? "/api/payments/midtrans/create-snap" : "/api/payments/stripe/create-intent";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
        body: JSON.stringify({ contractId: contractId || paymentIntentId })
      });
      setResult(res.ok ? "success" : "error");
    } catch {
      setResult("error");
    } finally {
      setBusy(false);
    }
  }

  if (result === "success") {
    return (
      <Card className={cn("nw-card p-6 text-center", className)}>
        <p className="text-lg font-semibold text-nw-success">Payment initiated</p>
        <p className="mt-2 text-sm text-slate-600">Your escrow is being set up. You will receive a confirmation shortly.</p>
        <EscrowStatus phase="locked" className="mt-6 text-left" />
      </Card>
    );
  }

  return (
    <div className={cn("grid gap-6 lg:grid-cols-[1fr_320px]", className)}>
      <Card className="nw-card p-5 sm:p-6">
        <h1 className="nw-v2-h2 text-2xl">Checkout</h1>
        <p className="mt-2 text-sm text-slate-600">Review fees before you pay. No hidden charges.</p>

        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-slate-900">Payment method</p>
          {(
            [
              { id: "stripe" as const, label: "Card (Stripe)", hint: "Debit or credit card" },
              { id: "midtrans" as const, label: "Bank transfer / e-wallet (Midtrans)", hint: "VA, OVO, GoPay" },
              { id: "mock" as const, label: "Mock (dev only)", hint: "Simulate success" }
            ] as const
          ).map((opt) => (
            <label
              key={opt.id}
              className={cn(
                "flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                method === opt.id ? "border-nw-brand/40 bg-nw-brand/5" : "border-slate-200 hover:border-slate-300"
              )}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={opt.id}
                checked={method === opt.id}
                onChange={() => setMethod(opt.id)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-slate-900">{opt.label}</span>
                <span className="block text-xs text-slate-500">{opt.hint}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="mt-6 space-y-2 text-sm">
          <label className="flex min-h-11 items-start gap-2">
            <input type="checkbox" checked={agreedEscrow} onChange={(e) => setAgreedEscrow(e.target.checked)} className="mt-1" />
            I agree to escrow terms
          </label>
          <label className="flex min-h-11 items-start gap-2">
            <input type="checkbox" checked={agreedBid} onChange={(e) => setAgreedBid(e.target.checked)} className="mt-1" />
            I confirm this bid amount is correct
          </label>
        </div>

        {result === "error" && (
          <p className="mt-4 rounded-lg border border-nw-danger/30 bg-nw-danger/10 px-3 py-2 text-sm text-red-800">
            Payment could not be started. Sign in and try again, or use mock mode in development.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button disabled={!canPay || busy || method === "mock"} onClick={payNow} className="min-h-11 px-6">
            {busy ? "Processing…" : "Pay now"}
          </Button>
          {method === "mock" && (
            <Button variant="secondary" disabled={!canPay || busy} onClick={() => setResult("success")} className="min-h-11">
              Simulate success
            </Button>
          )}
        </div>
      </Card>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Card className="nw-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-nw-brand">Contract summary</p>
          <p className="mt-2 font-semibold text-slate-900">{contractTitle}</p>
          <p className="text-sm text-slate-600">Freelancer: {freelancerName}</p>
          <PriceBreakdown lines={lines} totalCents={totalCents} currency={currency} className="mt-4" />
        </Card>
        <EscrowStatus phase="pending" />
      </aside>
    </div>
  );
}
