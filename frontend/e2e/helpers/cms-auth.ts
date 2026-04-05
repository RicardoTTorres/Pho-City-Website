import type { Page } from "@playwright/test";



export async function mockAdminSession(page: Page): Promise<void> {
  await page.route(/\/api\/auth\/verify/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    }),
  );
  await page.route(/\/api\/admin\/verify/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    }),
  );
}
