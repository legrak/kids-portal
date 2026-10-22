export type KeyboardLanguage = "uk" | "en";

/** Letter rows of the on-screen keyboard. */
export const KEYBOARD_ROWS: Record<KeyboardLanguage, readonly string[][]> = {
  uk: [
    ["й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ї"],
    ["ф", "і", "в", "а", "п", "р", "о", "л", "д", "ж", "є"],
    ["ґ", "я", "ч", "с", "м", "и", "т", "ь", "б", "ю", "’"],
  ],
  en: [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m", "’"],
  ],
};

/**
 * Physical key positions (`KeyboardEvent.code`) of the Ukrainian letters, as on the Windows
 * (Enhanced) and Linux Ukrainian layouts; ґ is also on the extra key left of Z.
 */
const UKRAINIAN_BY_KEY_CODE: Record<string, string> = {
  KeyQ: "й",
  KeyW: "ц",
  KeyE: "у",
  KeyR: "к",
  KeyT: "е",
  KeyY: "н",
  KeyU: "г",
  KeyI: "ш",
  KeyO: "щ",
  KeyP: "з",
  BracketLeft: "х",
  BracketRight: "ї",
  KeyA: "ф",
  KeyS: "і",
  KeyD: "в",
  KeyF: "а",
  KeyG: "п",
  KeyH: "р",
  KeyJ: "о",
  KeyK: "л",
  KeyL: "д",
  Semicolon: "ж",
  Quote: "є",
  Backslash: "ґ",
  IntlBackslash: "ґ",
  KeyZ: "я",
  KeyX: "ч",
  KeyC: "с",
  KeyV: "м",
  KeyB: "и",
  KeyN: "т",
  KeyM: "ь",
  Comma: "б",
  Period: "ю",
  Backquote: "’",
};

const UKRAINIAN_LETTERS = new Set(KEYBOARD_ROWS.uk.flat().filter((key) => key !== "’"));
const CYRILLIC = /\p{Script=Cyrillic}/u;
const LATIN = /\p{Script=Latin}/u;
/** What an English layout types: letters, digits and symbols. */
const PRINTABLE_ASCII = /^[!-~]$/;

function isUkrainianLetter(char: string): boolean {
  return UKRAINIAN_LETTERS.has(char.toLocaleLowerCase("uk"));
}

/**
 * The letter a physical key should type in the game's language, when the computer's keyboard
 * layout is a different one: a kid on an English (or Russian) layout still types Ukrainian by key
 * position, and the other way round. Returns null when the key should type what it types.
 */
export function remapPhysicalKey(
  language: KeyboardLanguage,
  key: string,
  code: string,
): string | null {
  if (language === "uk") {
    // Ukrainian letters and the symbols of a Ukrainian layout (like its apostrophe ʼ) stay as typed.
    const isOtherLayout =
      PRINTABLE_ASCII.test(key) || (CYRILLIC.test(key) && !isUkrainianLetter(key));
    return isOtherLayout ? (UKRAINIAN_BY_KEY_CODE[code] ?? null) : null;
  }
  if (key.length !== 1 || !CYRILLIC.test(key)) return null;
  if (code === "Quote") return "’";
  const letter = /^Key([A-Z])$/.exec(code)?.[1];
  return letter ? letter.toLowerCase() : null;
}

/** True when the text has letters of another alphabet than the one the answer is in. */
export function hasLettersOfOtherAlphabet(language: KeyboardLanguage, text: string): boolean {
  if (language === "en") return CYRILLIC.test(text);
  return Array.from(text).some(
    (char) => LATIN.test(char) || (CYRILLIC.test(char) && !isUkrainianLetter(char)),
  );
}
