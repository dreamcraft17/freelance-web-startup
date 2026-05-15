import { UserRole } from "@acme/types";
import type { AuthActor } from "@/server/domain/auth-actor";
import { PolicyDeniedError } from "../errors/domain-errors";

const ALL_STAFF_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.SUPPORT_ADMIN,
  UserRole.MODERATOR,
  UserRole.FINANCE_ADMIN
];

/** Queue + triage: admin, moderator, support. */
const REPORT_DESK_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT_ADMIN];

/** Listing visibility changes. */
const LISTING_MODERATOR_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT_ADMIN];

/** Account suspension / reinstatement — higher trust bar. */
const ACCOUNT_MODERATOR_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.SUPPORT_ADMIN];

export class ModerationPolicy {
  static assertIsStaff(actor: AuthActor): void {
    if (!ALL_STAFF_ROLES.includes(actor.role)) {
      throw new PolicyDeniedError("Staff access required");
    }
  }

  static assertMayAccessReportsQueue(actor: AuthActor): void {
    ModerationPolicy.assertIsStaff(actor);
    if (!REPORT_DESK_ROLES.includes(actor.role)) {
      throw new PolicyDeniedError("You cannot access the reports queue");
    }
  }

  static assertMayModerateListings(actor: AuthActor): void {
    ModerationPolicy.assertIsStaff(actor);
    if (!LISTING_MODERATOR_ROLES.includes(actor.role)) {
      throw new PolicyDeniedError("You cannot moderate job listings");
    }
  }

  static assertMaySuspendUsers(actor: AuthActor): void {
    ModerationPolicy.assertIsStaff(actor);
    if (!ACCOUNT_MODERATOR_ROLES.includes(actor.role)) {
      throw new PolicyDeniedError("You cannot suspend or reactivate users");
    }
  }

  static assertAssigneeMustBeStaff(assigneeRole: UserRole): void {
    if (!ALL_STAFF_ROLES.includes(assigneeRole)) {
      throw new PolicyDeniedError("Assignee must be a staff account");
    }
  }

  /** Used when mutating moderation report records (assign, status, notes). */
  static assertMayMutateReports(actor: AuthActor): void {
    ModerationPolicy.assertMayAccessReportsQueue(actor);
  }

  /** Note author must belong to reports desk roles (finance-only staff excluded). */
  static assertMayWriteReportNotes(actor: AuthActor): void {
    ModerationPolicy.assertMayAccessReportsQueue(actor);
  }
}
