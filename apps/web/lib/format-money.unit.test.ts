import { describe, expect, it } from "vitest";
import {
  budgetListingUsesCompactNotation,
  coerceMoneyNumber,
  defaultFreelancerRateCurrency,
  exampleNumericMoneyPlaceholder,
  formatMoney,
  formatBudgetRange,
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
  it("uses en-US for English UI regardless of ISO currency (locale ≠ currency unit)", () => {
    expect(resolveIntlLocaleForMoney("en", "IDR")).toBe("en-US");
    expect(resolveIntlLocaleForMoney("en", "USD")).toBe("en-US");
  });
  it("uses id-ID for Indonesian UI so USD still displays as dollars (e.g. US$)", () => {
    expect(resolveIntlLocaleForMoney("id", "USD")).toBe("id-ID");
    expect(resolveIntlLocaleForMoney("id", "IDR")).toBe("id-ID");
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
  it("IDR with English locale uses en-US (not Indonesian Rp grouping) when not compact", () => {
    const s = formatMoneyAmount(500_000, "IDR", { locale: "en", maximumFractionDigits: 0 });
    expect(s).toMatch(/IDR/);
    expect(s).not.toMatch(/rb|jt/);
  });
  it("IDR compact in English uses K-style via Intl", () => {
    const s = formatMoneyAmount(500_000, "IDR", { locale: "en", compact: true });
    expect(s.toUpperCase()).toMatch(/500|K/);
  });
});

describe("budgetListingUsesCompactNotation", () => {
  it("is true for IDR only", () => {
    expect(budgetListingUsesCompactNotation("IDR")).toBe(true);
    expect(budgetListingUsesCompactNotation("USD")).toBe(false);
  });
});

describe("formatMoney / formatBudgetRange aliases", () => {
  it("matches formatMoneyAmount / formatMoneyRange", () => {
    expect(formatMoney(50, "USD", "en")).toBe(formatMoneyAmount(50, "USD", { locale: "en" }));
    expect(formatBudgetRange(1, 2, "USD", "en")).toBe(formatMoneyRange(1, 2, "USD", { locale: "en" }));
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
