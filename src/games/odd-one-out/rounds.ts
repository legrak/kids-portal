import { type Random, type Round, type RoundItem, shuffle } from "../../shared/rounds";

/** How many things of one category a round shows next to the odd one. */
export const GROUP_SIZE = 3;

/** What the round logic needs to know about a thing. */
export interface CategorizedItem extends RoundItem {
  category: string;
  /**
   * Other categories a kid could count the thing in, as a duck in the domestic animals. It is
   * never the odd one next to these, nor one of the three next to an odd one of these.
   */
  alsoIn?: readonly string[];
}

export interface OddRound extends Round {
  /** The category of the three; the target is the odd thing. */
  group: string;
}

export interface OddGame {
  round: OddRound;
  /** The categories still to be the three before any is again. */
  upcoming: string[];
}

const countsIn = (thing: CategorizedItem, category: string) =>
  thing.category === category || (thing.alsoIn?.includes(category) ?? false);

/** The things that can be the three of `group` next to an odd one of `other`, and the odd ones. */
export function pairing(things: readonly CategorizedItem[], group: string, other: string) {
  return {
    members: things.filter((thing) => thing.category === group && !countsIn(thing, other)),
    odds: things.filter((thing) => thing.category === other && !countsIn(thing, group)),
  };
}

const tooAlike = (a: CategorizedItem, b: CategorizedItem) =>
  a.lookalikes !== undefined && a.lookalikes === b.lookalikes;

/**
 * Whether `member` would be the second of the three to fit a category the odd one also fits: a
 * drum and maracas next to a ball are all toys, so the guitar beside them would be odd too.
 */
const sharesWithOdd = (
  members: readonly CategorizedItem[],
  odd: CategorizedItem,
  member: CategorizedItem,
) =>
  (odd.alsoIn ?? []).some(
    (category) => countsIn(member, category) && members.some((other) => countsIn(other, category)),
  );

const categoriesOf = (things: readonly CategorizedItem[]) => [
  ...new Set(things.map((thing) => thing.category)),
];

/**
 * A round with three things of `group` and an odd one of a category picked at random. No two of
 * them look alike, and no other three of them share a category, so only one is odd.
 */
export function makeRound(
  group: string,
  things: readonly CategorizedItem[],
  random: Random = Math.random,
): OddRound {
  const others = categoriesOf(things).filter((category) => category !== group);
  for (const other of shuffle(others, random)) {
    const { members, odds } = pairing(things, group, other);
    for (const odd of shuffle(odds, random)) {
      const three: CategorizedItem[] = [];
      for (const member of shuffle(members, random)) {
        if (three.length === GROUP_SIZE) break;
        if ([odd, ...three].some((thing) => tooAlike(thing, member))) continue;
        if (!sharesWithOdd(three, odd, member)) three.push(member);
      }
      if (three.length < GROUP_SIZE) continue;
      const shown = [...three, odd];
      return {
        group,
        target: odd.id,
        choices: shuffle(shown, random).map((thing) => thing.id),
        wrongPicks: [],
        found: false,
      };
    }
  }
  throw new Error(`No odd one for ${group}`);
}

/** The next round, with the next category in line; a new line once every category had a turn. */
export function nextRound(
  things: readonly CategorizedItem[],
  previous: OddGame | null,
  random: Random = Math.random,
): OddGame {
  let upcoming = previous?.upcoming ?? [];
  if (upcoming.length === 0) {
    upcoming = shuffle(categoriesOf(things), random);
    // A new line must not start with the category just played.
    const last = previous?.round.group;
    if (upcoming[0] === last && upcoming.length > 1) upcoming.push(upcoming.shift() as string);
  }
  const [group, ...rest] = upcoming as [string, ...string[]];
  return { round: makeRound(group, things, random), upcoming: rest };
}
