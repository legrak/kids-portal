import { useEffect, useState } from "react";
import { HomeButton } from "../../../components/HomeButton";
import { voiceFor } from "../../../shared/speech";
import { colorById } from "../data/colors";
import {
  type GameLanguage,
  LANGUAGE_CHOICES,
  type Lang,
  langsOf,
  missingVoiceNotice,
} from "../language";
import { Balloon } from "./Balloon";

/** Balloons on the start screen. */
const PARADE = ["red", "yellow", "blue", "green"];

/** A browser with no voice at all may never say that its voices have loaded. */
const VOICES_WAIT_MS = 1500;

interface StartScreenProps {
  language: GameLanguage;
  onLanguageChange: (language: GameLanguage) => void;
  onStart: () => void;
}

export function StartScreen({ language, onLanguageChange, onStart }: StartScreenProps) {
  const missing = useMissingVoices();
  const notice = missing && missingVoiceNotice(language, missing);

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
        <fieldset className="flex flex-col items-center gap-2">
          <legend className="mb-2 text-center text-lg font-extrabold text-violet-900">
            Якою мовою питати?
          </legend>
          <div className="flex gap-2">
            {LANGUAGE_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                aria-pressed={language === choice.value}
                onClick={() => onLanguageChange(choice.value)}
                className={`rounded-2xl border-2 border-b-4 px-5 py-2 text-lg font-extrabold transition hover:-translate-y-0.5 active:translate-y-0.5 ${
                  language === choice.value
                    ? "border-violet-700 bg-violet-500 text-white shadow-lg shadow-violet-200"
                    : "border-violet-100 bg-white text-violet-900 shadow-sm hover:border-violet-300"
                }`}
              >
                {choice.label}
              </button>
            ))}
          </div>
          {notice && (
            <p
              role="status"
              className="max-w-md rounded-2xl bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-balance text-amber-900"
            >
              {notice}
            </p>
          )}
        </fieldset>
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

const voiceCount = () => globalThis.speechSynthesis?.getVoices().length ?? 0;

/**
 * The languages the browser has no voice for, or null while its voices still load. Voices can
 * come late, or a few at a time, so every change of them is looked at again.
 */
function useMissingVoices(): Lang[] | null {
  const [count, setCount] = useState(voiceCount);
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const speech = globalThis.speechSynthesis;
    const update = () => setCount(voiceCount());
    speech?.addEventListener("voiceschanged", update);
    const timer = window.setTimeout(() => setWaited(true), VOICES_WAIT_MS);
    return () => {
      speech?.removeEventListener("voiceschanged", update);
      window.clearTimeout(timer);
    };
  }, []);
  if (count === 0 && !waited) return null;
  return langsOf("both").filter((lang) => !voiceFor(lang));
}
