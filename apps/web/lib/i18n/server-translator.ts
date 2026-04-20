import { createTranslator, type Translator } from "./create-translator";
import { getMessagesForLocale } from "./dictionaries";
import type { AppLocale } from "./types";
import { getAppLocale } from "./server-locale";

export async function getServerTranslator(): Promise<{ locale: AppLocale; t: Translator }> {
  const locale = await getAppLocale();
  const messages = getMessagesForLocale(locale);
  return { locale, t: createTranslator(messages) };
}
