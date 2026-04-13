/**
 * Signup URLs that preserve intent after registration (browse first, complete action after auth).
 * Query shape: `?role=client|freelancer&next=<same-origin path>` — handled by {@link RegisterForm}.
 */
export const REGISTER_CLIENT_POST_JOB =
  "/register?role=client&next=" + encodeURIComponent("/client/jobs/new");

export const REGISTER_FREELANCER_PROFILE =
  "/register?role=freelancer&next=" + encodeURIComponent("/freelancer/profile");

export function registerFreelancerReturnToJob(jobId: string): string {
  const id = jobId.trim();
  const next = `/jobs/${id}`;
  return `/register?role=freelancer&next=${encodeURIComponent(next)}`;
}

export function loginReturnTo(path: string): string {
  return `/login?returnUrl=${encodeURIComponent(path)}`;
}
