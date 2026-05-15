import { describe, expect, it } from "vitest";
import {
  coerceMoneyNumber,
  defaultFreelancerRateCurrency,
  exampleNumericMoneyPlaceholder,
  formatMoneyAmount,
  formatMoneyRange,
  normalizeCurrencyCode,
  resolveIntlLocaleForMoney
} from "./format-money";

describe("normalizeCurrencyCode", () => {
  it("uppercases and trims", () => {
    expect(normalizeCurrencyCode(" idr ")).toBe("IDR");
    expect(normalizeCurrencyCode("usd")).toBe("USD");
  });
  it("fallback USD when empty", () => {
    expect(normalizeCurrencyCode("")).toBe("USD");
    expect(normalizeCurrencyCode(null)).toBe("USD");
  });
});

describe("resolveIntlLocaleForMoney", () => {
  it("uses id-ID for IDR regardless of app locale", () => {
    expect(resolveIntlLocaleForMoney("en", "IDR")).toBe("id-ID");
    expect(resolveIntlLocaleForMoney("id", "IDR")).toBe("id-ID");
  });
  it("uses id-ID for Indonesian UI with USD", () => {
    expect(resolveIntlLocaleForMoney("id", "USD")).toBe("id-ID");
  });
  it("uses en-US for English UI non-IDR", () => {
    expect(resolveIntlLocaleForMoney("en", "USD")).toBe("en-US");
  });
});

describe("coerceMoneyNumber", () => {
  it("handles decimal-like objects", () => {
    expect(coerceMoneyNumber({ toString: () => "1234.5" })).toBe(1234.5);
  });
});

describe("formatMoneyAmount", () => {
  it("formats ID full IDR compact (rb)", () => {
    const s = formatMoneyAmount(350_000, "IDR", { locale: "id", compact: true });
    expect(s).toContain("rb");
    expect(s).toContain("Rp");
  });
  it("formats ID full IDR compact (jt)", () => {
    const s = formatMoneyAmount(1_500_000, "IDR", { locale: "id", compact: true });
    expect(s).toContain("jt");
    expect(s).toMatch(/1,5|1\.5/);
  });
  it("USD with English locale uses en-US grouping", () => {
    const s = formatMoneyAmount(120, "USD", { locale: "en" });
    expect(s).toMatch(/120|\$120/);
  });
});

describe("formatMoneyRange", () => {
  it("renders dash range", () => {
    const s = formatMoneyRange(100, 200, "USD", { locale: "en" });
    expect(s).toContain("–");
  });
});

describe("defaults", () => {
  it("freelancer default currency IDR", () => {
    expect(defaultFreelancerRateCurrency()).toBe("IDR");
  });
  it("proposal placeholder hints", () => {
    expect(exampleNumericMoneyPlaceholder("IDR")).toBe("15000000");
    expect(exampleNumericMoneyPlaceholder("USD")).toBe("5000");
  });
});
