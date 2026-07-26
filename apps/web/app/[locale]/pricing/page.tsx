import type { Metadata } from "next";
export { default } from "@/app/(marketing)/pricing/page";
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
    path: "/pricing",
    title: resolved === "id" ? "Harga | NextWork" : "Pricing | NextWork",
    description:
      resolved === "id"
        ? "Model harga NextWork: sederhana, transparan, dan bertahap selama early access."
        : "NextWork pricing model: simple, transparent, and evolving during early access."
  });
}
