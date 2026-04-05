import { test, expect } from "@playwright/test";



test.describe("Menu page — desktop sidebar", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/menu");
  });

  test("sidebar panel is visible with 'Categories' heading", async ({
    page,
  }) => {
    const sidebar = page.locator("aside").filter({ hasText: "Categories" });
    await expect(sidebar).toBeVisible();
  });

  test("clicking a sidebar category button does not crash the page", async ({
    page,
  }) => {
    const sidebar = page.locator("aside").filter({ hasText: "Categories" });
    const firstBtn = sidebar.locator("button").first();


    if ((await firstBtn.count()) > 0) {
      await firstBtn.click();
   
      await expect(page.locator("#root")).toBeAttached();
    }
  });

  test("each visible category has a matching content section in the main area", async ({
    page,
  }) => {
    const sidebar = page.locator("aside").filter({ hasText: "Categories" });
    const categoryBtns = sidebar.locator("button");
    const count = await categoryBtns.count();

    for (let i = 0; i < count; i++) {
      const label = (await categoryBtns.nth(i).textContent())?.trim() ?? "";
      if (!label) continue;
      const sectionId = label.toLowerCase().replace(/\s+/g, "-");
      await expect(page.locator(`[id="${sectionId}"]`)).toBeAttached();
    }
  });
});


test.describe("Menu page — mobile hamburger overlay", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/menu");
  });

  test("hamburger button is visible on mobile viewports", async ({ page }) => {
    await expect(page.getByLabel("Open category menu")).toBeVisible();
  });

  test("clicking the hamburger opens the category overlay", async ({
    page,
  }) => {
    await page.getByLabel("Open category menu").click();
    await expect(
      page.getByRole("dialog", { name: "Category menu" }),
    ).toBeVisible();
    await expect(
      page.getByRole("dialog").getByText("Categories"),
    ).toBeVisible();
  });

  test("close button inside the overlay dismisses it", async ({ page }) => {
    await page.getByLabel("Open category menu").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // The close button lives inside the slide-out panel.
    await page
      .getByRole("dialog")
      .locator('button[aria-label="Close category menu"]')
      .nth(1)
      .click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("clicking the backdrop dismisses the overlay", async ({ page }) => {
    await page.getByLabel("Open category menu").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page
      .getByRole("dialog")
      .locator('button[aria-label="Close category menu"]')
      .first()
      .click({ force: true });
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("pressing Escape closes the overlay", async ({ page }) => {
    await page.getByLabel("Open category menu").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("selecting a category from the overlay closes it", async ({ page }) => {
    await page.getByLabel("Open category menu").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const firstCategoryBtn = dialog.locator("nav button").first();
    if ((await firstCategoryBtn.count()) > 0) {
      await firstCategoryBtn.click();
      await expect(page.getByRole("dialog")).not.toBeVisible();
    }
  });

  test("body scroll is locked while overlay is open", async ({ page }) => {
    await page.getByLabel("Open category menu").click();
    const overflow = await page.evaluate(
      () => document.body.style.overflow,
    );
    expect(overflow).toBe("hidden");
  });

  test("body scroll is restored after overlay is closed", async ({ page }) => {
    await page.getByLabel("Open category menu").click();
    await page.keyboard.press("Escape");
    const overflow = await page.evaluate(
      () => document.body.style.overflow,
    );
    expect(overflow).not.toBe("hidden");
  });
});


test.describe("Menu page — PDF download", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/menu");
  });

  test("PDF download link is visible", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /download pdf menu/i }),
    ).toBeVisible();
  });

  test("PDF link points to the correct API endpoint", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /download pdf menu/i }),
    ).toHaveAttribute("href", "/api/menu/pdf");
  });

  test("PDF link carries the download attribute with correct filename", async ({
    page,
  }) => {
    await expect(
      page.getByRole("link", { name: /download pdf menu/i }),
    ).toHaveAttribute("download", "pho-city-menu.pdf");
  });
});
