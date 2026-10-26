import { categoryById, type Thing, thingById } from "../src/games/odd-one-out/data/things";
import { explanationFor, wrongPickFor } from "../src/games/odd-one-out/speech";
import { expect, type Page, test } from "./fixtures";
import { BOTH_VOICES, recordSpeech, spoken } from "./voices";

async function startGame(page: Page, langs = BOTH_VOICES) {
  await recordSpeech(page, langs);
  await page.goto("/odd-one-out");
  await page.getByRole("button", { name: /Грати/ }).click();
}

const cards = (page: Page) => page.getByRole("button", { name: /^Картинка \d$/ });

/** The things on the cards: the odd one, and the three of one category. */
async function shownThings(page: Page): Promise<{ odd: Thing; group: Thing[] }> {
  const ids = await cards(page).evaluateAll((buttons) =>
    buttons.map((button) => button.getAttribute("data-thing") ?? ""),
  );
  const things = ids.map(thingById);
  const odd = things.find(
    (thing) => things.filter((other) => other.category === thing.category).length === 1,
  );
  if (!odd || things.length !== 4) throw new Error(`No odd one among ${ids.join(", ")}`);
  return { odd, group: things.filter((thing) => thing !== odd) };
}

const card = (page: Page, thing: Thing) => page.locator(`[data-thing="${thing.id}"]`);

/** What the game says once the odd one is found, in Ukrainian and English. */
const explanation = (group: Thing[], odd: Thing) =>
  explanationFor(categoryById(group[0]?.category ?? ""), odd, "both").map((phrase) => phrase.text);

test("the kid finds the odd one, hears why, and the next four come by themselves", async ({
  page,
}) => {
  await page.clock.install();
  await startGame(page);
  await expect(cards(page)).toHaveCount(4);
  await expect(page.getByRole("heading", { name: "Що тут зайве?" })).toBeVisible();
  await expect(page.getByText("Which one doesn't belong?")).toBeVisible();
  expect(await spoken(page)).toEqual(["Що тут зайве?", "Which one doesn't belong?"]);
  const { odd, group } = await shownThings(page);

  // A kid can tap a card while it is still flying in, so the tests don't wait for it to settle.
  await card(page, odd).click({ force: true });

  const [uk, en] = explanation(group, odd);
  await expect(page.getByRole("heading", { name: `${uk} 🎉` })).toBeVisible();
  await page.clock.runFor(1000);
  expect((await spoken(page)).slice(2)).toEqual([uk, en]);
  // The explanation takes 4 s, and the next question waits for it and a pause after it.
  await page.clock.runFor(3500);
  await expect(page.getByRole("heading", { name: `${uk} 🎉` })).toBeVisible();

  await page.clock.runFor(1500);
  await expect(page.getByRole("heading", { name: "Що тут зайве?" })).toBeVisible();
  await expect(cards(page)).toHaveCount(4);
  expect((await spoken(page)).slice(4)).toEqual(["Що тут зайве?", "Which one doesn't belong?"]);
  const next = await shownThings(page);
  expect(next.group[0]?.category).not.toBe(group[0]?.category);
});

test("a wrong picture shakes, and the game names it and asks again", async ({ page }) => {
  await startGame(page);
  const { group } = await shownThings(page);
  const wrong = group[0] as Thing;

  await card(page, wrong).click({ force: true });

  await expect(page.locator(".animate-shake")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Що тут зайве?" })).toBeVisible();
  expect((await spoken(page)).slice(2)).toEqual(
    wrongPickFor(wrong, "both").map((phrase) => phrase.text),
  );
});

test("the game asks in the language picked", async ({ page }) => {
  await recordSpeech(page);
  await page.goto("/odd-one-out");
  await page.getByRole("button", { name: "ENG", exact: true }).click();
  await page.getByRole("button", { name: /Грати/ }).click();

  await expect(page.getByRole("heading", { name: "Which one doesn't belong?" })).toBeVisible();
  await expect(page.getByText("Що тут зайве?")).toHaveCount(0);
  expect(await spoken(page)).toEqual(["Which one doesn't belong?"]);
});

test("leaving while the explanation is said says nothing more", async ({ page }) => {
  await page.clock.install();
  await startGame(page);
  const { odd } = await shownThings(page);
  await card(page, odd).click({ force: true });
  // The pictures have been shown long enough, the explanation is still being said.
  await page.clock.runFor(2650);

  await page.getByRole("link", { name: "Усі ігри" }).click();
  await page.clock.runFor(8000);

  await expect(page).toHaveURL("/");
  expect(await spoken(page)).toHaveLength(4);
});

test("the home page leads to the game", async ({ page }) => {
  await page.route("https://upload.wikimedia.org/**", (route) => route.fulfill({ body: "" }));
  await page.goto("/");
  await page.getByRole("link", { name: /Знайди зайве/ }).click();
  await expect(page).toHaveURL("/odd-one-out");
  await expect(page).toHaveTitle("Знайди зайве · Граймося!");
  await expect(page.getByRole("button", { name: /Грати/ })).toBeVisible();
});
