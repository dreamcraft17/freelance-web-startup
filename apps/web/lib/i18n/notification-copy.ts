import type { Translator } from "@/lib/i18n/create-translator";

/** Persisted on notification payload for locale-aware rendering at read time. */
export type NearworkNotificationCopy =
  | { kind: "BID_SUBMITTED"; params: { freelancerLabel: string; jobTitle: string } }
  | { kind: "BID_ACCEPTED"; params: { jobTitle: string } }
  | { kind: "NEW_MESSAGE"; params: { preview: string } }
  | { kind: "VERIFICATION_APPROVED"; params: { requestType: string } }
  | { kind: "VERIFICATION_REJECTED"; params: { requestType: string; staffNote: string } };

const NW_COPY_KEY = "_nwCopy";

export function parseNearworkNotificationCopy(payload: unknown): NearworkNotificationCopy | null {
  if (!payload || typeof payload !== "object") return null;
  const raw = (payload as Record<string, unknown>)[NW_COPY_KEY];
  if (!raw || typeof raw !== "object") return null;
  const kind = (raw as Record<string, unknown>).kind;
  if (
    kind !== "BID_SUBMITTED" &&
    kind !== "BID_ACCEPTED" &&
    kind !== "NEW_MESSAGE" &&
    kind !== "VERIFICATION_APPROVED" &&
    kind !== "VERIFICATION_REJECTED"
  ) {
    return null;
  }
  return raw as NearworkNotificationCopy;
}

/**
 * Maps stored notification rows to viewer locale using `_nwCopy` when present;
 * otherwise returns persisted title/body (legacy English rows).
 */
export function localizedNotificationStrings(
  storedTitle: string,
  storedBody: string,
  payload: unknown,
  t: Translator
): { title: string; body: string } {
  const nw = parseNearworkNotificationCopy(payload);
  if (!nw) return { title: storedTitle, body: storedBody };

  switch (nw.kind) {
    case "BID_SUBMITTED":
      return {
        title: t("notifications.copy.bidSubmitted.title"),
        body: t("notifications.copy.bidSubmitted.body", {
          freelancerLabel: nw.params.freelancerLabel,
          jobTitle: nw.params.jobTitle
        })
      };
    case "BID_ACCEPTED":
      return {
        title: t("notifications.copy.bidAccepted.title"),
        body: t("notifications.copy.bidAccepted.body", { jobTitle: nw.params.jobTitle })
      };
    case "NEW_MESSAGE":
      return {
        title: t("notifications.copy.newMessage.title"),
        body: nw.params.preview
      };
    case "VERIFICATION_APPROVED":
      return {
        title: t("notifications.copy.verificationApproved.title"),
        body: t("notifications.copy.verificationApproved.body", { requestType: nw.params.requestType })
      };
    case "VERIFICATION_REJECTED": {
      const note = nw.params.staffNote.trim();
      return {
        title: t("notifications.copy.verificationRejected.title"),
        body: note
          ? t("notifications.copy.verificationRejected.bodyWithNote", {
              requestType: nw.params.requestType,
              staffNote: note
            })
          : t("notifications.copy.verificationRejected.body", { requestType: nw.params.requestType })
      };
    }
    default:
      return { title: storedTitle, body: storedBody };
  }
}

export function notificationPayloadWithCopy<T extends Record<string, unknown>>(
  base: T,
  copy: NearworkNotificationCopy
): T & { _nwCopy: NearworkNotificationCopy } {
  return { ...base, [NW_COPY_KEY]: copy };
}
