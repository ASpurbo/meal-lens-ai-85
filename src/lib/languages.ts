export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "bn", label: "বাংলা", flag: "🇧🇩" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "es", label: "Español", flag: "🇪🇸" },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]["code"];

export const getLanguageLabel = (code: string) => {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.label || "English";
};

export const getLanguageFlag = (code: string) => {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.flag || "🇬🇧";
};
