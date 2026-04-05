import { test, expect } from "@playwright/test";


test.describe("Forgot password modal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/adminlogin");
    await page.getByRole("button", { name: /forgot password/i }).click();
    await expect(page.getByText("Reset Admin Password")).toBeVisible();
  });

  test("closes when the × button is clicked", async ({ page }) => {
    await page.getByRole("button", { name: /close/i }).click();
    await expect(page.getByText("Reset Admin Password")).not.toBeVisible();
  });


  test("step 1 — renders email field and Send Reset Code button", async ({
    page,
  }) => {
    await expect(page.getByPlaceholder("admin@example.com")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /send reset code/i }),
    ).toBeVisible();
  });

  test("step 1 — advances to step 2 on successful API response", async ({
    page,
  }) => {
   
    await page.route(/\/api\/auth\/forgot-password/, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
    );

    await page.getByPlaceholder("admin@example.com").fill("admin@pho-city.com");
    await page.getByRole("button", { name: /send reset code/i }).click();

    await expect(page.getByPlaceholder("123456")).toBeVisible({ timeout: 8_000 });
    await expect(
      page.getByRole("button", { name: /reset password/i }),
    ).toBeVisible();
  });

  test("step 1 — shows API error when the request fails", async ({ page }) => {
    await page.route(/\/api\/auth\/forgot-password/, (route) =>
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "Email not found" }),
      }),
    );

    await page.getByPlaceholder("admin@example.com").fill("unknown@example.com");
    await page.getByRole("button", { name: /send reset code/i }).click();

    await expect(page.getByText("Email not found")).toBeVisible({
      timeout: 8_000,
    });
  });



  test("step 2 — shows mismatch error without calling API", async ({
    page,
  }) => {
    await page.route(/\/api\/auth\/forgot-password/, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
    );
    await page.getByPlaceholder("admin@example.com").fill("admin@pho-city.com");
    await page.getByRole("button", { name: /send reset code/i }).click();
    await expect(page.getByPlaceholder("123456")).toBeVisible({ timeout: 8_000 });


    await page.getByPlaceholder("123456").fill("123456");
    const modal = page.locator("div.fixed.inset-0");
    await modal.locator('input[type="password"]').nth(0).fill("newpass1");
    await modal.locator('input[type="password"]').nth(1).fill("newpass2");

    await page.getByRole("button", { name: /reset password/i }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });

  test("step 2 — shows success state on valid submission", async ({ page }) => {
    await page.route(/\/api\/auth\/forgot-password/, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
    );
    await page.route(/\/api\/auth\/reset-password/, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "ok" }),
      }),
    );

    await page.getByPlaceholder("admin@example.com").fill("admin@pho-city.com");
    await page.getByRole("button", { name: /send reset code/i }).click();
    await expect(page.getByPlaceholder("123456")).toBeVisible({ timeout: 8_000 });

    await page.getByPlaceholder("123456").fill("654321");
    const modal = page.locator("div.fixed.inset-0");
    await modal.locator('input[type="password"]').nth(0).fill("newStrongPass1");
    await modal.locator('input[type="password"]').nth(1).fill("newStrongPass1");

    await page.getByRole("button", { name: /reset password/i }).click();

    await expect(page.getByText("Password reset successfully!")).toBeVisible({
      timeout: 8_000,
    });
  });

  test("step 2 — 'Use a different email' returns to step 1", async ({
    page,
  }) => {
    await page.route(/\/api\/auth\/forgot-password/, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
    );
    await page.getByPlaceholder("admin@example.com").fill("admin@pho-city.com");
    await page.getByRole("button", { name: /send reset code/i }).click();
    await expect(page.getByPlaceholder("123456")).toBeVisible({ timeout: 8_000 });

    await page.getByRole("button", { name: /use a different email/i }).click();

    await expect(page.getByPlaceholder("admin@example.com")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /send reset code/i }),
    ).toBeVisible();
  });

  test("step 2 — shows API error when reset-password fails", async ({
    page,
  }) => {
    await page.route(/\/api\/auth\/forgot-password/, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
    );
    await page.route(/\/api\/auth\/reset-password/, (route) =>
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "Invalid or expired code" }),
      }),
    );

    await page.getByPlaceholder("admin@example.com").fill("admin@pho-city.com");
    await page.getByRole("button", { name: /send reset code/i }).click();
    await expect(page.getByPlaceholder("123456")).toBeVisible({ timeout: 8_000 });

    await page.getByPlaceholder("123456").fill("000000");
    const modal = page.locator("div.fixed.inset-0");
    await modal.locator('input[type="password"]').nth(0).fill("newpass123");
    await modal.locator('input[type="password"]').nth(1).fill("newpass123");

    await page.getByRole("button", { name: /reset password/i }).click();

    await expect(page.getByText("Invalid or expired code")).toBeVisible({
      timeout: 8_000,
    });
  });

  test("success screen — 'Back to Login' button closes the modal", async ({
    page,
  }) => {
    await page.route(/\/api\/auth\/forgot-password/, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
    );
    await page.route(/\/api\/auth\/reset-password/, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "ok" }),
      }),
    );

    await page.getByPlaceholder("admin@example.com").fill("admin@pho-city.com");
    await page.getByRole("button", { name: /send reset code/i }).click();
    await expect(page.getByPlaceholder("123456")).toBeVisible({ timeout: 8_000 });

    await page.getByPlaceholder("123456").fill("654321");
    const modal = page.locator("div.fixed.inset-0");
    await modal.locator('input[type="password"]').nth(0).fill("newStrongPass1");
    await modal.locator('input[type="password"]').nth(1).fill("newStrongPass1");
    await page.getByRole("button", { name: /reset password/i }).click();
    await expect(page.getByText("Password reset successfully!")).toBeVisible({
      timeout: 8_000,
    });

    await page.getByRole("button", { name: /back to login/i }).click();
    await expect(page.getByText("Reset Admin Password")).not.toBeVisible();
  });
});
