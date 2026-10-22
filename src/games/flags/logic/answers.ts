/** Accents and other combining marks, as they come apart under NFD. */
const COMBINING_MARKS = /[\u0300-\u036f]+/g;
/** Spaces, hyphens and dashes, apostrophes and quotes, dots and commas. */
const IGNORED_CHARS = /[\s\-\u2010\u2013\u2014'\u2018\u2019\u02bb\u02bc`.,]/g;

/**
 * Brings an answer to the form it is compared in: lowercase, without spaces, hyphens,
 * apostrophes, dots and commas, without accents on Latin letters, and with ґ read as г. A kid is
 * not penalised for any of these.
 */
export function normalizeAnswer(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[a-z][\u0300-\u036f]+/gi, (letterWithMarks) =>
      letterWithMarks.replace(COMBINING_MARKS, ""),
    )
    .normalize("NFC")
    .toLocaleLowerCase("uk")
    .replaceAll("ґ", "г")
    .replace(IGNORED_CHARS, "");
}

/**
 * How many typos turn one text into the other: a letter added, dropped or changed, or two
 * neighbouring letters swapped (optimal string alignment distance).
 */
export function editDistance(a: string, b: string): number {
  const rows: number[][] = [Array.from({ length: b.length + 1 }, (_, j) => j)];
  for (let i = 1; i <= a.length; i++) {
    const above = rows[i - 1] as number[];
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const substitution = (above[j - 1] as number) + (a[i - 1] === b[j - 1] ? 0 : 1);
      const deletion = (above[j] as number) + 1;
      const insertion = (row[j - 1] as number) + 1;
      let distance = Math.min(substitution, deletion, insertion);
      const isSwap = i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1];
      if (isSwap) distance = Math.min(distance, (rows[i - 2]?.[j - 2] as number) + 1);
      row.push(distance);
    }
    rows.push(row);
  }
  return rows[a.length]?.[b.length] as number;
}

/** How many typos an answer may have for a name of this normalized length. */
export function allowedTypos(nameLength: number): number {
  if (nameLength <= 4) return 0;
  if (nameLength <= 8) return 1;
  return 2;
}

export interface NamedOption {
  /** The country the names belong to. */
  code: string;
  names: readonly string[];
}

export type AnswerMatch =
  | { kind: "exact" }
  /** Accepted, but spelled differently from every accepted name. */
  | { kind: "typo" }
  /** The answer is the name of another country (or another country's capital). */
  | { kind: "other"; code: string }
  | { kind: "wrong" };

/**
 * Checks an answer against the accepted names. A misspelt answer is accepted only when it is
 * closer to an accepted name than to any name of the other options, so "Ірак" never passes for
 * "Іран".
 */
export function matchAnswer(
  answer: string,
  accepted: readonly string[],
  others: readonly NamedOption[],
): AnswerMatch {
  const normalized = normalizeAnswer(answer);
  if (normalized.length === 0) return { kind: "wrong" };

  const acceptedNames = accepted.map(normalizeAnswer);
  if (acceptedNames.includes(normalized)) return { kind: "exact" };

  for (const other of others) {
    if (other.names.some((name) => normalizeAnswer(name) === normalized)) {
      return { kind: "other", code: other.code };
    }
  }

  const closestAcceptedDistance = Math.min(
    ...acceptedNames
      .map((name) => ({ name, distance: editDistance(normalized, name) }))
      .filter(({ name, distance }) => distance <= allowedTypos(name.length))
      .map(({ distance }) => distance),
  );
  if (!Number.isFinite(closestAcceptedDistance)) return { kind: "wrong" };

  const isAsCloseToAnother = others.some((other) =>
    other.names.some(
      (name) => editDistance(normalized, normalizeAnswer(name)) <= closestAcceptedDistance,
    ),
  );
  return isAsCloseToAnother ? { kind: "wrong" } : { kind: "typo" };
}
