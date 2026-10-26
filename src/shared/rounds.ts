/**
 * Rounds of the games for little kids: a few things are shown (animals, colours), the game asks
 * for one of them, and the kid taps it.
 */

/** What the round logic needs to know about a thing to find. */
export interface RoundItem {
  id: string;
  /** Things a little kid can't tell apart share a group, and never show together. */
  lookalikes?: string;
}

export interface Round {
  /** The thing to find. */
  target: string;
  /** The things shown, in their places on the screen; the target is one of them. */
  choices: string[];
  /** Wrong things tapped so far in this round. */
  wrongPicks: string[];
  found: boolean;
}

export interface FindGame {
  round: Round;
  /** The things still to be asked about before any is asked again. */
  upcoming: string[];
}

export type Random = () => number;

export function shuffle<T>(items: readonly T[], random: Random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j] as T, result[i] as T];
  }
  return result;
}

const tooAlike = (a: RoundItem, b: RoundItem) =>
  a.id === b.id || (a.lookalikes !== undefined && a.lookalikes === b.lookalikes);

/**
 * The round asking about `target`: the target and other things unlike it and each other, `count`
 * in all.
 */
export function makeRound(
  target: RoundItem,
  items: readonly RoundItem[],
  count: number,
  random: Random = Math.random,
): Round {
  const shown = [target];
  for (const item of shuffle(items, random)) {
    if (shown.length === count) break;
    if (!shown.some((other) => tooAlike(item, other))) shown.push(item);
  }
  if (shown.length < count) throw new Error("Too few unlike things for a round");
  return {
    target: target.id,
    choices: shuffle(shown, random).map((item) => item.id),
    wrongPicks: [],
    found: false,
  };
}

function itemById(items: readonly RoundItem[], id: string): RoundItem {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`No item ${id}`);
  return item;
}

/** The next round of `count` things, asking about the next one in line; a new line once all were asked. */
export function nextRound(
  items: readonly RoundItem[],
  previous: FindGame | null,
  count: number,
  random: Random = Math.random,
): FindGame {
  let upcoming = previous?.upcoming ?? [];
  if (upcoming.length === 0) {
    upcoming = shuffle(
      items.map((item) => item.id),
      random,
    );
    // A new line must not start with the thing just found.
    const last = previous?.round.target;
    if (upcoming[0] === last && upcoming.length > 1) upcoming.push(upcoming.shift() as string);
  }
  const [target, ...rest] = upcoming as [string, ...string[]];
  return {
    round: makeRound(itemById(items, target), items, count, random),
    upcoming: rest,
  };
}

/** The round after the kid taps one of the things shown. */
export function pickChoice(round: Round, id: string): Round {
  if (round.found || !round.choices.includes(id)) return round;
  if (id === round.target) return { ...round, found: true };
  if (round.wrongPicks.includes(id)) return round;
  return { ...round, wrongPicks: [...round.wrongPicks, id] };
}
