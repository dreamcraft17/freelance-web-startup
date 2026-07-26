import type { Metadata } from "next";
export { default } from "@/app/(public)/freelancers/[username]/page";
import { localizedMetadata, normalizeLocale } from "@/lib/i18n/seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; username: string }>;
}): Promise<Metadata> {
  const { locale, username } = await params;
  const resolved = normalizeLocale(locale);
  if (!resolved) return {};

  return localizedMetadata({
    locale: resolved,
    path: `/freelancers/${username}`,
    title: resolved === "id" ? "Profil freelancer | NextWork" : "Freelancer profile | NextWork",
    description:
      resolved === "id"
        ? "Lihat profil freelancer, keahlian, dan detail penawaran di NextWork."
        : "View freelancer profile, skills, and proposal details on NextWork."
  });
}
