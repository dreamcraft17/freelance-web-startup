import { UserRole } from "@acme/types";

const MAX_RETURN_URL_LEN = 2048;

/** Staff roles land on /admin after login when no valid returnUrl. Keep aligned with admin RBAC staff set. */
const STAFF_WORKSPACE_ROLES: ReadonlyArray<UserRole> = [
  UserRole.ADMIN,
  UserRole.SUPPORT_ADMIN,
  UserRole.MODERATOR,
  UserRole.FINANCE_ADMIN
];

function isStaffWorkspaceRole(role: UserRole): boolean {
  return STAFF_WORKSPACE_ROLES.includes(role);
}

function isDisallowedReturnPath(pathOnly: string): boolean {
  const p = pathOnly.toLowerCase();
  return (
    p === "/login" ||
    p.startsWith("/login/") ||
    p === "/register" ||
    p.startsWith("/register/") ||
    p === "/forgot-password" ||
    p.startsWith("/forgot-password/")
  );
}

/**
 * Same-origin relative return URL only. Rejects open redirects, auth pages, and oversized values.
 * Safe to import from client components (no Node/crypto deps).
 */
export function sanitizeReturnUrl(raw: string | null | undefined, fallback: string): string {
  if (raw == null) return fallback;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > MAX_RETURN_URL_LEN) return fallback;
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("@") || trimmed.includes("\\") || trimmed.includes("\0")) return fallback;

  const q = trimmed.indexOf("?");
  const pathOnly = (q === -1 ? trimmed : trimmed.slice(0, q)) || "/";
  if (isDisallowedReturnPath(pathOnly)) return fallback;

  return trimmed;
}

/**
 * Default home path after auth when no `returnUrl` applies (or it is invalid).
 * CLIENT/FREELANCER keep product dashboards; staff roles use /admin; other roles fall back to /settings.
 */
export function homePathForSessionRole(role: UserRole): string {
  if (isStaffWorkspaceRole(role)) return "/admin";
  switch (role) {
    case UserRole.FREELANCER:
      return "/freelancer";
    case UserRole.CLIENT:
      return "/client";
    default:
      return "/settings";
  }
}

/**
 * Single entry for post-login / post-register redirects: same-origin returnUrl wins when valid, else role home.
 */
export function resolvePostLoginRedirect(role: UserRole, returnUrl: string | null | undefined): string {
  const fallback = homePathForSessionRole(role);
  return sanitizeReturnUrl(returnUrl ?? null, fallback);
}
