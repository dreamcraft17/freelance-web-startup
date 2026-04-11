import type { AccountStatus, UserRole } from "@acme/types";

/**
 * Authenticated subject performing an API action.
 * Populated by auth middleware / session layer — headers are dev-only placeholders.
 */
export type AuthActor = {
  userId: string;
  role: UserRole;
  accountStatus: AccountStatus;
};
