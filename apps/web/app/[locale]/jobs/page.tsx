import type { Metadata } from "next";
export { default } from "@/app/(public)/jobs/page";
import { localizedMetadata, normalizeLocale } from "@/lib/i18n/seo";

const copy = {
  en: {
    title: "Jobs | NextWork",
    description: "Browse open jobs and proposals from clients on NextWork."
  },
  id: {
    title: "Lowongan | NextWork",
    description: "Jelajahi lowongan terbuka dan proposal klien di NextWork."
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
    path: "/jobs",
    title: copy[resolved].title,
    description: copy[resolved].description
  });
}

