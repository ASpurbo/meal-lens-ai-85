import { en, TranslationKeys } from "./en";
import { bn } from "./bn";
import { fr } from "./fr";
import { de } from "./de";
import { it } from "./it";
import { pt } from "./pt";
import { es } from "./es";

export type { TranslationKeys };

export const translations: Record<string, TranslationKeys> = {
  en,
  bn,
  fr,
  de,
  it,
  pt,
  es,
};

export function getTranslations(languageCode: string): TranslationKeys {
  return translations[languageCode] || translations.en;
}
