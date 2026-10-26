import type { Phrase } from "./speech";

/** A language a game speaks and writes in. */
export type Lang = "uk" | "en";

/** The languages a game asks in: Ukrainian, English, or both, Ukrainian first. */
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

/** The same words in Ukrainian and in English. */
export interface Words {
  uk: string;
  en: string;
}

/** The words in the languages a game asks in, in their order. */
export function phrasesIn(language: GameLanguage, words: Words): Phrase[] {
  return langsOf(language).map((lang) => ({ text: words[lang], lang }));
}

/**
 * What a parent should know when the device lacks a voice for a language a game asks in, or
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

/** The language a game saved in this browser under `storageKey`, or the default. */
export function loadLanguage(storageKey: string): GameLanguage {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    const language = (saved as { language?: unknown } | null)?.language;
    return LANGUAGE_CHOICES.some((choice) => choice.value === language)
      ? (language as GameLanguage)
      : DEFAULT_LANGUAGE;
  } catch {
    // Storage can be blocked (private mode, disabled site data); the game works without it.
    return DEFAULT_LANGUAGE;
  }
}

export function saveLanguage(storageKey: string, language: GameLanguage): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ language }));
  } catch {
    // Not saving only means the language is picked again next time.
  }
}
