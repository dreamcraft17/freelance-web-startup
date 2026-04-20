import type { Metadata } from "next";
export { default } from "@/app/(public)/freelancers/page";
import { localizedMetadata, normalizeLocale } from "@/lib/i18n/seo";

const copy = {
  en: {
    title: "Freelancers | NearWork",
    description: "Browse freelancer profiles for local and remote work on NearWork."
  },
  id: {
    title: "Freelancer | NearWork",
    description: "Jelajahi profil freelancer untuk pekerjaan lokal dan remote di NearWork."
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
    path: "/freelancers",
    title: copy[resolved].title,
    description: copy[resolved].description
  });
}
