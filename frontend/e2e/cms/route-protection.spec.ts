import { test, expect } from "@playwright/test";
import { mockAdminSession } from "../helpers/cms-auth";



test.describe("Unauthenticated access — redirects to /adminlogin", () => {

  const protectedRoutes = [
    "/cms/dashboard",
    "/cms/menu",
    "/cms/media",
    "/cms/users",
    "/cms/messages",
    "/cms/content",
    "/cms/settings",
  ];

  for (const route of protectedRoutes) {
    test(`${route} redirects unauthenticated users`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL("/adminlogin", { timeout: 12_000 });
    });
  }
});


test.describe("Expired session — redirects to /adminlogin", () => {
  test("verify returning 401 causes redirect to /adminlogin", async ({
    page,
  }) => {

    await page.route(/\/api\/auth\/verify/, (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, error: "Unauthorized" }),
      }),
    );

    await page.goto("/cms/dashboard");
    await expect(page).toHaveURL("/adminlogin", { timeout: 12_000 });
  });
});


test.describe("Logout flow", () => {
  async function openProfileMenu(page: import("@playwright/test").Page) {
    const profileTrigger = page
      .getByRole("button", { name: "HT" })
      .or(page.locator('button:has(svg[data-lucide="settings"])').first());
    await profileTrigger.first().click();
  }

  test.beforeEach(async ({ page }) => {

    await mockAdminSession(page);

    await page.route(/\/api\/admin\/logout/, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
    );

    await page.route(/\/api\/menu\/admin/, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ menu: { categories: [] } }),
      }),
    );
    await page.goto("/cms/dashboard");

    await expect(page).toHaveURL("/cms/dashboard", { timeout: 10_000 });
  });

  test("logout button is reachable via the settings dropdown", async ({
    page,
  }) => {
    await openProfileMenu(page);

    await expect(page.getByRole("button", { name: /logout/i })).toBeVisible({
      timeout: 5_000,
    });
  });

  test("clicking Logout navigates to /adminlogin", async ({ page }) => {
    await openProfileMenu(page);
    await page.getByRole("button", { name: /logout/i }).click();
    await expect(page).toHaveURL("/adminlogin", { timeout: 10_000 });
  });

  test("after logout, navigating to a CMS route redirects back to /adminlogin", async ({
    page,
  }) => {
    await openProfileMenu(page);
    await page.getByRole("button", { name: /logout/i }).click();
    await expect(page).toHaveURL("/adminlogin", { timeout: 10_000 });

    await page.unroute(/\/api\/auth\/verify/);
    await page.unroute(/\/api\/admin\/verify/);


    await page.goto("/cms/dashboard");
    await expect(page).toHaveURL("/adminlogin", { timeout: 12_000 });
  });
});
