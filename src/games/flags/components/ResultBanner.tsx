import { type Stars as StarCount, type Turn, targetAnswer } from "../logic/game";
import { Stars } from "./Stars";

interface ResultBannerProps {
  turn: Turn;
  stars: StarCount;
  praise: string;
  /** How long until the game moves on by itself, for the countdown bar. */
  advanceAfterMs: number;
  onNext: () => void;
}

/** What the turn ended with: the praise and stars, or the answer the kid did not find. */
export function ResultBanner({ turn, stars, praise, advanceAfterMs, onNext }: ResultBannerProps) {
  const { country, questions } = turn;
  const solved = questions.every((q) => q.status === "correct");
  const misspelt = questions.find((q) => q.acceptedWithTypo);
  const asksEnglish = questions.some((q) => q.kind === "countryEnglish");
  const asksCapital = questions.some((q) => q.kind === "capital");

  return (
    <div
      role="status"
      className={`flex w-full animate-rise flex-col items-center gap-2 overflow-hidden rounded-3xl p-4 text-center shadow-lg ring-2 ${
        solved ? "bg-emerald-50 ring-emerald-300" : "bg-amber-50 ring-amber-300"
      }`}
    >
      <p className={`text-2xl font-extrabold ${solved ? "text-emerald-600" : "text-amber-600"}`}>
        {solved ? `${praise} 🎉` : "Нічого, наступного разу вийде! 💪"}
      </p>
      <Stars count={stars} size="lg" animated />
      <p className="text-3xl font-extrabold text-slate-800">
        {asksEnglish ? country.en.name : country.uk.name}
      </p>
      {asksEnglish && <p className="font-bold text-slate-500">{country.uk.name}</p>}
      {asksCapital && (
        <p className="text-lg font-bold text-slate-600">Столиця — {country.uk.capital}</p>
      )}
      {misspelt && (
        <p className="font-semibold text-slate-500">
          Пишеться так: <b>{targetAnswer(country, misspelt.kind)}</b>
        </p>
      )}
      <button
        type="button"
        onClick={onNext}
        // Keeps the focus in the answer field, so a phone keyboard stays open for the next flag.
        onPointerDown={(event) => event.preventDefault()}
        className="mt-1 rounded-full bg-violet-500 px-10 py-3 text-xl font-extrabold text-white shadow-md transition hover:scale-105 hover:bg-violet-600 active:scale-95"
      >
        Далі →
      </button>
      {/* Time left until the next flag comes by itself. */}
      <div aria-hidden="true" className="h-1.5 w-40 overflow-hidden rounded-full bg-violet-100">
        <div
          style={{ animationDuration: `${advanceAfterMs}ms` }}
          className="h-full origin-left animate-countdown rounded-full bg-violet-400"
        />
      </div>
    </div>
  );
}
