import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    clientProfile: { findFirst: vi.fn() },
    job: { count: vi.fn() },
    bid: { count: vi.fn() },
    message: { count: vi.fn() },
    freelancerProfile: { findFirst: vi.fn() },
    savedJob: { count: vi.fn() }
  }
}));

vi.mock("@acme/database", () => ({ db: mockDb }));

import { OnboardingActivationService } from "./onboarding-activation.service";

describe("OnboardingActivationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("computes client activation milestones from persisted rows", async () => {
    mockDb.clientProfile.findFirst.mockResolvedValue({
      id: "cp_1",
      displayName: "Acme Ops",
      companyName: "Acme",
      industry: null,
      city: null,
      country: null,
      region: null
    });
    mockDb.job.count.mockResolvedValue(1);
    mockDb.bid.count.mockResolvedValue(2);
    mockDb.message.count.mockResolvedValue(1);

    const svc = new OnboardingActivationService();
    const steps = await svc.getClientActivation("user_client");

    expect(steps).toEqual([
      { id: "profile", done: true, href: "/settings" },
      { id: "first_job", done: true, href: "/client/jobs/new" },
      { id: "review_proposal", done: true, href: "/client/jobs" },
      { id: "discussion", done: true, href: "/messages" }
    ]);
  });

  it("computes freelancer activation milestones from profile, bids, saved jobs, and messages", async () => {
    mockDb.freelancerProfile.findFirst.mockResolvedValue({
      id: "fp_1",
      username: "freelancer",
      bio: "shipping outcomes",
      workMode: "REMOTE"
    });
    mockDb.savedJob.count.mockResolvedValue(0);
    mockDb.bid.count.mockResolvedValue(1);
    mockDb.message.count.mockResolvedValue(0);

    const svc = new OnboardingActivationService();
    const steps = await svc.getFreelancerActivation("user_fl");

    expect(steps).toEqual([
      { id: "profile", done: true, href: "/freelancer/profile" },
      { id: "browse_jobs", done: true, href: "/jobs" },
      { id: "first_proposal", done: true, href: "/freelancer/proposals" },
      { id: "discussion", done: false, href: "/messages" }
    ]);
  });
});
