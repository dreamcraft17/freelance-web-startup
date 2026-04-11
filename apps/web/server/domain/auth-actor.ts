import type { AccountStatus, UserRole } from "@acme/types";

/**
 * Authenticated subject performing an API action.
 * Populated from the signed session cookie (`acme_session`) via `resolveActorFromRequest` / `protect()`.
 */
export type AuthActor = {
  userId: string;
  role: UserRole;
  accountStatus: AccountStatus;
};
