import { describe, expect, it } from "vitest";
import { withActiveLocaleHref, withLocale, withPublicLocale } from "./locale-path";

describe("locale-path", () => {
  it("withPublicLocale prefixes SEO roots only", () => {
    expect(withPublicLocale("en", "/jobs")).toBe("/en/jobs");
    expect(withPublicLocale("en", "/jobs?x=1")).toBe("/en/jobs?x=1");
    expect(withPublicLocale("id", "/how-it-works")).toBe("/id/how-it-works");
    expect(withPublicLocale("en", "/login")).toBe("/login");
    expect(withPublicLocale("en", "/en/jobs")).toBe("/en/jobs");
  });

  it("withLocale is an alias", () => {
    expect(withLocale("id", "/freelancers")).toBe("/id/freelancers");
  });

  it("withActiveLocaleHref handles workspace then public", () => {
    expect(withActiveLocaleHref("en", "/messages")).toBe("/en/messages");
    expect(withActiveLocaleHref("en", "/jobs")).toBe("/en/jobs");
  });
});
