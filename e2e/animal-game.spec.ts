import { ANIMALS, animalById } from "../src/games/animals/data/animals";
import { expect, type Page, test } from "./fixtures";
import { recordSpeech, spoken } from "./voices";

const ANIMAL_IDS_BY_QUESTION = new Map(
  ANIMALS.flatMap((animal) => [
    [`Де ${animal.uk}?`, animal.id],
    [`Where is the ${animal.en}?`, animal.id],
  ]),
);

const question = (page: Page) => page.getByRole("heading", { name: /^(Де .+|Where is the .+)\?$/ });

/** The photos and sounds are links to Wikimedia; the tests answer for it, so they run offline. */
async function serveMediaLocally(page: Page) {
  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  await page.route("https://upload.wikimedia.org/**", (route) =>
    route.request().resourceType() === "image"
      ? route.fulfill({ contentType: "image/png", body: pixel })
      : route.fulfill({ contentType: "audio/mpeg", body: "" }),
  );
}

/** No voice, so the game plays the sound at once on any machine, as on a device without voices. */
async function withoutVoices(page: Page) {
  await page.addInitScript(() => {
    window.speechSynthesis.getVoices = () => [];
  });
}

async function startGame(page: Page) {
  await withoutVoices(page);
  await serveMediaLocally(page);
  await page.goto("/animals");
  await page.getByRole("button", { name: /Грати/ }).click();
}

/** The animal the game asks for, by its question in either language. */
async function askedAnimal(page: Page): Promise<string> {
  const text = await question(page).textContent();
  const id = ANIMAL_IDS_BY_QUESTION.get(text ?? "");
  if (!id) throw new Error(`No animal for "${text}"`);
  return id;
}

const cards = (page: Page) => page.getByRole("button", { name: /^Тварина \d$/ });

test("the kid finds the animal, and the next three come by themselves", async ({ page }) => {
  await page.clock.install();
  await startGame(page);
  await expect(cards(page)).toHaveCount(3);
  const first = await askedAnimal(page);

  // A kid can tap a card while it is still flying in, so the tests don't wait for it to settle.
  await page.locator(`[data-animal="${first}"]`).click({ force: true });

  await expect(page.getByRole("heading", { name: `Це ${animalById(first).uk}! 🎉` })).toBeVisible();
  await page.clock.runFor(3000);
  await expect(question(page)).toBeVisible();
  expect(await askedAnimal(page)).not.toBe(first);
  await expect(cards(page)).toHaveCount(3);
});

test("a wrong animal shakes, and the game keeps asking", async ({ page }) => {
  await startGame(page);
  const asked = await askedAnimal(page);
  const wrong = cards(page)
    .and(page.locator(`:not([data-animal="${asked}"])`))
    .first();

  await wrong.click({ force: true });

  await expect(page.locator(".animate-shake")).toHaveCount(1);
  await expect(question(page)).toBeVisible();
  expect(await askedAnimal(page)).toBe(asked);
});

test("the game asks in Ukrainian and English, or in the language picked", async ({ page }) => {
  await recordSpeech(page);
  await serveMediaLocally(page);
  await page.goto("/animals");
  await page.getByRole("button", { name: /Грати/ }).click();
  const first = animalById(await askedAnimal(page));
  await expect(page.getByText(`Where is the ${first.en}?`)).toBeVisible();
  expect(await spoken(page)).toEqual([`Де ${first.uk}?`, `Where is the ${first.en}?`]);

  await page.reload();
  await page.getByRole("button", { name: "ENG", exact: true }).click();
  await page.getByRole("button", { name: /Грати/ }).click();
  const next = animalById(await askedAnimal(page));
  await expect(page.getByRole("heading", { name: `Where is the ${next.en}?` })).toBeVisible();
  expect(await spoken(page)).toEqual([`Where is the ${next.en}?`]);
});

/** Writes down the sources the page plays instead of playing them. */
async function recordPlayback(page: Page) {
  await page.context().addInitScript(() => {
    const played: string[] = [];
    Object.assign(window, { played });
    HTMLMediaElement.prototype.play = function () {
      played.push(this.src);
      return Promise.resolve();
    };
  });
}

const playedAnimal = async (page: Page, id: string) => {
  const played = await page.evaluate(() => (window as unknown as { played: string[] }).played);
  return played.some((src) => src.startsWith(animalById(id).sound.url));
};

test("the animal's sound plays once the question is said in both languages", async ({ page }) => {
  await page.clock.install();
  await recordSpeech(page);
  await recordPlayback(page);
  await serveMediaLocally(page);
  await page.goto("/animals");
  await page.getByRole("button", { name: /Грати/ }).click();
  const asked = await askedAnimal(page);

  // Each phrase takes 2 s.
  await page.clock.runFor(3000);
  expect(await playedAnimal(page, asked)).toBe(false);
  await page.clock.runFor(1500);
  expect(await playedAnimal(page, asked)).toBe(true);
});

test("a card's sound tapped during the question takes the place of the asked one", async ({
  page,
}) => {
  await page.clock.install();
  await recordSpeech(page);
  await recordPlayback(page);
  await serveMediaLocally(page);
  await page.goto("/animals");
  await page.getByRole("button", { name: /Грати/ }).click();
  const asked = await askedAnimal(page);
  const other = await cards(page)
    .and(page.locator(`:not([data-animal="${asked}"])`))
    .first()
    .getAttribute("data-animal");
  const label = await page.locator(`[data-animal="${other}"]`).getAttribute("aria-label");
  const place = label?.match(/\d/)?.[0];

  await page.getByRole("button", { name: `Послухати тварину ${place}` }).click();
  await page.clock.runFor(6000);

  expect(await playedAnimal(page, other ?? "")).toBe(true);
  expect(await playedAnimal(page, asked)).toBe(false);
});

test("the start screen credits the photos and sounds", async ({ page }) => {
  await serveMediaLocally(page);
  await page.goto("/animals");
  await page.getByText("Звідки фото і звуки").click();
  await expect(page.getByRole("listitem")).toHaveCount(ANIMALS.length);
});

test("the home page leads to the animal game", async ({ page }) => {
  await serveMediaLocally(page);
  await page.goto("/");
  await page.getByRole("link", { name: /Знайди тварину/ }).click();
  await expect(page).toHaveURL("/animals");
  await expect(page.getByRole("button", { name: /Грати/ })).toBeVisible();
});
