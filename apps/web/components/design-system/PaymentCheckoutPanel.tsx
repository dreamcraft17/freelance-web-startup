"use client";

import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
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
  /** Server-sourced bid/escrow base amount (required for accurate totals). */
  bidAmountCents?: number;
  currency?: string;
  className?: string;
};

declare global {
  interface Window {
    snap?: { pay: (token: string, opts?: Record<string, unknown>) => void };
  }
}

async function fetchCsrf(): Promise<string> {
  const csrfRes = await fetch("/api/auth/csrf");
  const csrfJson = (await csrfRes.json()) as { data?: { token?: string } };
  return csrfJson.data?.token ?? "";
}

function loadMidtransSnap(clientKey: string, isProd: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.snap) {
      resolve();
      return;
    }
    const src = isProd
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Snap script failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.setAttribute("data-client-key", clientKey);
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Snap script failed"));
    document.body.appendChild(script);
  });
}

export function PaymentCheckoutPanel({
  contractId = "",
  paymentIntentId = "",
  contractTitle = "Contract work",
  freelancerName = "Freelancer",
  bidAmountCents,
  currency = "IDR",
  className
}: Props) {
  const [method, setMethod] = useState<PaymentMethod>("stripe");
  const [agreedEscrow, setAgreedEscrow] = useState(false);
  const [agreedBid, setAgreedBid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<"idle" | "success" | "error" | "redirecting">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [serverAmountCents, setServerAmountCents] = useState<number | null>(bidAmountCents ?? null);
  const [serverCurrency, setServerCurrency] = useState(currency);

  const resolvedContractId = contractId || paymentIntentId;
  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    if (bidAmountCents != null && bidAmountCents > 0) {
      setServerAmountCents(bidAmountCents);
      return;
    }
    if (!resolvedContractId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/contracts/${resolvedContractId}`);
        if (!res.ok) return;
        const json = (await res.json()) as {
          data?: { amount?: number | null; currency?: string | null; escrowAmountCents?: number | null };
        };
        const amount = json.data?.escrowAmountCents ?? json.data?.amount;
        if (!cancelled && typeof amount === "number" && Number.isFinite(amount) && amount > 0) {
          setServerAmountCents(Math.round(amount));
          if (json.data?.currency) setServerCurrency(json.data.currency);
        }
      } catch {
        /* keep previous */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bidAmountCents, resolvedContractId]);

  const baseCents = serverAmountCents ?? 0;

  const lines = useMemo(() => {
    const escrowFee = Math.round(baseCents * V2_PRICING.escrowFeeRate);
    return [
      { label: "Bid amount", amountCents: baseCents },
      { label: `Escrow fee (${V2_PRICING.escrowFeeRate * 100}%)`, amountCents: escrowFee }
    ];
  }, [baseCents]);

  const totalCents = lines.reduce((sum, l) => sum + l.amountCents, 0);
  const canPay =
    agreedEscrow && agreedBid && resolvedContractId.length > 0 && baseCents > 0;

  async function payNow() {
    if (!canPay) return;
    setBusy(true);
    setResult("idle");
    setErrorMsg(null);
    try {
      const token = await fetchCsrf();

      if (method === "mock") {
        if (!isDev) {
          setResult("error");
          setErrorMsg("Mock payment is only available in development.");
          return;
        }
        const res = await fetch("/api/payments/mock/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
          body: JSON.stringify({ contractId: resolvedContractId })
        });
        setResult(res.ok ? "success" : "error");
        if (!res.ok) setErrorMsg("Mock payment simulation failed.");
        return;
      }

      if (method === "stripe") {
        const res = await fetch("/api/payments/stripe/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
          body: JSON.stringify({ contractId: resolvedContractId })
        });
        const json = (await res.json()) as {
          data?: {
            client_secret?: string | null;
            checkoutUrl?: string;
            amount?: number;
            currency?: string;
          };
          error?: { message?: string };
        };
        if (!res.ok) {
          setResult("error");
          setErrorMsg(json.error?.message ?? "Could not create Stripe payment.");
          return;
        }

        if (typeof json.data?.amount === "number") {
          const fee = Math.round(baseCents * V2_PRICING.escrowFeeRate);
          // Prefer server total for display consistency after intent creation
          void fee;
        }

        const clientSecret = json.data?.client_secret;
        if (clientSecret) {
          const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
          if (!pk) {
            setResult("error");
            setErrorMsg("Stripe publishable key is not configured.");
            return;
          }
          const stripe = await loadStripe(pk);
          if (!stripe) {
            setResult("error");
            setErrorMsg("Stripe.js failed to load.");
            return;
          }
          setResult("redirecting");
          const { error } = await stripe.confirmPayment({
            clientSecret,
            confirmParams: {
              return_url: `${window.location.origin}/checkout/mock?contractId=${resolvedContractId}&paid=1`
            }
          });
          if (error) {
            setResult("error");
            setErrorMsg(error.message ?? "Payment confirmation failed.");
            return;
          }
          setResult("success");
          return;
        }

        // MOCK / no Stripe key — server returned checkoutUrl
        if (json.data?.checkoutUrl) {
          setResult("redirecting");
          window.location.href = json.data.checkoutUrl;
          return;
        }

        setResult("error");
        setErrorMsg("No Stripe client secret or checkout URL returned.");
        return;
      }

      // Midtrans
      const res = await fetch("/api/payments/midtrans/create-snap", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
        body: JSON.stringify({ contractId: resolvedContractId })
      });
      const json = (await res.json()) as {
        data?: { snap_token?: string; snap_redirect_url?: string };
        error?: { message?: string };
      };
      if (!res.ok) {
        setResult("error");
        setErrorMsg(json.error?.message ?? "Could not create Midtrans Snap.");
        return;
      }

      const snapToken = json.data?.snap_token;
      const redirectUrl = json.data?.snap_redirect_url;
      if (snapToken && snapToken !== "mock") {
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?.trim() ?? "";
        const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
        if (clientKey) {
          await loadMidtransSnap(clientKey, isProd);
          setResult("redirecting");
          window.snap?.pay(snapToken, {
            onSuccess: () => setResult("success"),
            onPending: () => setResult("redirecting"),
            onError: () => {
              setResult("error");
              setErrorMsg("Midtrans payment failed.");
            },
            onClose: () => setBusy(false)
          });
          return;
        }
      }
      if (redirectUrl) {
        setResult("redirecting");
        window.location.href = redirectUrl;
        return;
      }
      setResult("error");
      setErrorMsg("No Midtrans Snap token or redirect URL returned.");
    } catch {
      setResult("error");
      setErrorMsg("Payment could not be started.");
    } finally {
      setBusy(false);
    }
  }

  if (result === "success") {
    return (
      <Card className={cn("nw-card p-6 text-center", className)}>
        <p className="text-lg font-semibold text-nw-success">Payment confirmed</p>
        <p className="mt-2 text-sm text-slate-600">
          Escrow is locked. The freelancer can start work once funds are confirmed.
        </p>
        <EscrowStatus phase="locked" className="mt-6 text-left" />
      </Card>
    );
  }

  const methodOptions = (
    [
      { id: "stripe" as const, label: "Card (Stripe)", hint: "Debit or credit card" },
      { id: "midtrans" as const, label: "Bank transfer / e-wallet (Midtrans)", hint: "VA, OVO, GoPay" },
      ...(isDev
        ? [{ id: "mock" as const, label: "Mock (dev only)", hint: "Simulate success without PSP" }]
        : [])
    ] as const
  );

  return (
    <div className={cn("grid gap-6 lg:grid-cols-[1fr_320px]", className)}>
      <Card className="nw-card p-5 sm:p-6">
        <h1 className="nw-v2-h2 text-2xl">Checkout</h1>
        <p className="mt-2 text-sm text-slate-600">Review fees before you pay. No hidden charges.</p>

        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-slate-900">Payment method</p>
          {methodOptions.map((opt) => (
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

        {(result === "error" || errorMsg) && (
          <p className="mt-4 rounded-lg border border-nw-danger/30 bg-nw-danger/10 px-3 py-2 text-sm text-red-800">
            {errorMsg ?? "Payment could not be started. Sign in and try again."}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button disabled={!canPay || busy} onClick={payNow} className="min-h-11 px-6">
            {busy || result === "redirecting" ? "Processing…" : method === "mock" ? "Simulate payment" : "Pay now"}
          </Button>
        </div>
      </Card>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Card className="nw-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-nw-brand">Contract summary</p>
          <p className="mt-2 font-semibold text-slate-900">{contractTitle}</p>
          <p className="text-sm text-slate-600">Freelancer: {freelancerName}</p>
          {baseCents > 0 ? (
            <PriceBreakdown lines={lines} totalCents={totalCents} currency={serverCurrency} className="mt-4" />
          ) : (
            <p className="mt-4 text-sm text-slate-500">Loading amount from contract…</p>
          )}
        </Card>
        <EscrowStatus phase="pending" />
      </aside>
    </div>
  );
}
