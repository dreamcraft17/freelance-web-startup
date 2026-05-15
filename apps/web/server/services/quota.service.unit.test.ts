import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountStatus, UserRole } from "@acme/types";
import { QuotaExceededError } from "@/server/errors/domain-errors";
import { QuotaService } from "./quota.service";

vi.mock("@acme/config", () => ({
  shouldBypassQuotaEnforcement: vi.fn(() => false)
}));

describe("QuotaService", () => {
  const quotaRepo = {
    countActiveBids: vi.fn(),
    countActiveAcceptedContracts: vi.fn()
  };
  const freelancerRepo = {
    requireProfileIdForUser: vi.fn()
  };
  const subscriptionService = {
    resolveEffectivePlanContextForUser: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    freelancerRepo.requireProfileIdForUser.mockResolvedValue("fp_1");
    subscriptionService.resolveEffectivePlanContextForUser.mockResolvedValue({
      planKey: "FREE",
      entitlements: { maxActiveBids: 3, maxActiveContracts: 1 }
    });
    quotaRepo.countActiveBids.mockResolvedValue(1);
    quotaRepo.countActiveAcceptedContracts.mockResolvedValue(0);
  });

  it("returns usage/remaining summary for freelancer user", async () => {
    const svc = new QuotaService(quotaRepo as never, freelancerRepo as never, subscriptionService as never);
    const usage = await svc.getFreelancerQuotaUsage({
      userId: "u_fl",
      role: UserRole.FREELANCER,
      accountStatus: AccountStatus.ACTIVE
    });

    expect(usage.usage).toEqual({ activeBids: 1, activeContracts: 0 });
    expect(usage.remaining).toEqual({ activeBids: 2, activeContracts: 1 });
  });

  it("throws quota exceeded when active bid cap is reached", async () => {
    quotaRepo.countActiveBids.mockResolvedValue(3);
    quotaRepo.countActiveAcceptedContracts.mockResolvedValue(0);
    const svc = new QuotaService(quotaRepo as never, freelancerRepo as never, subscriptionService as never);

    await expect(
      svc.enforceWithinActiveBidAndContractLimits({
        userId: "u_fl",
        freelancerProfileId: "fp_1"
      })
    ).rejects.toBeInstanceOf(QuotaExceededError);
  });
});
