import type { ReactNode } from "react";
import { FlagImage } from "../games/flags/components/FlagImage";
import { followLink } from "../router";

interface GameCard {
  path: string;
  title: string;
  description: string;
  /** The age the game suits, as "6+". */
  age: string;
  picture: ReactNode;
  /** Tailwind gradient colours behind the picture. */
  colors: string;
}

const GAMES: GameCard[] = [
  {
    path: "/flags",
    title: "Вгадай країну",
    description: "Дивись на прапор і пиши, яка це країна.",
    age: "6+",
    picture: <FlagFan />,
    colors: "from-sky-300 via-violet-300 to-fuchsia-300",
  },
];

/** The list of games. */
export function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col items-center gap-8 px-4 py-8 sm:gap-10 sm:py-12">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="bg-linear-to-r from-violet-600 via-fuchsia-500 to-amber-500 bg-clip-text text-6xl font-black text-transparent sm:text-7xl">
          Граймося!
        </h1>
        <p className="text-xl font-bold text-slate-600">Вибирай гру 👇</p>
      </header>
      {/* Two cards a row from tablets up, an odd last one in the middle. */}
      <ul className="flex w-full flex-wrap justify-center gap-5 sm:gap-6">
        {GAMES.map((game) => (
          <li key={game.path} className="w-full sm:w-[calc(50%-0.75rem)]">
            <a
              href={game.path}
              onClick={followLink}
              className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-violet-100 transition hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98]"
            >
              <div
                className={`relative flex h-44 items-center justify-center overflow-hidden bg-linear-to-br sm:h-52 ${game.colors}`}
              >
                {game.picture}
                <span className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-lg font-black text-violet-700 shadow-sm">
                  <span className="sr-only">Вік: </span>
                  {game.age}
                </span>
              </div>
              <div className="flex flex-1 items-center justify-between gap-3 p-5">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-extrabold text-violet-900">{game.title}</h2>
                  <p className="font-semibold text-balance text-slate-600">{game.description}</p>
                </div>
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-500 text-2xl text-white shadow-md transition group-hover:scale-110"
                >
                  ▶
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}

/** Three flags fanned out like cards. */
function FlagFan() {
  const flags = [
    { code: "jp", tilt: "-rotate-12 translate-y-3" },
    { code: "ua", tilt: "z-10 scale-110" },
    { code: "br", tilt: "rotate-12 translate-y-3" },
  ];
  return (
    <div
      className="flex items-center -space-x-4 transition group-hover:scale-105"
      aria-hidden="true"
    >
      {flags.map(({ code, tilt }) => (
        <div key={code} className={`w-24 rounded-xl bg-white p-1.5 shadow-lg sm:w-28 ${tilt}`}>
          <FlagImage code={code} alt="" className="rounded-md" />
        </div>
      ))}
    </div>
  );
}
