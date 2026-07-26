import type { Metadata } from "next";
export { default } from "@/app/(marketing)/early-access/page";
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
    path: "/early-access",
    title: resolved === "id" ? "Akses awal | NextWork" : "Early access | NextWork",
    description:
      resolved === "id"
        ? "NextWork sedang berkembang dengan job nyata, freelancer nyata, dan batas produk yang transparan."
        : "NextWork is shipping in public with real jobs, real freelancers, and transparent product limits."
  });
}
