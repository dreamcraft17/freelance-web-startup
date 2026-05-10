import type { AppLocale } from "@/lib/i18n/types";
import { withPublicLocale } from "@/lib/i18n/locale-path";

/**
 * Signup URLs that preserve intent after registration (browse first, complete action after auth).
 * Query shape: `?role=client|freelancer&intent=<action>&next=<same-origin path>` — handled by {@link RegisterForm}.
 */
export const REGISTER_CLIENT_POST_JOB =
  "/register?role=client&intent=post-job&next=" + encodeURIComponent("/client/jobs/new");

export const REGISTER_FREELANCER_PROFILE =
  "/register?role=freelancer&intent=protected&next=" + encodeURIComponent("/freelancer/profile");

export function registerFreelancerReturnToJob(jobId: string, locale: AppLocale): string {
  const id = jobId.trim();
  const next = `${withPublicLocale(locale, "/jobs")}/${id}`;
  return `/register?role=freelancer&intent=submit-bid&next=${encodeURIComponent(next)}`;
}

export function loginReturnTo(path: string, intent: "continue" | "protected" | "submit-bid" | "post-job" | "send-message" = "continue"): string {
  const q = new URLSearchParams();
  q.set("returnUrl", path);
  if (intent !== "continue") q.set("intent", intent);
  return `/login?${q.toString()}`;
}
