import { describe, expect, it } from "vitest";
import { ModerationReportPriority } from "@acme/types";
import { moderationTriageForCategory } from "./moderation";

describe("moderationTriageForCategory", () => {
  it("gives urgent safety reports the shortest SLA", () => {
    expect(moderationTriageForCategory("scam")).toEqual({
      priority: ModerationReportPriority.URGENT,
      slaHours: 4
    });
    expect(moderationTriageForCategory("HARASSMENT")).toEqual({
      priority: ModerationReportPriority.URGENT,
      slaHours: 4
    });
  });

  it("uses a bounded default for unknown categories", () => {
    expect(moderationTriageForCategory("unexpected")).toEqual({
      priority: ModerationReportPriority.NORMAL,
      slaHours: 24
    });
  });
});
