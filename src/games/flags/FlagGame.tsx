import { useEffect, useReducer, useRef, useState } from "react";
import { celebrate } from "./celebrate";
import { MenuScreen } from "./components/MenuScreen";
import { PlayScreen } from "./components/PlayScreen";
import { SummaryScreen } from "./components/SummaryScreen";
import { loadWorldShapes } from "./components/worldShapes";
import { COUNTRIES } from "./data/countries";
import { feedbackFor } from "./feedback";
import { type GameState, gameReducer, initialGameState } from "./logic/game";
import { countryPool, shuffle } from "./logic/pool";
import { loadSettings, type StoredSettings, saveSettings } from "./settingsStorage";
import { playSound } from "./sound";

/** "Guess the country by its flag": the menu, the rounds and their summaries. */
export function FlagGame() {
  const [settings, setSettings] = useState<StoredSettings>(loadSettings);
  const [state, dispatch] = useReducer(gameReducer, settings, initialGameState);

  useEffect(() => saveSettings(settings), [settings]);
  useSoundsAndConfetti(state, settings.muted);

  function startGame() {
    const deck = shuffle(countryPool(COUNTRIES, settings)).map((country) => country.code);
    dispatch({ type: "start", settings, deck });
    // The map is only needed for a hint, but loading it now makes the hint instant.
    void loadWorldShapes();
  }

  const toggleMute = () => setSettings({ ...settings, muted: !settings.muted });

  if (state.screen === "playing" && state.turn) {
    return (
      <PlayScreen
        turn={state.turn}
        roundCodes={state.roundCodes}
        results={state.results}
        muted={settings.muted}
        onToggleMute={toggleMute}
        dispatch={dispatch}
      />
    );
  }

  if (state.screen === "summary") {
    return (
      <SummaryScreen
        mode={state.settings.mode}
        results={state.results}
        upcomingCount={state.upcoming.length}
        onNextRound={() => dispatch({ type: "nextRound" })}
        onReplay={(codes) => dispatch({ type: "replay", deck: shuffle(codes) })}
        onMenu={() => dispatch({ type: "openMenu" })}
      />
    );
  }

  return (
    <MenuScreen
      settings={settings}
      muted={settings.muted}
      onToggleMute={toggleMute}
      onChange={(changed) => setSettings({ ...settings, ...changed })}
      onStart={startGame}
    />
  );
}

/** Plays a sound and throws confetti when the game state changes in a way worth celebrating. */
function useSoundsAndConfetti(state: GameState, muted: boolean) {
  const previous = useRef(state);
  useEffect(() => {
    const before = previous.current;
    previous.current = state;
    const { sound, confetti } = feedbackFor(before, state);
    if (sound && !muted) playSound(sound);
    if (confetti) celebrate(confetti);
  }, [state, muted]);
}
