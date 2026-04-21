import type { AppLocale } from "@/lib/i18n/types";

const GOOGLE_TRANSLATE_BASE = "https://translation.googleapis.com/language/translate/v2";

function getApiKey(): string | null {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY?.trim();
  return key ? key : null;
}

export async function detectLanguage(text: string): Promise<AppLocale> {
  const apiKey = getApiKey();
  const trimmed = text.trim();
  if (!apiKey || !trimmed) return "en";

  try {
    const url = new URL(`${GOOGLE_TRANSLATE_BASE}/detect`);
    url.searchParams.set("key", apiKey);
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: trimmed }),
      cache: "no-store"
    });
    if (!response.ok) return "en";
    const payload = (await response.json()) as {
      data?: { detections?: Array<Array<{ language?: string }>> };
    };
    const detected = payload.data?.detections?.[0]?.[0]?.language;
    return detected === "id" ? "id" : "en";
  } catch {
    return "en";
  }
}

export async function translateText(text: string, targetLang: AppLocale): Promise<string | null> {
  const apiKey = getApiKey();
  const trimmed = text.trim();
  if (!apiKey || !trimmed) return null;

  try {
    const url = new URL(GOOGLE_TRANSLATE_BASE);
    url.searchParams.set("key", apiKey);
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: trimmed, target: targetLang, format: "text" }),
      cache: "no-store"
    });
    if (!response.ok) {
      console.warn("[nearwork:translate] translate_failed", { targetLang, status: response.status });
      return null;
    }
    const payload = (await response.json()) as {
      data?: { translations?: Array<{ translatedText?: string }> };
    };
    return payload.data?.translations?.[0]?.translatedText?.trim() || null;
  } catch {
    console.warn("[nearwork:translate] translate_exception", { targetLang });
    return null;
  }
}

export async function buildJobTranslations(input: {
  title: string;
  description: string;
  sourceLanguage?: AppLocale;
}): Promise<{
  language: AppLocale;
  titleEn: string | null;
  titleId: string | null;
  descriptionEn: string | null;
  descriptionId: string | null;
}> {
  const probe = `${input.title}\n${input.description}`;
  const language = input.sourceLanguage ?? (await detectLanguage(probe));

  if (language === "id") {
    const [titleEn, descriptionEn] = await Promise.all([
      translateText(input.title, "en"),
      translateText(input.description, "en")
    ]);
    return {
      language,
      titleEn,
      titleId: input.title,
      descriptionEn,
      descriptionId: input.description
    };
  }

  const [titleId, descriptionId] = await Promise.all([
    translateText(input.title, "id"),
    translateText(input.description, "id")
  ]);
  return {
    language: "en",
    titleEn: input.title,
    titleId,
    descriptionEn: input.description,
    descriptionId
  };
}
