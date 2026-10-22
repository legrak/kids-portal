import type { Country } from "../data/countries";

/**
 * A part of the world to play. "americas" joins North and South America; Oceania has only
 * Australia and New Zealand in the game, so it is played as part of the whole world only.
 */
export type RegionFilter = "world" | "europe" | "asia" | "africa" | "americas";

/** All countries in the game, or only the well-known ones for younger kids. */
export type CountrySet = "all" | "famous";

export interface PoolSettings {
  region: RegionFilter;
  countrySet: CountrySet;
}

function isInRegion(country: Country, region: RegionFilter): boolean {
  if (region === "world") return true;
  if (region === "americas") {
    return country.region === "northAmerica" || country.region === "southAmerica";
  }
  return country.region === region;
}

/** The countries a game with these settings can show. */
export function countryPool(countries: readonly Country[], settings: PoolSettings): Country[] {
  return countries.filter(
    (country) =>
      country.tier !== "excluded" &&
      (settings.countrySet === "all" || country.tier === "famous") &&
      isInRegion(country, settings.region),
  );
}

/** Returns a shuffled copy (Fisher–Yates). `random` returns a number in [0, 1). */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j] as T, result[i] as T];
  }
  return result;
}
