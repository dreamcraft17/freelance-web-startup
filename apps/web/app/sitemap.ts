import type { MetadataRoute } from "next";
import { buildLocaleAlternates } from "@/lib/i18n/seo";

const ROUTES = ["/", "/jobs", "/freelancers", "/how-it-works", "/pricing", "/early-access", "/help"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return ROUTES.flatMap((route) => {
    const alt = buildLocaleAlternates(route);
    const localized = [
      { locale: "en", url: alt.canonicalEn },
      { locale: "id", url: alt.canonicalId }
    ];

    return localized.map((entry) => ({
      url: entry.url,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: route === "/" ? 1 : 0.8,
      alternates: {
        languages: {
          en: alt.canonicalEn,
          id: alt.canonicalId,
          "x-default": alt.xDefault
        }
      }
    }));
  });
}
