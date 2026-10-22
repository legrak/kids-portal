import type { ReactNode } from "react";
import { COUNTRIES } from "../data/countries";
import { COUNTRY_SETS, MODES, REGION_FILTERS } from "../labels";
import type { GameSettings } from "../logic/game";
import { countryPool } from "../logic/pool";
import { FlagImage } from "./FlagImage";

interface MenuScreenProps {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onStart: () => void;
}

const PARADE_CODES = ["ua", "jp", "br", "ca", "gb", "kr"];

export function MenuScreen({ settings, onChange, onStart }: MenuScreenProps) {
  const poolSize = countryPool(COUNTRIES, settings).length;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center gap-5 px-4 pt-6 sm:gap-6 sm:pt-8">
      <header className="flex flex-col items-center gap-4 text-center">
        <div className="flex gap-2 sm:gap-3" aria-hidden="true">
          {PARADE_CODES.map((code, place) => (
            <div
              key={code}
              style={{ animationDelay: `${place * 300}ms` }}
              className="w-10 animate-float sm:w-14"
            >
              <FlagImage code={code} alt="" className="rounded-md" />
            </div>
          ))}
        </div>
        <h1 className="bg-linear-to-r from-violet-600 via-fuchsia-500 to-amber-500 bg-clip-text text-5xl font-black text-transparent sm:text-6xl">
          Вгадай країну
        </h1>
        <p className="text-lg font-bold text-slate-600">Дивись на прапор і пиши, яка це країна!</p>
      </header>

      <Section title="Що вгадуємо?">
        <div className="grid w-full gap-3 sm:grid-cols-3">
          {MODES.map((mode) => (
            <Choice
              key={mode.value}
              selected={settings.mode === mode.value}
              onSelect={() => onChange({ ...settings, mode: mode.value })}
              className="justify-start gap-3 px-4 py-2 text-left sm:flex-col sm:justify-center sm:gap-1 sm:py-4 sm:text-center"
            >
              <span className="text-3xl sm:text-4xl">{mode.emoji}</span>
              <span className="flex flex-col">
                <span className="text-xl font-extrabold">{mode.title}</span>
                <span className="text-sm font-semibold">{mode.description}</span>
              </span>
            </Choice>
          ))}
        </div>
      </Section>

      <Section title="Де?">
        <div className="flex flex-wrap justify-center gap-2">
          {REGION_FILTERS.map((region) => (
            <Choice
              key={region.value}
              selected={settings.region === region.value}
              onSelect={() => onChange({ ...settings, region: region.value })}
              className="px-4 py-2"
            >
              <span>{region.emoji}</span>
              <span className="font-extrabold">{region.label}</span>
              <Count value={countryPool(COUNTRIES, { ...settings, region: region.value }).length} />
            </Choice>
          ))}
        </div>
      </Section>

      <Section title="Які країни?">
        <div className="flex flex-wrap justify-center gap-2">
          {COUNTRY_SETS.map((countrySet) => (
            <Choice
              key={countrySet.value}
              selected={settings.countrySet === countrySet.value}
              onSelect={() => onChange({ ...settings, countrySet: countrySet.value })}
              className="px-5 py-2"
            >
              <span>{countrySet.emoji}</span>
              <span className="font-extrabold">{countrySet.label}</span>
              <Count
                value={countryPool(COUNTRIES, { ...settings, countrySet: countrySet.value }).length}
              />
            </Choice>
          ))}
        </div>
      </Section>

      {/* Stays at the bottom of the screen on a phone, so it never hides below the settings. */}
      <div className="sticky bottom-0 -mx-4 flex w-[calc(100%+2rem)] justify-center bg-white/50 pt-3 pb-4 shadow-[0_-10px_30px_-20px_rgb(0_0_0/0.25)] backdrop-blur-md">
        <button
          type="button"
          onClick={onStart}
          disabled={poolSize === 0}
          className="rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-14 py-4 text-3xl font-black text-white shadow-xl shadow-violet-300 transition enabled:hover:scale-105 enabled:active:scale-95 disabled:opacity-50"
        >
          Грати! 🚀
        </button>
      </div>
    </main>
  );
}

function Count({ value }: { value: number }) {
  return <span className="rounded-full bg-black/10 px-2 text-sm font-bold">{value}</span>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex w-full flex-col items-center gap-3">
      <h2 className="text-xl font-extrabold text-violet-900">{title}</h2>
      {children}
    </section>
  );
}

function Choice({
  selected,
  onSelect,
  className,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  className: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex items-center justify-center gap-2 rounded-2xl border-2 border-b-4 transition hover:-translate-y-0.5 active:translate-y-0.5 ${
        selected
          ? "border-violet-700 bg-violet-500 text-white shadow-lg shadow-violet-200"
          : "border-violet-100 bg-white text-violet-900 shadow-sm hover:border-violet-300"
      } ${className}`}
    >
      {children}
    </button>
  );
}
