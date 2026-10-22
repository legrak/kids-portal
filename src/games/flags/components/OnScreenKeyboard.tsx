import type { ReactNode } from "react";
import { KEYBOARD_ROWS, type KeyboardLanguage } from "../logic/keyboardLayouts";

interface OnScreenKeyboardProps {
  language: KeyboardLanguage;
  onKey: (char: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
}

/**
 * Letter keys for computers. Phones and tablets use their own keyboard, so it is hidden on touch
 * screens.
 */
export function OnScreenKeyboard({ language, onKey, onBackspace, onEnter }: OnScreenKeyboardProps) {
  return (
    <fieldset
      className="flex w-full min-w-0 flex-col gap-1.5 rounded-3xl bg-white/60 p-2 shadow-inner ring-1 ring-violet-100 select-none pointer-coarse:hidden"
      aria-label="Екранна клавіатура"
    >
      {KEYBOARD_ROWS[language].map((row) => (
        <div key={row.join("")} className="flex justify-center gap-1.5">
          {row.map((char) => (
            <Key key={char} label={char} onPress={() => onKey(char)}>
              {char}
            </Key>
          ))}
        </div>
      ))}
      <div className="flex justify-center gap-1.5">
        <Key label="дефіс" onPress={() => onKey("-")}>
          -
        </Key>
        <Key label="пробіл" onPress={() => onKey(" ")} wide>
          пробіл
        </Key>
        <Key label="стерти" onPress={onBackspace} wide tone="erase">
          ⌫
        </Key>
        <Key label="перевірити" onPress={onEnter} wide tone="enter">
          ✓
        </Key>
      </div>
    </fieldset>
  );
}

const TONES = {
  letter: "border-violet-200 bg-white text-violet-900 hover:bg-violet-50",
  erase: "border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-50",
  enter: "border-emerald-500 bg-emerald-400 text-white hover:bg-emerald-300",
};

function Key({
  label,
  onPress,
  children,
  wide = false,
  tone = "letter",
}: {
  label: string;
  onPress: () => void;
  children: ReactNode;
  wide?: boolean;
  tone?: keyof typeof TONES;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      // Keeps the focus in the answer field, so the physical keyboard goes on working.
      onPointerDown={(event) => event.preventDefault()}
      onClick={onPress}
      className={`h-12 min-w-0 rounded-xl border-2 border-b-4 text-xl font-extrabold uppercase shadow-sm transition active:translate-y-0.5 active:border-b-2 ${
        wide ? "max-w-40 flex-[2]" : "max-w-14 flex-1"
      } ${TONES[tone]}`}
    >
      {children}
    </button>
  );
}
