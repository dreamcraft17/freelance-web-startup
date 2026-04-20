import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { allLocales, normalizeLocale } from "@/lib/i18n/seo";

export function generateStaticParams() {
  return allLocales().map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!normalizeLocale(locale)) {
    notFound();
  }

  return <MarketingShell>{children}</MarketingShell>;
}
