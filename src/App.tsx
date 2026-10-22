import { type ReactNode, useEffect } from "react";
import { AnimalGame } from "./games/animals/AnimalGame";
import { FlagGame } from "./games/flags/FlagGame";
import { HomePage } from "./home/HomePage";
import { usePath } from "./router";

const SITE_TITLE = "Граймося!";

const PAGES: Record<string, { title: string; render: () => ReactNode }> = {
  "/flags": { title: "Вгадай країну", render: () => <FlagGame /> },
  "/animals": { title: "Знайди тварину", render: () => <AnimalGame /> },
};

export function App() {
  const path = usePath();
  // Any other path shows the home page.
  const page = PAGES[path];

  useEffect(() => {
    document.title = page ? `${page.title} · ${SITE_TITLE}` : SITE_TITLE;
  }, [page]);

  return page ? page.render() : <HomePage />;
}
