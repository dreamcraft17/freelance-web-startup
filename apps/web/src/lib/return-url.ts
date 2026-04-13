import { UserRole } from "@acme/types";

const MAX_RETURN_URL_LEN = 2048;

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

export function homePathForSessionRole(role: UserRole): string {
  switch (role) {
    case UserRole.FREELANCER:
      return "/freelancer";
    case UserRole.CLIENT:
      return "/client";
    case UserRole.ADMIN:
    case UserRole.SUPPORT_ADMIN:
    case UserRole.FINANCE_ADMIN:
    case UserRole.MODERATOR:
      return "/settings";
    default:
      return "/settings";
  }
}
