import { describe, expect, it } from "vitest";
import { createTranslator } from "@/lib/i18n/create-translator";
import { getMessagesForLocale } from "@/lib/i18n/dictionaries";
import { localizedNotificationStrings } from "@/lib/i18n/notification-copy";

describe("localizedNotificationStrings", () => {
  const payload = {
    jobId: "job1",
    bidId: "bid1",
    _nwCopy: {
      kind: "BID_SUBMITTED" as const,
      params: { freelancerLabel: "Test Freelancer", jobTitle: "Build landing page" }
    }
  };

  it("renders English copy for en locale", () => {
    const t = createTranslator(getMessagesForLocale("en"));
    const out = localizedNotificationStrings("legacy", "legacy", payload, t);
    expect(out.title).toContain("bid");
    expect(out.body).toContain("Test Freelancer");
    expect(out.body).toContain("Build landing page");
    expect(out.title.toLowerCase()).not.toContain("lowongan");
  });

  it("renders Indonesian copy for id locale", () => {
    const t = createTranslator(getMessagesForLocale("id"));
    const out = localizedNotificationStrings("legacy", "legacy", payload, t);
    expect(out.title.toLowerCase()).toMatch(/proposal|lowongan/);
    expect(out.body).toContain("Test Freelancer");
  });

  it("falls back to stored strings without _nwCopy", () => {
    const t = createTranslator(getMessagesForLocale("en"));
    const out = localizedNotificationStrings("Stored title", "Stored body", { jobId: "x" }, t);
    expect(out.title).toBe("Stored title");
    expect(out.body).toBe("Stored body");
  });
});
