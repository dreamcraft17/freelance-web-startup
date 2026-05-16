import { describe, expect, it } from "vitest";
import {
  createJobSchema,
  createModerationReportSchema,
  loginSchema,
  registerSchema,
  submitBidSchema
} from "./index";

describe("validators", () => {
  it("validates register/login payloads", () => {
    const registerOk = registerSchema.safeParse({
      fullName: "Client User",
      email: "client@example.com",
      password: "strong-pass-123",
      role: "CLIENT"
    });
    expect(registerOk.success).toBe(true);

    const registerBad = registerSchema.safeParse({
      fullName: "A",
      email: "bad-email",
      password: "123",
      role: "CLIENT"
    });
    expect(registerBad.success).toBe(false);

    const loginOk = loginSchema.safeParse({ email: "u@example.com", password: "x" });
    expect(loginOk.success).toBe(true);
  });

  it("validates job and proposal payloads", () => {
    expect(
      createJobSchema.safeParse({
        title: "Build onboarding flow",
        description: "Need complete onboarding redesign with reusable components and copy.",
        categoryId: "cat_1",
        workMode: "REMOTE",
        budgetType: "FIXED",
        budgetMin: 100,
        budgetMax: 500,
        currency: "USD"
      }).success
    ).toBe(true);

    expect(
      createJobSchema.safeParse({
        title: "Build onboarding flow",
        description: "Need complete onboarding redesign with reusable components and copy.",
        categoryId: "cat_1",
        workMode: "REMOTE",
        budgetType: "FIXED",
        budgetMin: 100,
        budgetMax: 500,
        currency: "EUR"
      }).success
    ).toBe(false);

    expect(
      submitBidSchema.safeParse({
        jobId: "job_1",
        coverLetter: "x".repeat(30),
        bidAmount: 250,
        estimatedDays: 7
      }).success
    ).toBe(true);

    expect(
      submitBidSchema.safeParse({
        jobId: "job_1",
        coverLetter: "too short",
        bidAmount: 0,
        estimatedDays: 0
      }).success
    ).toBe(false);
  });

  it("validates moderation report payloads", () => {
    const ok = createModerationReportSchema.safeParse({
      subjectType: "BID",
      subjectBidId: "bid_1",
      category: "policy",
      description: "Detailed report body that is at least ten characters."
    });
    expect(ok.success).toBe(true);

    const bad = createModerationReportSchema.safeParse({
      subjectType: "BID",
      category: "policy",
      description: "short"
    });
    expect(bad.success).toBe(false);
  });
});
