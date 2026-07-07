import { cn } from "@/lib/utils";

type Props = {
  amountCents: number;
  currency?: string;
  locale?: string;
  showDecimals?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
};

function formatMoney(amountCents: number, currency: string, locale: string, showDecimals: boolean) {
  const zeroDecimal = currency === "IDR";
  const amount = zeroDecimal ? amountCents : amountCents / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: showDecimals && !zeroDecimal ? 2 : 0,
    maximumFractionDigits: showDecimals && !zeroDecimal ? 2 : 0
  }).format(amount);
}

export function PriceDisplay({
  amountCents,
  currency = "IDR",
  locale = "id-ID",
  showDecimals = false,
  className,
  size = "md",
  label
}: Props) {
  const sizeClass =
    size === "lg" ? "text-2xl font-bold" : size === "sm" ? "text-sm font-medium" : "text-lg font-semibold";

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {label && <span className="nw-v2-caption">{label}</span>}
      <span className={cn("nw-v2-price text-slate-900 dark:text-slate-50", sizeClass)}>
        {formatMoney(amountCents, currency, locale, showDecimals)}
      </span>
    </div>
  );
}

type BreakdownLine = { label: string; amountCents: number; emphasis?: boolean };

type BreakdownProps = {
  lines: BreakdownLine[];
  totalCents: number;
  currency?: string;
  locale?: string;
  className?: string;
};

export function PriceBreakdown({ lines, totalCents, currency = "IDR", locale = "id-ID", className }: BreakdownProps) {
  return (
    <dl className={cn("space-y-2 text-sm", className)}>
      {lines.map((line) => (
        <div key={line.label} className="flex items-center justify-between gap-3">
          <dt className={cn("text-slate-600 dark:text-slate-400", line.emphasis && "font-medium text-slate-900 dark:text-slate-100")}>
            {line.label}
          </dt>
          <dd className={cn("nw-v2-price tabular-nums text-slate-900 dark:text-slate-100", line.emphasis && "font-semibold")}>
            {formatMoney(line.amountCents, currency, locale, false)}
          </dd>
        </div>
      ))}
      <div className="border-t border-slate-200 pt-2 dark:border-slate-700">
        <div className="flex items-center justify-between gap-3 font-semibold">
          <dt className="text-slate-900 dark:text-slate-50">Total due</dt>
          <dd className="nw-v2-price text-lg text-nw-brand">{formatMoney(totalCents, currency, locale, false)}</dd>
        </div>
      </div>
    </dl>
  );
}
