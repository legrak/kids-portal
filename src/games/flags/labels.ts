import type { Region } from "./data/countries";
import type { GameMode, HintKind } from "./logic/game";
import type { CountrySet, RegionFilter } from "./logic/pool";

export const REGION_NAMES: Record<Region, string> = {
  europe: "Європа",
  asia: "Азія",
  africa: "Африка",
  northAmerica: "Північна Америка",
  southAmerica: "Південна Америка",
  oceania: "Австралія та Океанія",
};

export const REGION_FILTERS: readonly { value: RegionFilter; label: string; emoji: string }[] = [
  { value: "world", label: "Увесь світ", emoji: "🌍" },
  { value: "europe", label: "Європа", emoji: "🏰" },
  { value: "asia", label: "Азія", emoji: "🐼" },
  { value: "africa", label: "Африка", emoji: "🦁" },
  { value: "americas", label: "Америка", emoji: "🦅" },
];

export const MODES: readonly {
  value: GameMode;
  title: string;
  description: string;
  emoji: string;
}[] = [
  { value: "country", title: "Країна", description: "Назва українською", emoji: "🚩" },
  {
    value: "countryAndCapital",
    title: "Країна і столиця",
    description: "Ще й головне місто",
    emoji: "🏛️",
  },
  { value: "english", title: "English", description: "Назва англійською", emoji: "🔤" },
];

export const COUNTRY_SETS: readonly { value: CountrySet; label: string; emoji: string }[] = [
  { value: "famous", label: "Відомі", emoji: "⭐" },
  { value: "all", label: "Усі", emoji: "🗺️" },
];

export function hintLabel(hint: HintKind, revealedLetters: number): string {
  switch (hint) {
    case "map":
      return "Де ця країна?";
    case "ukrainianName":
      return "Як українською?";
    case "slots":
      return "Скільки букв?";
    case "letter":
      return revealedLetters === 0 ? "Перша буква" : "Ще одна буква";
  }
}

export const HINT_EMOJI: Record<HintKind, string> = {
  map: "🗺️",
  ukrainianName: "💬",
  slots: "🔢",
  letter: "🔤",
};

const PRAISES = ["Молодець!", "Чудово!", "Супер!", "Так тримати!", "Браво!", "Влучно!", "Клас!"];

/** A praise picked by the turn, so it stays the same while one result is on screen. */
export function praiseFor(turnNumber: number): string {
  return PRAISES[turnNumber % PRAISES.length] ?? "Молодець!";
}

/** Picks the Ukrainian plural form for a count: 1 прапор, 2 прапори, 5 прапорів. */
export function pluralUk(count: number, one: string, few: string, many: string): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastDigit === 1 && lastTwoDigits !== 11) return one;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) return few;
  return many;
}
