import type { AppLocale } from "@/lib/i18n/types";

/** ISO 4217 (3-letter). Fallback matches legacy assumptions when `Job.currency` is missing. */
export function normalizeCurrencyCode(currency: string | null | undefined): string {
  const c = (currency ?? "").trim().toUpperCase().slice(0, 3);
  return c || "USD";
}

/**
 * BCP 47 tag for `Intl.NumberFormat` **given viewer language and job/contract ISO currency**.
 * UI locale shapes symbols/grouping; currency is never “upgraded” to IDR just because path is `/id`.
 */
export function resolveIntlLocaleForMoney(appLocale: AppLocale, _currency: string): string {
  return appLocale === "id" ? "id-ID" : "en-US";
}

/**
 * Compact listing labels (rb/jt / K–M): **IDR only**. USD and other currencies stay non-compact on cards.
 */
export function budgetListingUsesCompactNotation(currency: string): boolean {
  return normalizeCurrencyCode(currency) === "IDR";
}

/** Coerce Prisma.Decimal, bigint, strings, numbers. */
export function coerceMoneyNumber(amount: unknown): number | null {
  if (amount == null) return null;
  if (typeof amount === "number") return Number.isFinite(amount) ? amount : null;
  if (typeof amount === "bigint") return Number(amount);
  if (typeof amount === "object") {
    const obj = amount as { toNumber?: () => number; toString?: () => string };
    if (typeof obj.toNumber === "function") {
      try {
        const n = obj.toNumber();
        if (Number.isFinite(n)) return n;
      } catch {
        /* fallthrough */
      }
    }
    if (typeof obj.toString === "function") {
      const n = Number(String(obj.toString()));
      if (Number.isFinite(n)) return n;
    }
  }
  const n = Number(amount);
  return Number.isFinite(n) ? n : null;
}

function idMoneyDecimal(amount: number, maxDecimals: number): string {
  const factor = 10 ** maxDecimals;
  const rounded = Math.round(amount * factor) / factor;
  if (Math.abs(rounded - Math.round(rounded)) < 1e-9) return String(Math.round(rounded));
  return String(rounded).replace(".", ",");
}

/** Compact Indonesian copy: Rp 350 rb · Rp 1,5 jt · … */
function formatIdrCompactForIndonesian(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.round(Math.abs(amount));
  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${idMoneyDecimal(abs / 1_000_000_000, 2)} milyar`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${idMoneyDecimal(abs / 1_000_000, 2)} jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${idMoneyDecimal(abs / 1_000, 2)} rb`;
  }
  const full = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(abs);
  return `${sign}Rp ${full}`;
}

export type FormatMoneyOptions = {
  locale: AppLocale;
  compact?: boolean;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
};

function fallbackShownAmount(amount: number, currency: string): string {
  return `${Math.round(amount)} ${normalizeCurrencyCode(currency)}`;
}

/**
 * Displays an amount using the supplied **ISO currency** (job/contract/etc.) with **NearWork locale** conventions.
 */
export function formatMoneyAmount(amount: unknown, currency: string, options: FormatMoneyOptions): string {
  const n = coerceMoneyNumber(amount);
  if (n == null) return "—";
  const cur = normalizeCurrencyCode(currency);
  const {
    locale: appLocale,
    compact = false,
    maximumFractionDigits = 0,
    minimumFractionDigits
  } = options;

  if (compact && cur === "IDR") {
    if (appLocale === "id") return formatIdrCompactForIndonesian(n);
    try {
      return new Intl.NumberFormat("en-ID", {
        notation: "compact",
        compactDisplay: "short",
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 1
      }).format(n);
    } catch {
      return formatIdrCompactForIndonesian(n);
    }
  }

  if (compact) {
    try {
      const nfLoc = resolveIntlLocaleForMoney(appLocale, cur);
      return new Intl.NumberFormat(nfLoc, {
        notation: "compact",
        compactDisplay: "short",
        style: "currency",
        currency: cur,
        maximumFractionDigits: 2
      }).format(n);
    } catch {
      return fallbackShownAmount(n, cur);
    }
  }

  const nfLoc = resolveIntlLocaleForMoney(appLocale, cur);
  try {
    return new Intl.NumberFormat(nfLoc, {
      style: "currency",
      currency: cur,
      maximumFractionDigits,
      ...(minimumFractionDigits != null ? { minimumFractionDigits } : {})
    }).format(n);
  } catch {
    return fallbackShownAmount(n, cur);
  }
}

export function formatMoneyRange(
  min: unknown,
  max: unknown,
  currency: string,
  options: FormatMoneyOptions
): string | null {
  const a = coerceMoneyNumber(min);
  const b = coerceMoneyNumber(max);
  if (a == null || b == null) return null;
  return `${formatMoneyAmount(a, currency, options)} – ${formatMoneyAmount(b, currency, options)}`;
}

/** Alias: `amount` + ISO `currencyCode` + viewer `locale` (no FX conversion). */
export function formatMoney(
  amount: unknown,
  currencyCode: string,
  locale: AppLocale,
  options?: Omit<FormatMoneyOptions, "locale">
): string {
  return formatMoneyAmount(amount, currencyCode, { locale, ...options });
}

/** Alias for budget min/max ranges. */
export function formatBudgetRange(
  min: unknown,
  max: unknown,
  currencyCode: string,
  locale: AppLocale,
  options?: Omit<FormatMoneyOptions, "locale">
): string | null {
  return formatMoneyRange(min, max, currencyCode, { locale, ...options });
}

/** Hourly/start rates on profiles lack a currency column — marketplace default for display. */
export function defaultFreelancerRateCurrency(): string {
  return "IDR";
}

/** Numeric-only placeholder hints for proposal amount fields. */
export function exampleNumericMoneyPlaceholder(currency: string): string {
  return normalizeCurrencyCode(currency) === "IDR" ? "15000000" : "5000";
}
