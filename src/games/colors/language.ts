/** A language the game speaks and writes in. */
export type Lang = "uk" | "en";

/** The languages the game asks in: Ukrainian, English, or both, Ukrainian first. */
export type GameLanguage = "uk" | "en" | "both";

export const DEFAULT_LANGUAGE: GameLanguage = "both";

export const LANGUAGE_CHOICES: readonly { value: GameLanguage; label: string }[] = [
  { value: "uk", label: "UA" },
  { value: "en", label: "ENG" },
  { value: "both", label: "UA+ENG" },
];

export function langsOf(language: GameLanguage): Lang[] {
  return language === "both" ? ["uk", "en"] : [language];
}

/**
 * What a parent should know when the device lacks a voice for a language the game asks in, or
 * null when every voice is there.
 */
export function missingVoiceNotice(
  language: GameLanguage,
  missing: readonly Lang[],
): string | null {
  const langs = langsOf(language);
  const lacking = langs.filter((lang) => missing.includes(lang));
  if (lacking.length === 0) return null;
  const voices =
    lacking.length > 1
      ? "ні українського, ні англійського голосу"
      : lacking[0] === "uk"
        ? "українського голосу"
        : "англійського голосу";
  const [spoken] = langs.filter((lang) => !lacking.includes(lang));
  const outcome =
    spoken === undefined
      ? "питання буде лише написане"
      : `гра питатиме лише ${spoken === "uk" ? "українською" : "англійською"}`;
  const hint = `На деяких пристроях ${lacking.length > 1 ? "голоси" : "голос"} можна додати в налаштуваннях.`;
  return `На цьому пристрої немає ${voices}, тож ${outcome}. ${hint}`;
}

const STORAGE_KEY = "kids-portal.colors.settings";

/** The language saved in this browser, or the default. */
export function loadLanguage(): GameLanguage {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    const language = (saved as { language?: unknown } | null)?.language;
    return LANGUAGE_CHOICES.some((choice) => choice.value === language)
      ? (language as GameLanguage)
      : DEFAULT_LANGUAGE;
  } catch {
    // Storage can be blocked (private mode, disabled site data); the game works without it.
    return DEFAULT_LANGUAGE;
  }
}

export function saveLanguage(language: GameLanguage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ language }));
  } catch {
    // Not saving only means the language is picked again next time.
  }
}
