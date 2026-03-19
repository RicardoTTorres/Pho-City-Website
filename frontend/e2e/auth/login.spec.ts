import { test, expect } from "@playwright/test";

test.describe("Admin login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/adminlogin");
  });

  test("renders the login form", async ({ page }) => {
    await expect(page.getByText("Pho City Admin")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your email")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /access admin dashboard/i })
    ).toBeVisible();
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.getByPlaceholder("Enter your email").fill("wrong@example.com");
    await page.getByPlaceholder("Enter your password").fill("wrongpassword");
    await page.getByRole("button", { name: /access admin dashboard/i }).click();

    await expect(
      page.locator("text=/login failed|network error|invalid/i")
    ).toBeVisible({ timeout: 10_000 });
  });

  test("shows error when fields are empty", async ({ page }) => {
    await page.getByRole("button", { name: /access admin dashboard/i }).click();
    await expect(page.locator(".text-red-600")).toBeVisible({ timeout: 10_000 });
  });

  test("toggles password visibility", async ({ page }) => {
    const passwordInput = page.getByPlaceholder("Enter your password");
    await passwordInput.fill("mypassword");

    await expect(passwordInput).toHaveAttribute("type", "password");
    await page.getByAltText("Toggle password visibility").click();
    await expect(passwordInput).toHaveAttribute("type", "text");
    await page.getByAltText("Toggle password visibility").click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("opens and closes the forgot password modal", async ({ page }) => {
    await page.getByRole("button", { name: /forgot password/i }).click();
    await expect(page.getByText("Reset Admin Password")).toBeVisible();

    await page.getByRole("button", { name: /close/i }).click();
    await expect(page.getByText("Reset Admin Password")).not.toBeVisible();
  });

  test("return to main site link navigates home", async ({ page }) => {
    await page.getByRole("link", { name: /return to main site/i }).click();
    await expect(page).toHaveURL("/");
  });
});
