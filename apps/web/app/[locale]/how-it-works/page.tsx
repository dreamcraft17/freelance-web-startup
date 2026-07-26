import type { Metadata } from "next";
export { default } from "@/app/(marketing)/how-it-works/page";
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
    path: "/how-it-works",
    title: resolved === "id" ? "Cara kerja | NextWork" : "How it works | NextWork",
    description:
      resolved === "id"
        ? "Pelajari alur NextWork dari brief, proposal, hingga kolaborasi."
        : "Learn the NextWork flow from brief and proposals to delivery."
  });
}
