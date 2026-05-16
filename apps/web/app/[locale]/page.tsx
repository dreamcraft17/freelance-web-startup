import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPage } from "@/components/marketing/LandingPage";
import { resolveLandingIntent } from "@/components/marketing/LandingPage";
import { localizedMetadata, normalizeLocale } from "@/lib/i18n/seo";

const copy = {
  en: {
    title: "NearWork — Hire freelancers & find work (Indonesia-first)",
    description:
      "Post a job or browse open roles. Proposals and messages stay on the job thread. Filter by skill, category, city, and work mode."
  },
  id: {
    title: "NearWork — Rekrut freelancer & cari kerja Lepas / Freelancer",
    description:
      "Pasang lowongan atau cari role terbuka. Proposal dan chat menempel ke utas lowongan. Filter skill, kategori, kota, dan mode kerja."
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
