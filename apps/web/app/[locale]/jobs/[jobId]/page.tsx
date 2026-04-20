import type { Metadata } from "next";
export { default } from "@/app/(public)/jobs/[jobId]/page";
import { localizedMetadata, normalizeLocale } from "@/lib/i18n/seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; jobId: string }>;
}): Promise<Metadata> {
  const { locale, jobId } = await params;
  const resolved = normalizeLocale(locale);
  if (!resolved) return {};

  return localizedMetadata({
    locale: resolved,
    path: `/jobs/${jobId}`,
    title: resolved === "id" ? "Detail lowongan | NearWork" : "Job details | NearWork",
    description:
      resolved === "id"
        ? "Lihat detail lowongan, brief, dan proposal yang tersedia di NearWork."
        : "View job details, brief, and proposals available on NearWork."
  });
}
