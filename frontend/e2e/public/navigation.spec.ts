import { test, expect } from "@playwright/test";

test.describe("Public navigation", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("banner")).toBeVisible();
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveURL("/about");
    await expect(page.getByRole("banner")).toBeVisible();
  });

  test("menu page loads", async ({ page }) => {
    await page.goto("/menu");
    await expect(page).toHaveURL("/menu");
    await expect(page.getByRole("banner")).toBeVisible();
  });

  test("contact page loads", async ({ page }) => {
    await page.goto("/contact");
    await expect(page).toHaveURL("/contact");
    await expect(page.getByRole("banner")).toBeVisible();
  });

  test("navbar links navigate to correct pages", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /about/i }).first().click();
    await expect(page).toHaveURL("/about");

    await page.getByRole("link", { name: /menu/i }).first().click();
    await expect(page).toHaveURL("/menu");

    await page.getByRole("link", { name: /contact/i }).first().click();
    await expect(page).toHaveURL("/contact");
  });

  test("footer is visible on all public pages", async ({ page }) => {
    for (const path of ["/", "/about", "/menu", "/contact"]) {
      await page.goto(path);
      await expect(page.locator("footer")).toBeVisible();
    }
  });

  test("unknown route does not crash the app", async ({ page }) => {
    await page.goto("/this-does-not-exist");
    await expect(page).toHaveURL("/this-does-not-exist");
    await expect(page.locator("#root")).toBeAttached();
  });
});
