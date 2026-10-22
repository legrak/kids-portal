import { pluralUk } from "../labels";
import { countryByCode, type FlagResult, type GameMode, ROUND_SIZE } from "../logic/game";
import { FlagImage } from "./FlagImage";
import { Stars } from "./Stars";

interface SummaryScreenProps {
  mode: GameMode;
  results: readonly FlagResult[];
  /** How many flags of this game have not been shown yet. */
  upcomingCount: number;
  onNextRound: () => void;
  onReplay: (codes: string[]) => void;
  onMenu: () => void;
}

/** Flags answered with at most one star are worth another try. */
const isHard = (result: FlagResult) => result.stars <= 1;

function verdict(share: number): { emoji: string; title: string } {
  if (share >= 0.8) return { emoji: "🏆", title: "Неймовірно!" };
  if (share >= 0.5) return { emoji: "🎉", title: "Чудова гра!" };
  return { emoji: "💪", title: "Гарна спроба!" };
}

export function SummaryScreen({
  mode,
  results,
  upcomingCount,
  onNextRound,
  onReplay,
  onMenu,
}: SummaryScreenProps) {
  const stars = results.reduce((sum, result) => sum + result.stars, 0);
  const maxStars = results.length * 3;
  const { emoji, title } = verdict(maxStars === 0 ? 0 : stars / maxStars);
  const hardCodes = results.filter(isHard).map((result) => result.code);
  const nextRoundSize = Math.min(ROUND_SIZE, upcomingCount);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col items-center gap-6 px-4 py-8">
      <header className="flex animate-rise flex-col items-center gap-2 text-center">
        <span className="animate-float text-7xl" aria-hidden="true">
          {emoji}
        </span>
        <h1 className="text-4xl font-black text-violet-900">{title}</h1>
        <p className="text-3xl font-extrabold text-amber-600">
          ⭐ {stars} <span className="text-xl text-slate-500">з {maxStars}</span>
        </p>
      </header>

      <div className="flex flex-wrap justify-center gap-3">
        {upcomingCount > 0 ? (
          <button
            type="button"
            onClick={onNextRound}
            className="rounded-full bg-violet-500 px-8 py-4 text-2xl font-black text-white shadow-lg transition hover:scale-105 hover:bg-violet-600 active:scale-95"
          >
            Ще {nextRoundSize} {pluralUk(nextRoundSize, "прапор", "прапори", "прапорів")} ▶
          </button>
        ) : (
          <p className="w-full text-center text-xl font-extrabold text-emerald-600">
            Усі прапори пройдено! 🎉
          </p>
        )}
        {hardCodes.length > 0 && (
          <button
            type="button"
            onClick={() => onReplay(hardCodes)}
            className="rounded-full bg-amber-400 px-6 py-4 text-xl font-extrabold text-amber-950 shadow-lg transition hover:scale-105 hover:bg-amber-300 active:scale-95"
          >
            🔁 Повторити складні ({hardCodes.length})
          </button>
        )}
        <button
          type="button"
          onClick={onMenu}
          className="rounded-full bg-white px-6 py-4 text-xl font-bold text-slate-600 shadow-lg ring-1 ring-slate-200 transition hover:scale-105 active:scale-95"
        >
          🏠 Меню
        </button>
      </div>
      <ul className="grid w-full grid-cols-2 gap-3 sm:grid-cols-5">
        {results.map((result, place) => {
          const country = countryByCode(result.code);
          return (
            <li
              key={result.code}
              style={{ animationDelay: `${place * 60}ms` }}
              className="flex animate-rise flex-col items-center gap-1 rounded-2xl bg-white p-2 text-center shadow-md ring-1 ring-violet-100"
            >
              <FlagImage code={result.code} alt={`Прапор: ${country.uk.name}`} />
              <span className="font-extrabold leading-tight text-slate-800">
                {mode === "english" ? country.en.name : country.uk.name}
              </span>
              {mode === "countryAndCapital" && (
                <span className="text-sm font-semibold text-slate-500">{country.uk.capital}</span>
              )}
              <Stars count={result.stars} />
            </li>
          );
        })}
      </ul>
    </main>
  );
}
