"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/lib/i18n/types";
import { useI18n } from "./I18nProvider";

const OPTIONS: AppLocale[] = ["en", "id"];

type LocaleSwitcherProps = {
  className?: string;
};

/**
 * Minimal EN | ID control — fixed width to avoid layout shift, no flags.
 */
export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, isLocalePending, t } = useI18n();

  const onSwitchLocale = (next: AppLocale) => {
    if (next === locale) return;

    const currentPath = pathname ?? "/";
    const match = currentPath.match(/^\/(en|id)(\/.*)?$/i);
    if (match) {
      const rest = match[2] ?? "";
      const target = `/${next}${rest}`;
      void fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
        credentials: "same-origin"
      }).catch(() => undefined);
      router.push(target as Route);
      return;
    }

    // Non-localized routes keep existing behavior and persist locale preference only.
    setLocale(next);
  };

  return (
    <div
      className={cn(
        "inline-flex h-8 shrink-0 items-center rounded-md border border-slate-200/90 bg-white p-0.5 text-[11px] font-semibold tracking-tight text-slate-500 shadow-sm",
        isLocalePending && "opacity-80",
        className
      )}
      role="group"
      aria-label={t("locale.current")}
    >
      {OPTIONS.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => onSwitchLocale(code)}
            className={cn(
              "min-w-[2.25rem] rounded px-2 py-1 transition-colors duration-150",
              active
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
              isLocalePending && "pointer-events-none"
            )}
            aria-pressed={active}
            title={`${t("locale.switchTo")}: ${code === "en" ? "English" : "Bahasa Indonesia"}`}
          >
            <span
              className={cn(
                "inline-block transition-opacity duration-200",
                isLocalePending && active && "opacity-70"
              )}
            >
              {t(`locale.${code}`)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
