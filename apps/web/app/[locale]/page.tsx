import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPage } from "@/components/marketing/LandingPage";
import { localizedMetadata, normalizeLocale } from "@/lib/i18n/seo";

const copy = {
  en: {
    title: "NearWork | Freelance marketplace for local and remote work",
    description:
      "Find freelancers nearby or remote, compare proposals, and hire faster on NearWork."
  },
  id: {
    title: "NearWork | Marketplace freelance untuk kerja lokal dan remote",
    description:
      "Temukan freelancer terdekat atau remote, bandingkan proposal, dan rekrut lebih cepat di NearWork."
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
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!normalizeLocale(locale)) notFound();

  return <LandingPage />;
}
