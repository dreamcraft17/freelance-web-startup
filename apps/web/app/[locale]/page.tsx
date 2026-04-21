import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPage } from "@/components/marketing/LandingPage";
import { localizedMetadata, normalizeLocale } from "@/lib/i18n/seo";

const copy = {
  en: {
    title: "Find Freelancers Near You or Remote | NearWork",
    description:
      "Hire freelancers for real work. Search by skill and city, compare local and remote profiles, and keep bids plus chat in one hiring flow."
  },
  id: {
    title: "Cari Freelancer Terdekat atau Remote | NearWork",
    description:
      "Cari freelancer untuk kerja nyata: jasa freelancer terdekat atau remote, bandingkan profil dan proposal, lalu rekrut dari satu alur."
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
