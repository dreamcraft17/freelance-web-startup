import { sanitizeReturnUrl } from "@src/lib/return-url";

export type AuthIntent =
  | "save-job"
  | "save-freelancer"
  | "send-message"
  | "submit-bid"
  | "post-job"
  | "protected"
  | "continue";

const ALL_INTENTS = new Set<AuthIntent>([
  "save-job",
  "save-freelancer",
  "send-message",
  "submit-bid",
  "post-job",
  "protected",
  "continue"
]);

export function parseAuthIntent(raw: string | null | undefined): AuthIntent {
  if (!raw) return "continue";
  const v = raw.trim().toLowerCase() as AuthIntent;
  return ALL_INTENTS.has(v) ? v : "continue";
}

export function loginIntentMessage(intent: AuthIntent): string | null {
  switch (intent) {
    case "save-job":
      return "Log in to save this job.";
    case "save-freelancer":
      return "Log in to save this freelancer.";
    case "send-message":
      return "Log in to message on NearWork.";
    case "submit-bid":
      return "Log in to submit your bid.";
    case "post-job":
      return "Log in to post a job.";
    case "protected":
      return "Log in to continue to that page.";
    default:
      return null;
  }
}

export function registerIntentMessage(intent: AuthIntent): string | null {
  switch (intent) {
    case "post-job":
      return "Create a client account to post a job.";
    case "submit-bid":
      return "Create a freelancer account to submit your bid.";
    case "save-freelancer":
      return "Create an account to save freelancers and revisit them later.";
    case "save-job":
      return "Create an account to save jobs and track opportunities.";
    case "send-message":
      return "Create an account to start messaging.";
    case "protected":
      return "Create an account to continue.";
    default:
      return null;
  }
}

export function roleHintFromIntent(intent: AuthIntent): "client" | "freelancer" | null {
  if (intent === "post-job") return "client";
  if (intent === "submit-bid") return "freelancer";
  return null;
}

export function buildLoginToRegisterHref(params: {
  returnUrl?: string | null;
  intent: AuthIntent;
}): string {
  const safe = sanitizeReturnUrl(params.returnUrl, "/");
  const next = encodeURIComponent(safe);
  const q = new URLSearchParams();
  if (safe !== "/") q.set("next", safe);
  if (params.intent !== "continue") q.set("intent", params.intent);

  const roleHint = roleHintFromIntent(params.intent);
  if (roleHint) q.set("role", roleHint);
  else if (safe.startsWith("/client/")) q.set("role", "client");
  else if (safe.startsWith("/freelancer/")) q.set("role", "freelancer");

  if (!q.has("next") && (roleHint === "client" || roleHint === "freelancer")) {
    q.set("next", roleHint === "client" ? "/client/jobs/new" : "/freelancer");
  }

  const qs = q.toString();
  return qs ? `/register?${qs}` : `/register?next=${next}`;
}

