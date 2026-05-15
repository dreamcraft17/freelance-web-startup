import { describe, expect, it } from "vitest";
import { AccountStatus, JobStatus, UserRole, WorkMode } from "@acme/types";
import { DomainError, PolicyDeniedError } from "@/server/errors/domain-errors";
import { requireActiveAccount, requireAuth, requireRole } from "./access.policy";
import { JobPolicy } from "./job.policy";
import { BidPolicy } from "./bid.policy";
import { ModerationPolicy } from "./moderation.policy";

describe("access policy helpers", () => {
  const activeClient = {
    userId: "u_client",
    role: UserRole.CLIENT,
    accountStatus: AccountStatus.ACTIVE
  };

  it("requires auth and role", () => {
    expect(() => requireAuth(null)).toThrowError(DomainError);
    expect(() => requireRole(activeClient, UserRole.FREELANCER)).toThrowError(PolicyDeniedError);
    expect(requireRole(activeClient, UserRole.CLIENT)).toEqual(activeClient);
  });

  it("requires active account", () => {
    expect(() =>
      requireActiveAccount({ ...activeClient, accountStatus: AccountStatus.SUSPENDED })
    ).toThrowError(DomainError);
    expect(requireActiveAccount(activeClient)).toEqual(activeClient);
  });
});

describe("job policy", () => {
  it("allows active clients and blocks non-clients", () => {
    expect(() =>
      JobPolicy.assertActorMayPerformClientWrites({
        userId: "u",
        role: UserRole.FREELANCER,
        accountStatus: AccountStatus.ACTIVE
      })
    ).toThrowError(PolicyDeniedError);

    expect(() =>
      JobPolicy.assertActorMayPerformClientWrites({
        userId: "u",
        role: UserRole.CLIENT,
        accountStatus: AccountStatus.ACTIVE
      })
    ).not.toThrow();
  });

  it("enforces ownership on job writes", () => {
    expect(() =>
      JobPolicy.assertClientOwnsJob(
        { userId: "owner", role: UserRole.CLIENT, accountStatus: AccountStatus.ACTIVE },
        "other"
      )
    ).toThrowError(PolicyDeniedError);
  });
});

describe("bid policy", () => {
  const actor = {
    userId: "u_freelancer",
    role: UserRole.FREELANCER,
    accountStatus: AccountStatus.ACTIVE
  };

  it("requires active freelancer actor", () => {
    expect(() =>
      BidPolicy.assertActorMayPerformFreelancerWrites({ ...actor, role: UserRole.CLIENT })
    ).toThrowError(PolicyDeniedError);
    expect(() => BidPolicy.assertActorMayPerformFreelancerWrites(actor)).not.toThrow();
  });

  it("rejects incomplete profile or closed/expired jobs", () => {
    expect(() =>
      BidPolicy.assertFreelancerEligibleForJob(
        {
          id: "fp_1",
          userRole: UserRole.FREELANCER,
          accountStatus: AccountStatus.ACTIVE,
          isComplete: false,
          workMode: WorkMode.REMOTE
        },
        { workMode: WorkMode.REMOTE, status: JobStatus.OPEN, bidDeadline: null }
      )
    ).toThrowError(PolicyDeniedError);

    expect(() =>
      BidPolicy.assertFreelancerEligibleForJob(
        {
          id: "fp_1",
          userRole: UserRole.FREELANCER,
          accountStatus: AccountStatus.ACTIVE,
          isComplete: true,
          workMode: WorkMode.REMOTE
        },
        { workMode: WorkMode.REMOTE, status: JobStatus.CLOSED, bidDeadline: null }
      )
    ).toThrowError(PolicyDeniedError);
  });

  it("blocks duplicate bids", () => {
    expect(() => BidPolicy.assertNoExistingBidForJob(true)).toThrowError(PolicyDeniedError);
    expect(() => BidPolicy.assertNoExistingBidForJob(false)).not.toThrow();
  });
});

describe("moderation policy", () => {
  const clientActor = { userId: "u", role: UserRole.CLIENT, accountStatus: AccountStatus.ACTIVE };
  const moderatorActor = { userId: "m", role: UserRole.MODERATOR, accountStatus: AccountStatus.ACTIVE };
  const financeActor = { userId: "f", role: UserRole.FINANCE_ADMIN, accountStatus: AccountStatus.ACTIVE };

  it("guards staff-only access", () => {
    expect(() => ModerationPolicy.assertIsStaff(clientActor)).toThrowError(PolicyDeniedError);
    expect(() => ModerationPolicy.assertIsStaff(moderatorActor)).not.toThrow();
  });

  it("allows report queue only for desk roles", () => {
    expect(() => ModerationPolicy.assertMayAccessReportsQueue(financeActor)).toThrowError(PolicyDeniedError);
    expect(() => ModerationPolicy.assertMayAccessReportsQueue(moderatorActor)).not.toThrow();
  });
});
