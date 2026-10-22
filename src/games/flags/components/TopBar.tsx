import { pluralUk } from "../labels";
import type { FlagResult } from "../logic/game";
import { MuteButton } from "./MuteButton";

interface TopBarProps {
  roundSize: number;
  results: readonly FlagResult[];
  /** False while the result of the last flag is on screen: no dot is the current one then. */
  isAsking: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onMenu: () => void;
}

const starsText = (count: number) => `${count} ${pluralUk(count, "зірка", "зірки", "зірок")}`;

/** Progress dot colours by the stars a flag earned: 0 to 3. */
const DOT_COLORS = ["bg-rose-400", "bg-orange-400", "bg-lime-400", "bg-emerald-500"] as const;

/** Back to the menu, the progress through the round, and the stars collected. */
export function TopBar({ roundSize, results, isAsking, muted, onToggleMute, onMenu }: TopBarProps) {
  const stars = results.reduce((sum, result) => sum + result.stars, 0);
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 pt-3 pb-1 sm:gap-3">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Меню"
        className="h-10 shrink-0 rounded-full bg-white px-3 font-bold whitespace-nowrap text-violet-700 shadow-sm ring-1 ring-violet-100 transition hover:scale-105 active:scale-95"
      >
        ←<span className="hidden sm:inline"> Меню</span>
      </button>
      <ol
        className="flex min-w-0 flex-1 items-center justify-center gap-1 sm:gap-1.5"
        aria-label="Прогрес раунду"
      >
        {Array.from({ length: roundSize }, (_, place) => {
          const result = results[place];
          const isCurrent = isAsking && place === results.length;
          return (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: the dots are the round's fixed places
              key={place}
              aria-label={result ? `${place + 1}: ${starsText(result.stars)}` : `${place + 1}`}
              className={`h-3 rounded-full transition-all duration-300 ${
                result
                  ? `w-3 ${DOT_COLORS[result.stars]}`
                  : isCurrent
                    ? "w-5 bg-violet-500 sm:w-6"
                    : "w-3 bg-white ring-1 ring-violet-200"
              }`}
            />
          );
        })}
      </ol>
      <p className="flex h-10 shrink-0 items-center gap-1 rounded-full bg-white px-3 font-extrabold whitespace-nowrap text-amber-600 shadow-sm ring-1 ring-amber-100">
        <span aria-hidden="true">⭐</span> {stars}
        <span className="sr-only"> {pluralUk(stars, "зірка", "зірки", "зірок")}</span>
      </p>
      <MuteButton muted={muted} onToggle={onToggleMute} />
    </header>
  );
}
