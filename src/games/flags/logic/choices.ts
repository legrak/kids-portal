import type { Country } from "../data/countries";
import { countryPool, type PoolSettings, shuffle } from "./pool";

/** How many names the kid picks from in the choice mode. */
export const CHOICE_COUNT = 4;

/** For each country of a game, the names to pick from: country codes in the order shown. */
export type GameChoices = Readonly<Record<string, readonly string[]>>;

/**
 * Flags that differ only in shade or proportions. Offered as a wrong name for each other, both
 * names would look right to the kid.
 */
const LOOKALIKE_FLAGS: readonly (readonly [string, string])[] = [
  ["id", "mc"],
  ["td", "ro"],
  ["nl", "lu"],
];

const areLookalikes = (a: string, b: string) =>
  LOOKALIKE_FLAGS.some(
    ([first, second]) => (a === first && b === second) || (a === second && b === first),
  );

/**
 * The names to pick from for each of these countries: the country itself and three others from
 * the game's countries, in a random order. A game with fewer than four countries (the well-known
 * countries of Africa are two) gets the others from all countries of its part of the world.
 */
export function dealChoices(
  countries: readonly Country[],
  codes: readonly string[],
  settings: PoolSettings,
  random: () => number = Math.random,
): GameChoices {
  const pool = countryPool(countries, settings).map((country) => country.code);
  const reserve = countryPool(countries, { ...settings, countrySet: "all" }).map(
    (country) => country.code,
  );
  return Object.fromEntries(
    codes.map((code) => {
      const canBeWrong = (other: string) => other !== code && !areLookalikes(other, code);
      const others = new Set([
        ...shuffle(pool.filter(canBeWrong), random),
        ...shuffle(reserve.filter(canBeWrong), random),
      ]);
      const wrong = [...others].slice(0, CHOICE_COUNT - 1);
      return [code, shuffle([code, ...wrong], random)];
    }),
  );
}
