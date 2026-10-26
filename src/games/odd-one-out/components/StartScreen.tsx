import { HomeButton } from "../../../components/HomeButton";
import { LanguageSwitch } from "../../../components/LanguageSwitch";
import type { GameLanguage } from "../../../shared/language";
import { PICTURES_LICENSE_URL, pictureUrl } from "../data/things";

/** Pictures on the start screen: three fruits and a car. */
const PARADE = ["apple", "banana", "car", "pear"];

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
                className="flex h-18 w-18 animate-float items-center justify-center rounded-2xl bg-white p-2.5 shadow-lg sm:h-24 sm:w-24 short:h-14 short:w-14"
              >
                <img src={pictureUrl(id)} alt="" className="h-full w-full object-contain" />
              </div>
            ))}
          </div>
          <h1 className="bg-linear-to-r from-amber-500 via-pink-500 to-violet-500 bg-clip-text text-5xl font-black text-transparent sm:text-6xl short:text-4xl">
            Знайди зайве
          </h1>
          <p className="text-lg font-bold text-balance text-slate-600">
            Знайди картинку, яка не пасує до інших, і&nbsp;торкнися її!
          </p>
        </header>
        <LanguageSwitch language={language} onChange={onLanguageChange} />
        <button
          type="button"
          onClick={onStart}
          className="rounded-full bg-linear-to-r from-amber-500 to-pink-500 px-16 py-5 text-4xl font-black text-white shadow-xl shadow-pink-200 transition hover:scale-105 active:scale-95 short:py-3 short:text-3xl"
        >
          Грати! ▶
        </button>
      </div>
      <p className="text-center text-sm font-semibold text-slate-500">
        Картинки —{" "}
        <a className="underline" href="https://github.com/microsoft/fluentui-emoji">
          Microsoft Fluent Emoji
        </a>
        ,{" "}
        <a className="underline" href={PICTURES_LICENSE_URL}>
          MIT
        </a>
        .
      </p>
    </main>
  );
}
