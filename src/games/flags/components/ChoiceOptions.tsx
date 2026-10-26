import { countryByCode, type Question } from "../logic/game";

interface ChoiceOptionsProps {
  question: Question;
  /** Text shown under the names after a wrong pick. */
  mistakeText: string | null;
  onPick: (code: string) => void;
}

/** The names to pick the country from. A wrong pick shakes and stays crossed out. */
export function ChoiceOptions({ question, mistakeText, onPick }: ChoiceOptionsProps) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <fieldset aria-label="Вибери країну" className="grid w-full min-w-0 grid-cols-2 gap-2">
        {question.options.map((code) => {
          const isWrong = question.wrongPicks.includes(code);
          // The smaller text below 360 px lets «Домініканська», the longest word of a name, fit
          // on a 320 px phone.
          return (
            <button
              key={code}
              type="button"
              disabled={isWrong}
              onClick={() => onPick(code)}
              className={`min-h-20 rounded-2xl border-2 border-b-4 px-2 py-3 text-base leading-tight font-extrabold shadow-md transition min-[360px]:text-lg sm:text-2xl ${
                isWrong
                  ? "animate-shake border-rose-200 bg-rose-50 text-rose-300 line-through"
                  : "border-violet-200 bg-white text-violet-900 hover:-translate-y-0.5 hover:border-violet-400 active:translate-y-0.5 active:border-b-2"
              }`}
            >
              {countryByCode(code).uk.name}
            </button>
          );
        })}
      </fieldset>
      <p aria-live="polite" className="text-center font-bold text-rose-500 empty:hidden">
        {mistakeText ?? ""}
      </p>
    </div>
  );
}
