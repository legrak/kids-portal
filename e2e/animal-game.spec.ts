import { expect, type Page, test } from "@playwright/test";
import { ANIMALS } from "../src/games/animals/data/animals";

const ANIMAL_IDS_BY_NAME = new Map(ANIMALS.map((animal) => [animal.name, animal.id]));

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

/** No voice, so the game plays the sound at once on any machine, as on one without a Ukrainian voice. */
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

/** The animal the game asks for, by its question. */
async function askedAnimal(page: Page): Promise<string> {
  const question = await page.getByRole("heading", { name: /^Де .+\?$/ }).textContent();
  const id = ANIMAL_IDS_BY_NAME.get(question?.match(/^Де (.+)\?$/)?.[1] ?? "");
  if (!id) throw new Error(`No animal for "${question}"`);
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

  const name = ANIMALS.find((animal) => animal.id === first)?.name;
  await expect(page.getByRole("heading", { name: `Це ${name}! 🎉` })).toBeVisible();
  await page.clock.runFor(3000);
  await expect(page.getByRole("heading", { name: /^Де .+\?$/ })).toBeVisible();
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
  await expect(page.getByRole("heading", { name: /^Де .+\?$/ })).toBeVisible();
  expect(await askedAnimal(page)).toBe(asked);
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
