import type { Translator } from "./create-translator";

export function localizedBidStatusLabel(status: string, t: Translator): string {
  const suffix = (
    {
      SUBMITTED: "bidStatusSubmitted",
      SHORTLISTED: "bidStatusShortlisted",
      ACCEPTED: "bidStatusAccepted",
      REJECTED: "bidStatusRejected",
      WITHDRAWN: "bidStatusWithdrawn",
      EXPIRED: "bidStatusExpired",
      CANCELLED: "bidStatusCancelled",
      DRAFT: "bidStatusDraft"
    } as Record<string, string | undefined>
  )[status];
  if (!suffix) return status.replace(/_/g, " ").toLowerCase();
  return t(`public.jobDetail.${suffix}`);
}

export function localizedJobStatusLabel(status: string, t: Translator): string {
  const suffix = (
    {
      DRAFT: "jobStatusDRAFT",
      OPEN: "jobStatusOPEN",
      IN_REVIEW: "jobStatusIN_REVIEW",
      PAUSED: "jobStatusPAUSED",
      CLOSED: "jobStatusCLOSED",
      CANCELLED: "jobStatusCANCELLED",
      ARCHIVED: "jobStatusARCHIVED"
    } as Record<string, string | undefined>
  )[status];
  if (!suffix) return status.replace(/_/g, " ").toLowerCase();
  return t(`public.jobDetail.${suffix}`);
}
