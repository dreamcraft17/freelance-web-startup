import Link from "next/link";

type PageProps = {
  searchParams: Promise<{ paymentIntentId?: string }>;
};

/**
 * Mock hosted checkout — real PSP will replace this URL. `paymentIntentId` matches {@link PaymentIntent.id}.
 */
export default async function MockCheckoutPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const paymentIntentId = sp.paymentIntentId?.trim() ?? "";

  return (
    <div className="mx-auto max-w-lg px-4 py-16 md:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Mock checkout</h1>
      <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
        No payment provider is connected yet. In production this page would be a redirect to Stripe (or similar).
        Your pending session id is shown below for debugging.
      </p>
      {paymentIntentId ? (
        <p className="mt-6 rounded-md border bg-muted/40 p-3 font-mono text-xs break-all">{paymentIntentId}</p>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">Missing <code className="text-foreground">paymentIntentId</code> query param.</p>
      )}
      <p className="mt-8">
        <Link href="/" className="text-primary text-sm font-medium underline-offset-4 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
