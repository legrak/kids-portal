import { useEffect, useState } from "react";
import { HomeButton } from "../../components/HomeButton";
import { celebrate } from "../../shared/celebrate";
import { type FindGame as Game, nextRound, pickChoice } from "../../shared/rounds";
import { playSound } from "../../shared/sound";
import { askAbout, playAnimalSound, preloadPhoto, stopAnimalSounds, unlockAudio } from "./audio";
import { AnimalCard } from "./components/AnimalCard";
import { StartScreen } from "./components/StartScreen";
import { ANIMALS, type Animal, animalById, CHOICE_COUNT } from "./data/animals";

/** How long the found animal stays on screen before the next three come. */
const NEXT_ROUND_AFTER_MS = 2600;

const ask = (animal: Animal) => askAbout(animal.name, animal.sound);

interface Play {
  current: Game;
  /** Made ahead, so its photos load while the current round is played. */
  next: Game;
}

const playFrom = (game: Game): Play => ({
  current: game,
  next: nextRound(ANIMALS, game, CHOICE_COUNT),
});

/** "Find the animal": three animal photos, and the game asks for one of them by its sound. */
export function AnimalGame() {
  const [play, setPlay] = useState<Play | null>(null);
  const [shakes, setShakes] = useState<Record<string, number>>({});

  // Silence when the kid leaves the game.
  useEffect(() => stopAnimalSounds, []);

  const next = play?.next;
  useEffect(() => {
    for (const id of next?.round.choices ?? []) preloadPhoto(animalById(id).photo.url);
  }, [next]);

  const found = play?.current.round.found ?? false;
  useEffect(() => {
    if (!found || !next) return;
    const timer = window.setTimeout(() => {
      setPlay(playFrom(next));
      setShakes({});
      ask(animalById(next.round.target));
    }, NEXT_ROUND_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [found, next]);

  function start() {
    // The tap on Play lets the game play sounds from now on.
    unlockAudio();
    const first = playFrom(nextRound(ANIMALS, null, CHOICE_COUNT));
    setPlay(first);
    ask(animalById(first.current.round.target));
  }

  if (!play) return <StartScreen onStart={start} />;

  const { round } = play.current;
  const target = animalById(round.target);

  function pick(id: string) {
    if (!play || round.found) return;
    const picked = pickChoice(round, id);
    if (picked.found) {
      stopAnimalSounds();
      playSound("correct");
      celebrate("answer");
    } else {
      setShakes({ ...shakes, [id]: (shakes[id] ?? 0) + 1 });
      playAnimalSound(target.sound);
    }
    setPlay({ ...play, current: { ...play.current, round: picked } });
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-6xl flex-col gap-3 px-4 pt-3 pb-4 sm:gap-5">
      <header className="flex items-center gap-3">
        <HomeButton />
        <h1
          aria-live="polite"
          className="min-w-0 flex-1 text-center text-[clamp(1.5rem,7vw,3rem)] leading-tight font-black text-violet-900"
        >
          <span key={`${round.target}-${round.found}`} className="inline-block animate-rise">
            {round.found ? `Це ${target.name}! 🎉` : `Де ${target.name}?`}
          </span>
        </h1>
        <button
          type="button"
          onClick={() => ask(target)}
          disabled={round.found}
          aria-label="Послухати ще раз"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-500 text-2xl text-white shadow-md transition enabled:hover:scale-110 enabled:active:scale-95 disabled:opacity-40"
        >
          🔊
        </button>
      </header>
      {/* In landscape no taller than the cards, so they stay by the question on a wide screen. */}
      <main className="grid min-h-0 flex-1 gap-3 portrait:grid-rows-3 landscape:max-h-[calc((min(100vw,72rem)-4.5rem)/4)] landscape:grid-cols-3 sm:gap-5">
        {round.choices.map((id, index) => (
          <AnimalCard
            key={`${round.target}-${id}`}
            animalId={id}
            photoUrl={animalById(id).photo.url}
            photoPosition={animalById(id).photo.position}
            place={index + 1}
            state={!round.found ? "asking" : id === round.target ? "found" : "notFound"}
            shakeKey={shakes[id] ?? 0}
            onPick={() => pick(id)}
            onListen={() => playAnimalSound(animalById(id).sound)}
          />
        ))}
      </main>
    </div>
  );
}
