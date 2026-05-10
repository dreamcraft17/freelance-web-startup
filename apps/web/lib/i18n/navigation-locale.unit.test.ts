import { describe, expect, it } from "vitest";
import { localeFromSameOriginReferer, resolveNavigationLocale } from "./navigation-locale";

describe("navigation-locale", () => {
  const origin = "http://127.0.0.1:3000";

  it("reads locale from same-origin referer path", () => {
    expect(
      localeFromSameOriginReferer(`${origin}/en/jobs`, "same-origin", origin)
    ).toBe("en");
    expect(
      localeFromSameOriginReferer(`${origin}/id/freelancers`, "same-origin", origin)
    ).toBe("id");
  });

  it("ignores cross-origin referer", () => {
    expect(
      localeFromSameOriginReferer("https://evil.example/en/jobs", "cross-site", origin)
    ).toBeNull();
  });

  it("resolveNavigationLocale prefers referer over mismatched cookie", () => {
    expect(
      resolveNavigationLocale("id", `${origin}/en/how-it-works`, "same-origin", origin)
    ).toBe("en");
  });

  it("falls back to cookie when referer has no locale segment", () => {
    expect(resolveNavigationLocale("en", `${origin}/login`, "same-origin", origin)).toBe("en");
    expect(resolveNavigationLocale(null, null, null, origin)).toBe("id");
  });
});
