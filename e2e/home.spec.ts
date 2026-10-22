import { expect, test } from "@playwright/test";

test("the home page lists the games, and a game leads back home", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Граймося!");
  await expect(page.getByRole("heading", { name: "Граймося!" })).toBeVisible();

  await page.getByRole("link", { name: /Вгадай країну/ }).click();
  await expect(page).toHaveURL("/flags");
  await expect(page.getByRole("button", { name: /Грати/ })).toBeVisible();

  await page.getByRole("link", { name: "Усі ігри" }).click();
  await expect(page).toHaveURL("/");
  await page.goBack();
  await expect(page).toHaveURL("/flags");
  await expect(page.getByRole("button", { name: /Грати/ })).toBeVisible();
});

test("a game opens straight from its link", async ({ page }) => {
  await page.goto("/flags/");
  await expect(page).toHaveTitle("Вгадай країну · Граймося!");
  await expect(page.getByRole("button", { name: /Грати/ })).toBeVisible();
});
