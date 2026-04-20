"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createTranslator, type Translator } from "@/lib/i18n/create-translator";
import type { Messages } from "@/lib/i18n/dictionaries";
import { getMessagesForLocale } from "@/lib/i18n/dictionaries";
import type { AppLocale } from "@/lib/i18n/types";

type I18nContextValue = {
  locale: AppLocale;
  t: Translator;
  setLocale: (next: AppLocale) => void;
  isLocalePending: boolean;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

type I18nProviderProps = {
  children: ReactNode;
  initialLocale: AppLocale;
  initialMessages: Messages;
};

export function I18nProvider({ children, initialLocale, initialMessages }: I18nProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);
  const [messages, setMessages] = useState<Messages>(initialMessages);
  const [isLocalePending, startTransition] = useTransition();
  const routeLocale = useMemo(() => {
    const match = (pathname ?? "/").match(/^\/(en|id)(\/|$)/i);
    return match?.[1]?.toLowerCase() as AppLocale | undefined;
  }, [pathname]);

  useEffect(() => {
    setLocaleState(initialLocale);
    setMessages(initialMessages);
  }, [initialLocale, initialMessages]);

  useEffect(() => {
    if (!routeLocale) return;
    setLocaleState(routeLocale);
    setMessages(getMessagesForLocale(routeLocale));
  }, [routeLocale]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const t = useMemo(() => createTranslator(messages), [messages]);

  const setLocale = useCallback(
    (next: AppLocale) => {
      if (next === locale) return;
      setMessages(getMessagesForLocale(next));
      setLocaleState(next);
      void (async () => {
        try {
          await fetch("/api/locale", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ locale: next }),
            credentials: "same-origin"
          });
        } catch {
          // Cookie sync best-effort; UI locale still updates immediately.
        }
        startTransition(() => {
          router.refresh();
        });
      })();
    },
    [locale, router]
  );

  const value = useMemo(
    () => ({
      locale,
      t,
      setLocale,
      isLocalePending
    }),
    [locale, t, setLocale, isLocalePending]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
