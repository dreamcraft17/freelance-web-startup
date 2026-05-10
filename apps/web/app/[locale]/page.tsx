import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPage } from "@/components/marketing/LandingPage";
import { resolveLandingIntent } from "@/components/marketing/LandingPage";
import { localizedMetadata, normalizeLocale } from "@/lib/i18n/seo";

const copy = {
  en: {
    title: "NearWork — Structured Freelance Marketplace (Local, Remote, Hybrid)",
    description:
      "Post jobs, collect proposals, and hire through job-thread chat. Browse freelancers or open roles with keyword, category, city, and work mode filters."
  },
  id: {
    title: "NearWork — Marketplace Freelance Terstruktur (Lokal, Remote, Hybrid)",
    description:
      "Pasang lowongan, terima proposal, dan rekrut lewat chat pada utas pekerjaan. Jelajahi freelancer atau role dengan filter kata kunci, kategori, kota, dan mode kerja."
  }
} as const;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolved = normalizeLocale(locale);
  if (!resolved) return {};
  return localizedMetadata({
    locale: resolved,
    path: "/",
    title: copy[resolved].title,
    description: copy[resolved].description
  });
}

export default async function LocalizedHomePage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const resolvedLocale = normalizeLocale(locale);
  if (!resolvedLocale) notFound();

  const resolvedSearch = searchParams ? await searchParams : undefined;
  const intentValue = resolvedSearch?.intent;
  const intent = resolveLandingIntent(Array.isArray(intentValue) ? intentValue[0] : intentValue);

  return <LandingPage intent={intent} homePath={`/${resolvedLocale}`} />;
}
