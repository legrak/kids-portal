import type { GameMode, GameSettings } from "./logic/game";
import type { CountrySet, RegionFilter } from "./logic/pool";

export type StoredSettings = GameSettings;

export const DEFAULT_SETTINGS: StoredSettings = {
  mode: "country",
  region: "world",
  countrySet: "all",
};

const STORAGE_KEY = "kids-portal.flags.settings";

const MODES: readonly GameMode[] = ["country", "countryAndCapital", "english"];
const REGIONS: readonly RegionFilter[] = ["world", "europe", "asia", "africa", "americas"];
const COUNTRY_SETS: readonly CountrySet[] = ["all", "famous"];

function pick<T>(allowed: readonly T[], value: unknown, fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/** The settings saved in this browser, with defaults for anything missing or unreadable. */
export function loadSettings(): StoredSettings {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    const fields = (typeof saved === "object" && saved !== null ? saved : {}) as Record<
      string,
      unknown
    >;
    return {
      mode: pick(MODES, fields.mode, DEFAULT_SETTINGS.mode),
      region: pick(REGIONS, fields.region, DEFAULT_SETTINGS.region),
      countrySet: pick(COUNTRY_SETS, fields.countrySet, DEFAULT_SETTINGS.countrySet),
    };
  } catch {
    // Storage can be blocked (private mode, disabled site data); the game works without it.
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: StoredSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Not saving only means the kid picks the settings again next time.
  }
}
