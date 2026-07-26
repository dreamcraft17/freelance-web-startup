import { NotificationType } from "@acme/types";
import { NotificationService } from "./notification.service";

const notifications = new NotificationService();

export async function notifyEscrowPaymentRequired(params: {
  clientUserId: string;
  contractId: string;
  amountCents: number;
  currency: string;
}) {
  await notifications.createForUser({
    userId: params.clientUserId,
    type: NotificationType.ESCROW_PAYMENT_REQUIRED,
    title: "Payment required",
    body: `Complete escrow payment (${params.amountCents} ${params.currency}) to start your contract.`,
    payload: {
      contractId: params.contractId,
      amountCents: params.amountCents,
      currency: params.currency,
      kind: "ESCROW_PAYMENT_REQUIRED"
    }
  });
}

export async function notifyEscrowWorkSubmitted(params: {
  clientUserId: string;
  contractId: string;
  freelancerLabel?: string;
}) {
  await notifications.createForUser({
    userId: params.clientUserId,
    type: NotificationType.ESCROW_WORK_SUBMITTED,
    title: "Work submitted for review",
    body: params.freelancerLabel
      ? `${params.freelancerLabel} submitted work for your review.`
      : "The freelancer submitted work for your review.",
    payload: {
      contractId: params.contractId,
      kind: "ESCROW_WORK_SUBMITTED"
    }
  });
}

export async function notifyEscrowReleased(params: {
  freelancerUserId: string;
  contractId: string;
  releasedCents: number;
}) {
  await notifications.createForUser({
    userId: params.freelancerUserId,
    type: NotificationType.ESCROW_RELEASED,
    title: "Escrow funds released",
    body: `${params.releasedCents} has been released to your wallet.`,
    payload: {
      contractId: params.contractId,
      releasedCents: params.releasedCents,
      kind: "ESCROW_RELEASED"
    }
  });
}
