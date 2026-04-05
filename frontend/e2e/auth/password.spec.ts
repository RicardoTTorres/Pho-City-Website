import { test, expect } from "@playwright/test";


test.describe("Password logic on admin login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/adminlogin");
  });



  test("password field starts as type=password", async ({ page }) => {
    await expect(page.getByPlaceholder("Enter your password")).toHaveAttribute(
      "type",
      "password",
    );
  });

  test("clicking the toggle icon reveals the password", async ({ page }) => {
    const input = page.getByPlaceholder("Enter your password");
    await input.fill("secret123");

    await page.getByAltText("Toggle password visibility").click();
    await expect(input).toHaveAttribute("type", "text");
  });

  test("clicking the toggle icon again hides the password", async ({ page }) => {
    const input = page.getByPlaceholder("Enter your password");
    await input.fill("secret123");

    const toggle = page.getByAltText("Toggle password visibility");
    await toggle.click();
    await toggle.click();
    await expect(input).toHaveAttribute("type", "password");
  });

  test("typed text is masked before toggling", async ({ page }) => {
    const input = page.getByPlaceholder("Enter your password");
    await input.fill("mysecret");

    await expect(input).toHaveAttribute("type", "password");

    await expect(input).toHaveValue("mysecret");
  });



  test("pressing Enter on the email field triggers a login attempt", async ({
    page,
  }) => {
    await page.getByPlaceholder("Enter your email").fill("user@example.com");
    await page.getByPlaceholder("Enter your password").fill("wrongpass");

    const loginRequest = page.waitForRequest(
      (req) =>
        req.url().includes("/api/admin/login") && req.method() === "POST",
    );

    await page.getByPlaceholder("Enter your email").press("Enter");

    await expect(await loginRequest).toBeTruthy();
  });

  test("pressing Enter on the password field triggers a login attempt", async ({
    page,
  }) => {
    await page.getByPlaceholder("Enter your email").fill("user@example.com");
    await page.getByPlaceholder("Enter your password").fill("wrongpass");

    const loginRequest = page.waitForRequest(
      (req) =>
        req.url().includes("/api/admin/login") && req.method() === "POST",
    );

    await page.getByPlaceholder("Enter your password").press("Enter");

    await expect(await loginRequest).toBeTruthy();
  });
});
