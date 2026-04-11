"use client";

export function SupportPlatformCta() {
  async function onSupport() {
    const raw = window.prompt("Optional support amount (demo — no real charge)", "25");
    if (raw == null) return;
    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount <= 0) return;

    const res = await fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency: "USD" })
    });

    if (!res.ok) {
      window.alert("Could not record support. Try again later.");
      return;
    }

    window.alert("Thank you — support recorded (mock payment).");
  }

  return (
    <button
      type="button"
      onClick={onSupport}
      className="shrink-0 rounded-md border border-transparent bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90"
    >
      Support platform ❤️
    </button>
  );
}
