import { PaymentCheckoutPanel } from "@/components/design-system/PaymentCheckoutPanel";

type PageProps = {
  searchParams: Promise<{ paymentIntentId?: string; contractId?: string }>;
};

/**
 * Checkout surface — wires to Stripe/Midtrans APIs when configured; mock mode for development.
 */
export default async function MockCheckoutPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const contractId = sp.contractId?.trim() ?? sp.paymentIntentId?.trim() ?? "";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
      <PaymentCheckoutPanel contractId={contractId} paymentIntentId={contractId} />
    </div>
  );
}
