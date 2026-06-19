import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  reportFindMany: vi.fn(),
  userFindMany: vi.fn(),
  reportUpdateMany: vi.fn(),
  auditCreate: vi.fn(),
  notificationCreateMany: vi.fn()
}));

vi.mock("@acme/database", () => ({
  db: {
    moderationReport: { findMany: mocks.reportFindMany },
    user: { findMany: mocks.userFindMany },
    $transaction: (run: (tx: unknown) => unknown) =>
      run({
        moderationReport: { updateMany: mocks.reportUpdateMany },
        auditLog: { create: mocks.auditCreate },
        notification: { createMany: mocks.notificationCreateMany }
      })
  }
}));

import { escalateOverdueModerationReports } from "./moderationEscalationSweep";

describe("escalateOverdueModerationReports", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DATABASE_URL = "postgresql://unit.test/db";
    mocks.userFindMany.mockResolvedValue([{ id: "staff-1" }]);
    mocks.auditCreate.mockResolvedValue({});
    mocks.notificationCreateMany.mockResolvedValue({ count: 1 });
  });

  afterEach(() => {
    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it("records and notifies for an overdue report", async () => {
    const due = new Date("2026-06-19T08:00:00.000Z");
    mocks.reportFindMany.mockResolvedValue([
      { id: "report-1", priority: "URGENT", category: "scam", slaDueAt: due }
    ]);
    mocks.reportUpdateMany.mockResolvedValue({ count: 1 });

    await expect(escalateOverdueModerationReports(new Date("2026-06-19T09:00:00.000Z"))).resolves.toEqual({
      escalated: 1,
      scanned: 1
    });
    expect(mocks.auditCreate).toHaveBeenCalledOnce();
    expect(mocks.notificationCreateMany).toHaveBeenCalledOnce();
  });

  it("does not duplicate side effects when another worker won the update", async () => {
    mocks.reportFindMany.mockResolvedValue([
      { id: "report-1", priority: "HIGH", category: "policy", slaDueAt: new Date() }
    ]);
    mocks.reportUpdateMany.mockResolvedValue({ count: 0 });

    await expect(escalateOverdueModerationReports()).resolves.toEqual({ escalated: 0, scanned: 1 });
    expect(mocks.auditCreate).not.toHaveBeenCalled();
    expect(mocks.notificationCreateMany).not.toHaveBeenCalled();
  });
});
