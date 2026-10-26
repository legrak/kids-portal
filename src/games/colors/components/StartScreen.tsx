import { HomeButton } from "../../../components/HomeButton";
import { LanguageSwitch } from "../../../components/LanguageSwitch";
import type { GameLanguage } from "../../../shared/language";
import { colorById } from "../data/colors";
import { Balloon } from "./Balloon";

/** Balloons on the start screen. */
const PARADE = ["red", "yellow", "blue", "green"];

interface StartScreenProps {
  language: GameLanguage;
  onLanguageChange: (language: GameLanguage) => void;
  onStart: () => void;
}

export function StartScreen({ language, onLanguageChange, onStart }: StartScreenProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center gap-6 px-4 pt-3 pb-8 sm:gap-8 short:gap-3 short:pb-4">
      <div className="flex w-full">
        <HomeButton />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 sm:gap-8 short:gap-3">
        <header className="flex flex-col items-center gap-4 text-center short:gap-2">
          <div className="flex gap-3 sm:gap-4" aria-hidden="true">
            {PARADE.map((id, place) => (
              <div
                key={id}
                style={{ animationDelay: `${place * 300}ms` }}
                className="w-16 animate-float sm:w-20 short:w-12"
              >
                <Balloon color={colorById(id).hex} className="w-full drop-shadow-md" />
              </div>
            ))}
          </div>
          <h1 className="bg-linear-to-r from-rose-500 via-amber-500 to-sky-500 bg-clip-text text-5xl font-black text-transparent sm:text-6xl short:text-4xl">
            Знайди колір
          </h1>
          <p className="text-lg font-bold text-balance text-slate-600">
            Слухай, який колір назвуть, і&nbsp;торкнися кульки такого кольору!
          </p>
        </header>
        <LanguageSwitch language={language} onChange={onLanguageChange} />
        <button
          type="button"
          onClick={onStart}
          className="rounded-full bg-linear-to-r from-rose-500 to-amber-500 px-16 py-5 text-4xl font-black text-white shadow-xl shadow-rose-200 transition hover:scale-105 active:scale-95 short:py-3 short:text-3xl"
        >
          Грати! ▶
        </button>
      </div>
    </main>
  );
}
