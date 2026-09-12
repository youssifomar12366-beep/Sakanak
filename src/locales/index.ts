import ar from "./ar";
import en, { type TranslationKey } from "./en";

export type Language = "ar" | "en";
export const translations = { ar, en } as const;
export const translate = (language: Language, key: TranslationKey) =>
  translations[language][key];
