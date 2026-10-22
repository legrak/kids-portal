/** How many animals each round shows. */
export const CHOICE_COUNT = 3;

/** What the round logic needs to know about an animal. */
export interface AnimalKind {
  id: string;
  /** Animals a little kid can't tell apart share a group, and never show together. */
  lookalikes?: string;
}

export interface Round {
  /** The animal to find. */
  target: string;
  /** The animals shown, in their places on the screen; the target is one of them. */
  choices: string[];
  /** Wrong animals tapped so far in this round. */
  wrongPicks: string[];
  found: boolean;
}

export interface AnimalGame {
  round: Round;
  /** The animals still to be asked about before any is asked again. */
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

const tooAlike = (a: AnimalKind, b: AnimalKind) =>
  a.id === b.id || (a.lookalikes !== undefined && a.lookalikes === b.lookalikes);

/** The round asking about `target`: the target and other animals unlike it and each other. */
export function makeRound(
  target: AnimalKind,
  animals: readonly AnimalKind[],
  random: Random = Math.random,
): Round {
  const shown = [target];
  for (const animal of shuffle(animals, random)) {
    if (shown.length === CHOICE_COUNT) break;
    if (!shown.some((other) => tooAlike(animal, other))) shown.push(animal);
  }
  if (shown.length < CHOICE_COUNT) throw new Error("Too few unlike animals for a round");
  return {
    target: target.id,
    choices: shuffle(shown, random).map((animal) => animal.id),
    wrongPicks: [],
    found: false,
  };
}

function animalById(animals: readonly AnimalKind[], id: string): AnimalKind {
  const animal = animals.find((candidate) => candidate.id === id);
  if (!animal) throw new Error(`No animal ${id}`);
  return animal;
}

/** The next round, asking about the next animal in line; a new line once all were asked. */
export function nextRound(
  animals: readonly AnimalKind[],
  previous: AnimalGame | null,
  random: Random = Math.random,
): AnimalGame {
  let upcoming = previous?.upcoming ?? [];
  if (upcoming.length === 0) {
    upcoming = shuffle(
      animals.map((animal) => animal.id),
      random,
    );
    // A new line must not start with the animal just found.
    const last = previous?.round.target;
    if (upcoming[0] === last && upcoming.length > 1) upcoming.push(upcoming.shift() as string);
  }
  const [target, ...rest] = upcoming as [string, ...string[]];
  return { round: makeRound(animalById(animals, target), animals, random), upcoming: rest };
}

/** The round after the kid taps an animal. */
export function pickAnimal(round: Round, id: string): Round {
  if (round.found || !round.choices.includes(id)) return round;
  if (id === round.target) return { ...round, found: true };
  if (round.wrongPicks.includes(id)) return round;
  return { ...round, wrongPicks: [...round.wrongPicks, id] };
}
