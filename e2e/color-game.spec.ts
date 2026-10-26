import { COLORS, type Color } from "../src/games/colors/data/colors";
import { expect, type Page, test } from "./fixtures";
import { BOTH_VOICES, recordSpeech, spoken } from "./voices";

async function startGame(page: Page, langs = BOTH_VOICES) {
  await recordSpeech(page, langs);
  await page.goto("/colors");
  await page.getByRole("button", { name: /Грати/ }).click();
}

const question = (page: Page) => page.getByRole("heading", { name: /^(Де .+|Where is .+)\?$/ });

/** The colour the game asks for, by its question in either language. */
async function askedColor(page: Page): Promise<Color> {
  const text = await question(page).textContent();
  const color = COLORS.find(
    (candidate) => text === `Де ${candidate.uk}?` || text === `Where is ${candidate.en}?`,
  );
  if (!color) throw new Error(`No colour for "${text}"`);
  return color;
}

function colorOf(id: string | null): Color {
  const color = COLORS.find((candidate) => candidate.id === id);
  if (!color) throw new Error(`No colour ${id}`);
  return color;
}

const balloons = (page: Page) => page.getByRole("button", { name: /^Кулька \d$/ });

test("the game asks aloud in Ukrainian and English, and the next four come by themselves", async ({
  page,
}) => {
  await page.clock.install();
  await startGame(page);
  await expect(balloons(page)).toHaveCount(4);
  const first = await askedColor(page);
  await expect(page.getByText(`Where is ${first.en}?`)).toBeVisible();
  expect(await spoken(page)).toEqual([`Де ${first.uk}?`, `Where is ${first.en}?`]);

  // A kid can tap a balloon while it is still flying in, so the tests don't wait for it to settle.
  await page.locator(`[data-color="${first.id}"]`).click({ force: true });

  await expect(page.getByRole("heading", { name: `Так, це ${first.uk}! 🎉` })).toBeVisible();
  await page.clock.runFor(1000);
  expect((await spoken(page)).slice(2)).toEqual([`Так, це ${first.uk}!`, `Yes, it's ${first.en}!`]);
  // The balloon has flown away, but the next question waits for the praise and a pause after it.
  await page.clock.runFor(1700);
  await expect(page.getByRole("heading", { name: `Так, це ${first.uk}! 🎉` })).toBeVisible();

  await page.clock.runFor(2500);
  await expect(question(page)).toBeVisible();
  const second = await askedColor(page);
  expect(second.id).not.toBe(first.id);
  expect((await spoken(page)).slice(4)).toEqual([`Де ${second.uk}?`, `Where is ${second.en}?`]);
  await expect(balloons(page)).toHaveCount(4);
});

test("without a Ukrainian voice the start screen says so, and the game asks in English", async ({
  page,
}) => {
  await recordSpeech(page, ["en-GB"]);
  await page.goto("/colors");
  await expect(page.getByRole("status")).toContainText(
    "немає українського голосу, тож гра питатиме лише англійською",
  );
  await page.getByRole("button", { name: /Грати/ }).click();
  const asked = await askedColor(page);

  expect(await spoken(page)).toEqual([`Where is ${asked.en}?`]);
});

test("voices that come late take the notice away", async ({ page }) => {
  await page.context().addInitScript(() => {
    const voices: SpeechSynthesisVoice[] = [];
    window.speechSynthesis.getVoices = () => voices;
    Object.assign(window, { voices });
  });
  await page.clock.install();
  await page.goto("/colors");

  // Longer than the start screen waits for the voices.
  await page.clock.runFor(2000);
  await expect(page.getByRole("status")).toContainText("немає ні українського, ні англійського");
  await page.evaluate(() => {
    const { voices } = window as unknown as { voices: SpeechSynthesisVoice[] };
    voices.push({ name: "Lesya", lang: "uk-UA" } as SpeechSynthesisVoice);
    voices.push({ name: "Daniel", lang: "en-GB" } as SpeechSynthesisVoice);
    window.speechSynthesis.dispatchEvent(new Event("voiceschanged"));
  });
  await expect(page.getByRole("status")).toHaveCount(0);
});

test("the game asks in the language picked, and remembers it", async ({ page }) => {
  await recordSpeech(page);
  await page.goto("/colors");
  await expect(page.getByRole("button", { name: "UA+ENG" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("status")).toHaveCount(0);

  await page.getByRole("button", { name: "ENG", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "ENG", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: /Грати/ }).click();
  const asked = await askedColor(page);
  await expect(page.getByRole("heading", { name: `Where is ${asked.en}?` })).toBeVisible();
  await expect(page.getByText(`Де ${asked.uk}?`)).toHaveCount(0);
  expect(await spoken(page)).toEqual([`Where is ${asked.en}?`]);

  await page.reload();
  await page.getByRole("button", { name: "UA", exact: true }).click();
  await page.getByRole("button", { name: /Грати/ }).click();
  const next = await askedColor(page);
  expect(await spoken(page)).toEqual([`Де ${next.uk}?`]);
});

test("leaving while the praise is said says nothing more", async ({ page }) => {
  await page.clock.install();
  await startGame(page);
  const asked = await askedColor(page);
  await page.locator(`[data-color="${asked.id}"]`).click({ force: true });
  // The balloon has flown away, the praise is still being said.
  await page.clock.runFor(2650);

  await page.getByRole("link", { name: "Усі ігри" }).click();
  await page.clock.runFor(5000);

  await expect(page).toHaveURL("/");
  expect(await spoken(page)).toHaveLength(4);
});

test("a wrong balloon shakes, and the game names its colour and asks again", async ({ page }) => {
  await startGame(page);
  const asked = await askedColor(page);
  const wrong = balloons(page)
    .and(page.locator(`:not([data-color="${asked.id}"])`))
    .first();
  const picked = colorOf(await wrong.getAttribute("data-color"));

  await wrong.click({ force: true });

  await expect(page.locator(".animate-shake")).toHaveCount(1);
  expect((await askedColor(page)).id).toBe(asked.id);
  expect(await spoken(page)).toEqual([
    `Де ${asked.uk}?`,
    `Where is ${asked.en}?`,
    `Це ${picked.uk}. Де ${asked.uk}?`,
    `That's ${picked.en}. Where is ${asked.en}?`,
  ]);
});

test("the home page leads to the colour game", async ({ page }) => {
  await page.route("https://upload.wikimedia.org/**", (route) => route.fulfill({ body: "" }));
  await page.goto("/");
  await page.getByRole("link", { name: /Знайди колір/ }).click();
  await expect(page).toHaveURL("/colors");
  await expect(page).toHaveTitle("Знайди колір · Граймося!");
  await expect(page.getByRole("button", { name: /Грати/ })).toBeVisible();
});
