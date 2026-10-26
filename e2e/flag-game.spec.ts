import { COUNTRIES, type Country } from "../src/games/flags/data/countries";
import { REGION_NAMES } from "../src/games/flags/labels";
import { expect, type Page, test } from "./fixtures";

const COUNTRIES_BY_CODE = new Map(COUNTRIES.map((country) => [country.code, country]));

async function startGame(page: Page, modeTitle?: string) {
  await page.goto("/flags");
  if (modeTitle) await page.getByRole("button", { name: new RegExp(modeTitle) }).click();
  await page.getByRole("button", { name: /Грати/ }).click();
}

/** The country whose flag is being asked about. */
async function askedCountry(page: Page): Promise<Country> {
  const code = await page
    .getByRole("img", { name: "Прапор — вгадай країну" })
    .getAttribute("data-country");
  const country = code && COUNTRIES_BY_CODE.get(code);
  if (!country) throw new Error(`No country for flag ${code}`);
  return country;
}

const answerField = (page: Page) => page.getByRole("textbox", { name: /Відповідь/ });

/**
 * Stands in for the visual viewport, the part of the page in view, which a real phone keyboard
 * shrinks; a browser in a test has no such keyboard.
 */
async function fakeDeviceKeyboard(page: Page) {
  await page.addInitScript(() => {
    const viewport = Object.assign(new EventTarget(), {
      offsetTop: 0,
      height: window.innerHeight,
      scale: 1,
    });
    Object.defineProperty(window, "visualViewport", { value: viewport });
    window.addEventListener("device-keyboard", (event) => {
      viewport.height = window.innerHeight - (event as CustomEvent<number>).detail;
      viewport.dispatchEvent(new Event("resize"));
    });
  });
}

/** Opens the fake device keyboard at this height, or closes it with 0. */
async function showDeviceKeyboard(page: Page, height: number) {
  await page.evaluate((detail) => {
    window.dispatchEvent(new CustomEvent("device-keyboard", { detail }));
  }, height);
}

async function answer(page: Page, text: string) {
  await answerField(page).fill(text);
  await answerField(page).press("Enter");
}

test("a kid names the flag, gets three stars and the next flag comes by itself", async ({
  page,
}) => {
  await startGame(page);
  const country = await askedCountry(page);

  await answer(page, country.uk.name.toLowerCase());

  const result = page.getByRole("status");
  await expect(result).toContainText(country.uk.name);
  await expect(result.getByRole("img", { name: "3 з 3 зірок" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Прапор — вгадай країну" })).not.toHaveAttribute(
    "data-country",
    country.code,
    { timeout: 5000 },
  );
});

test("hints show where the country is, then the letter slots, then letters", async ({ page }) => {
  await startGame(page);
  const country = await askedCountry(page);

  await page.getByRole("button", { name: /Де ця країна/ }).click();
  await expect(page.getByText(`📍 ${REGION_NAMES[country.region]}`)).toBeVisible();
  await expect(page.getByRole("button", { name: "Наблизити карту" })).toBeVisible();

  await page.getByRole("button", { name: /Скільки букв/ }).click();
  await page.getByRole("button", { name: /Перша буква/ }).click();
  await expect(page.getByRole("button", { name: /Ще одна буква/ })).toBeVisible();

  const lettersAfterFirst = Array.from(country.uk.name)
    .filter((char) => /\p{L}/u.test(char))
    .slice(1)
    .join("");
  await answerField(page).fill(lettersAfterFirst);

  await expect(page.getByRole("status").getByRole("img", { name: "1 з 3 зірок" })).toBeVisible();
});

test("a wrong answer names the other country, and the kid can try again", async ({ page }) => {
  await startGame(page);
  const country = await askedCountry(page);
  const other = country.code === "ua" ? "Польща" : "Україна";

  await answer(page, other);
  await expect(page.getByText(`Ні, це не ${other}. Спробуй ще!`)).toBeVisible();

  await answer(page, country.uk.name);
  await expect(page.getByRole("status")).toContainText(country.uk.name);
});

test("giving up shows the answer, and ten flags make a round with a summary", async ({ page }) => {
  await startGame(page);
  const firstRound: string[] = [];
  for (let flag = 0; flag < 10; flag++) {
    const country = await askedCountry(page);
    firstRound.push(country.code);
    await page.getByRole("button", { name: /Не знаю/ }).click();
    await expect(page.getByRole("status")).toContainText(country.uk.name);
    await page.getByRole("button", { name: "Далі →" }).click();
  }

  await expect(page.getByRole("heading", { name: "Гарна спроба!" })).toBeVisible();
  await expect(page.getByRole("button", { name: "🔁 Повторити складні (10)" })).toBeVisible();

  await page.getByRole("button", { name: /Ще 10 прапорів/ }).click();
  expect(firstRound).not.toContain((await askedCountry(page)).code);
});

test("the easy level offers four names, and a wrong pick costs a star", async ({ page }) => {
  await startGame(page, "Легко");
  const country = await askedCountry(page);
  const choices = page.getByRole("group", { name: "Вибери країну" });

  const names = await choices.getByRole("button").allTextContents();
  expect(names).toHaveLength(4);
  expect(new Set(names).size).toBe(4);
  expect(names).toContain(country.uk.name);
  await expect(answerField(page)).toHaveCount(0);

  const wrong = names.find((name) => name !== country.uk.name) as string;
  await choices.getByRole("button", { name: wrong, exact: true }).click();
  await expect(page.getByText(`Ні, це не ${wrong}. Спробуй ще!`)).toBeVisible();
  await expect(choices.getByRole("button", { name: wrong, exact: true })).toBeDisabled();

  await choices.getByRole("button", { name: country.uk.name, exact: true }).click();
  const result = page.getByRole("status");
  await expect(result).toContainText(country.uk.name);
  await expect(result.getByRole("img", { name: "2 з 3 зірок" })).toBeVisible();
});

test("the capital level asks for the capital after the country", async ({ page }) => {
  await startGame(page, "Країна і столиця");
  const country = await askedCountry(page);

  await answer(page, country.uk.name);
  await expect(page.getByRole("heading", { name: "А яка столиця?" })).toBeVisible();

  await answer(page, country.uk.capital);
  await expect(page.getByRole("status")).toContainText(`Столиця — ${country.uk.capital}`);
});

test("the English level wants the English name", async ({ page }) => {
  await startGame(page, "English");
  const country = await askedCountry(page);

  await answer(page, country.uk.name);
  await expect(page.getByText("Не зовсім. Спробуй ще! 💪")).toBeVisible();

  await answer(page, country.en.name);
  await expect(page.getByRole("status")).toContainText(country.en.name);
});

test("the chosen settings are remembered after a reload", async ({ page }) => {
  await page.goto("/flags");
  await page.getByRole("button", { name: /English/ }).click();
  await page.getByRole("button", { name: /Європа/ }).click();
  await page.getByRole("button", { name: /Відомі/ }).click();

  await page.reload();

  for (const name of [/English/, /Європа/, /Відомі/]) {
    await expect(page.getByRole("button", { name })).toHaveAttribute("aria-pressed", "true");
  }
});

test.describe("keyboards", () => {
  test("a computer gets the on-screen keyboard, and keys type Ukrainian on any layout", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "only computers get the on-screen keyboard");
    await startGame(page);
    const keyboard = page.getByRole("group", { name: "Екранна клавіатура" });

    await keyboard.getByRole("button", { name: "ф", exact: true }).click();
    await keyboard.getByRole("button", { name: "ї", exact: true }).click();
    await expect(answerField(page)).toHaveValue("фї");

    await keyboard.getByRole("button", { name: "стерти" }).click();
    // The physical keys of an English layout, by position: A S D → ф і в.
    await page.keyboard.press("KeyS");
    await page.keyboard.press("KeyD");
    await expect(answerField(page)).toHaveValue("фів");
  });

  test("phones and tablets use their own keyboard, closed while the result shows", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "desktop", "computers get the on-screen keyboard");
    await startGame(page);
    const country = await askedCountry(page);

    await expect(page.getByRole("group", { name: "Екранна клавіатура" })).toBeHidden();
    await expect(answerField(page)).not.toBeFocused();
    await answerField(page).tap();
    await expect(answerField(page)).toBeFocused();

    await answer(page, country.uk.name);
    await expect(page.getByRole("status")).toContainText(country.uk.name);
    await expect(answerField(page)).not.toBeFocused();
  });

  test("while the kid types on a phone or tablet, the flag stays in view above its keyboard", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "desktop", "computers get the on-screen keyboard");
    await fakeDeviceKeyboard(page);
    await startGame(page);
    const screenHeight = page.viewportSize()?.height ?? 0;
    const menu = page.getByRole("button", { name: "Меню" });

    await answerField(page).tap();
    // The device keyboard takes about half of the screen.
    const inView = Math.round(screenHeight / 2);
    await showDeviceKeyboard(page, screenHeight - inView);
    await expect(menu).toBeHidden();
    const flag = page.getByRole("img", { name: "Прапор — вгадай країну" });
    for (const part of [flag, answerField(page), page.getByRole("button", { name: /Не знаю/ })]) {
      const box = await part.boundingBox();
      expect(box?.y).toBeGreaterThanOrEqual(0);
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(inView);
    }
    // Big enough to tell the flag.
    expect((await flag.boundingBox())?.height).toBeGreaterThan(inView / 3);

    // Android's Back hides the keyboard and leaves the field focused.
    await showDeviceKeyboard(page, 0);
    await expect(menu).toBeVisible();
    await expect(answerField(page)).toBeFocused();
  });
});
