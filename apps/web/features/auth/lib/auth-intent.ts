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

/** i18n key under `auth.intent.login.*` — use with `t()`. */
export function loginIntentMessageKey(intent: AuthIntent): string | null {
  switch (intent) {
    case "save-job":
      return "auth.intent.login.saveJob";
    case "save-freelancer":
      return "auth.intent.login.saveFreelancer";
    case "send-message":
      return "auth.intent.login.sendMessage";
    case "submit-bid":
      return "auth.intent.login.submitBid";
    case "post-job":
      return "auth.intent.login.postJob";
    case "protected":
      return "auth.intent.login.protected";
    default:
      return null;
  }
}

/** i18n key under `auth.intent.register.*` — use with `t()`. */
export function registerIntentMessageKey(intent: AuthIntent): string | null {
  switch (intent) {
    case "post-job":
      return "auth.intent.register.postJob";
    case "submit-bid":
      return "auth.intent.register.submitBid";
    case "save-freelancer":
      return "auth.intent.register.saveFreelancer";
    case "save-job":
      return "auth.intent.register.saveJob";
    case "send-message":
      return "auth.intent.register.sendMessage";
    case "protected":
      return "auth.intent.register.protected";
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

