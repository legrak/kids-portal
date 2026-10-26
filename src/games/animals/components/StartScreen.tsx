import { HomeButton } from "../../../components/HomeButton";
import { LanguageSwitch } from "../../../components/LanguageSwitch";
import type { GameLanguage } from "../../../shared/language";
import { ANIMALS, animalById, type Credit } from "../data/animals";

/** Animals on the start screen. */
const PARADE = ["cow", "cat", "dog"];

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
      <header className="flex flex-col items-center gap-4 text-center short:gap-2">
        <div className="flex gap-3 sm:gap-4" aria-hidden="true">
          {PARADE.map((id, place) => (
            <img
              key={id}
              src={animalById(id).photo.url}
              alt=""
              style={{ animationDelay: `${place * 300}ms` }}
              className="h-20 w-20 animate-float rounded-full object-cover shadow-lg ring-4 ring-white sm:h-28 sm:w-28 short:h-14 short:w-14"
            />
          ))}
        </div>
        <h1 className="bg-linear-to-r from-emerald-500 via-sky-500 to-violet-500 bg-clip-text text-5xl font-black text-transparent sm:text-6xl short:text-4xl">
          Знайди тварину
        </h1>
        <p className="text-lg font-bold text-balance text-slate-600">
          Слухай, хто це кличе, і торкнися тієї тваринки!
        </p>
      </header>
      <LanguageSwitch language={language} onChange={onLanguageChange} />
      <button
        type="button"
        onClick={onStart}
        className="rounded-full bg-linear-to-r from-emerald-500 to-sky-500 px-16 py-5 text-4xl font-black short:py-3 short:text-3xl text-white shadow-xl shadow-emerald-200 transition hover:scale-105 active:scale-95"
      >
        Грати! ▶
      </button>
      <Credits />
    </main>
  );
}

/** Who took the photos and recorded the sounds, as their licences ask. */
function Credits() {
  return (
    <details className="mt-auto w-full rounded-3xl bg-white/70 p-4 text-sm text-slate-600 shadow-sm">
      <summary className="cursor-pointer font-bold text-violet-900">📷 Звідки фото і звуки</summary>
      <p className="mt-2">
        Фото і звуки з{" "}
        <a className="underline" href="https://commons.wikimedia.org/">
          Wikimedia Commons
        </a>
        , за посиланнями на файли.
      </p>
      <ul className="mt-2 flex flex-col gap-1">
        {ANIMALS.map((animal) => (
          <li key={animal.id}>
            <b className="text-slate-800">{animal.uk}</b>: фото —{" "}
            <CreditLine credit={animal.photo} />; звук — <CreditLine credit={animal.sound} />
          </li>
        ))}
      </ul>
    </details>
  );
}

function CreditLine({ credit }: { credit: Credit }) {
  return (
    <>
      <a className="underline" href={credit.source}>
        {credit.author}
      </a>
      ,{" "}
      {credit.licenseUrl ? (
        <a className="underline" href={credit.licenseUrl}>
          {credit.license}
        </a>
      ) : (
        credit.license
      )}
    </>
  );
}
