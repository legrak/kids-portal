import { useEffect, useState } from "react";
import {
  type GameLanguage,
  LANGUAGE_CHOICES,
  type Lang,
  langsOf,
  missingVoiceNotice,
} from "../shared/language";
import { voiceFor } from "../shared/speech";

/** A browser with no voice at all may never say that its voices have loaded. */
const VOICES_WAIT_MS = 1500;

interface LanguageSwitchProps {
  language: GameLanguage;
  onChange: (language: GameLanguage) => void;
}

/**
 * The languages a game asks in, picked before the start, with a notice for the parent when the
 * device has no voice for one of them.
 */
export function LanguageSwitch({ language, onChange }: LanguageSwitchProps) {
  const missing = useMissingVoices();
  const notice = missing && missingVoiceNotice(language, missing);

  return (
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
            onClick={() => onChange(choice.value)}
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
