import { useEffect, useReducer, useState } from "react";
import { MenuScreen } from "./components/MenuScreen";
import { PlayScreen } from "./components/PlayScreen";
import { SummaryScreen } from "./components/SummaryScreen";
import { COUNTRIES } from "./data/countries";
import { gameReducer, initialGameState } from "./logic/game";
import { countryPool, shuffle } from "./logic/pool";
import { loadSettings, type StoredSettings, saveSettings } from "./settingsStorage";

/** "Guess the country by its flag": the menu, the rounds and their summaries. */
export function FlagGame() {
  const [settings, setSettings] = useState<StoredSettings>(loadSettings);
  const [state, dispatch] = useReducer(gameReducer, settings, initialGameState);

  useEffect(() => saveSettings(settings), [settings]);

  function startGame() {
    const deck = shuffle(countryPool(COUNTRIES, settings)).map((country) => country.code);
    dispatch({ type: "start", settings, deck });
  }

  if (state.screen === "playing" && state.turn) {
    return (
      <PlayScreen
        turn={state.turn}
        roundCodes={state.roundCodes}
        results={state.results}
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
      onChange={(changed) => setSettings({ ...settings, ...changed })}
      onStart={startGame}
    />
  );
}
