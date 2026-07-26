import { db } from "./client";

/** Inline notification helpers for worker / money-jobs (no app-layer dependency). */
export async function notifyPayoutSent(userId: string, payoutId: string, amountCents: number) {
  await db.notification.create({
    data: {
      userId,
      type: "PAYOUT_SENT",
      title: "Payout sent",
      body: `Your payout of ${amountCents} has been processed and sent to your bank account.`,
      payload: { payoutId, amountCents, kind: "PAYOUT_SENT" }
    }
  });
}

export async function notifyEscrowReleased(
  freelancerUserId: string,
  contractId: string,
  releasedCents: number
) {
  await db.notification.create({
    data: {
      userId: freelancerUserId,
      type: "ESCROW_RELEASED",
      title: "Escrow funds released",
      body: `${releasedCents} has been released to your wallet for contract ${contractId.slice(0, 8)}…`,
      payload: { contractId, releasedCents, kind: "ESCROW_RELEASED" }
    }
  });
}
