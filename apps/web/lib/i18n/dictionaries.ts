import type { AppLocale } from "./types";
import en from "../../locales/en.json";
import id from "../../locales/id.json";

export type Messages = typeof en;

const messagesByLocale: Record<AppLocale, Messages> = {
  en,
  id
};

export function getMessagesForLocale(locale: AppLocale): Messages {
  return messagesByLocale[locale];
}
