import { db, Prisma } from "@acme/database";

export type RecordDonationInput = {
  userId?: string | null;
  amount: number;
  currency: string;
  message?: string | null;
  /** MOCK today; STRIPE | MIDTRANS | XENDIT when wired. */
  provider?: string;
};

/**
 * Persists a support payment record. No external PSP call yet — replace `provider` branch later.
 */
export class DonationService {
  async recordDonation(input: RecordDonationInput) {
    const capped = Math.min(Math.max(input.amount, 0), 1_000_000);
    const row = await db.donation.create({
      data: {
        userId: input.userId ?? null,
        amount: new Prisma.Decimal(capped.toFixed(2)),
        currency: input.currency.trim().toUpperCase().slice(0, 3),
        message: input.message?.trim() ? input.message.trim().slice(0, 500) : null,
        provider: (input.provider ?? "MOCK").slice(0, 32)
      },
      select: { id: true, createdAt: true, amount: true, currency: true }
    });

    return {
      ok: true as const,
      donationId: row.id,
      createdAt: row.createdAt,
      amount: row.amount.toString(),
      currency: row.currency,
      provider: input.provider ?? "MOCK",
      note: "Recorded locally (mock). Plug PaymentIntent / charge here for production."
    };
  }
}
