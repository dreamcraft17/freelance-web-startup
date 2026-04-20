import type { Metadata } from "next";
export { default } from "@/app/(marketing)/help/page";
import { localizedMetadata, normalizeLocale } from "@/lib/i18n/seo";

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
    path: "/help",
    title: resolved === "id" ? "Bantuan | NearWork" : "Help | NearWork",
    description:
      resolved === "id"
        ? "Pusat bantuan NearWork untuk akun, lowongan, proposal, dan profil freelancer."
        : "NearWork help center for accounts, jobs, proposals, and freelancer profiles."
  });
}
