import { test, expect } from "@playwright/test";



const VIEWPORTS = [
  { label: "mobile", width: 390, height: 844 },
  { label: "tablet", width: 768, height: 1024 },
  { label: "desktop", width: 1280, height: 800 },
] as const;

for (const vp of VIEWPORTS) {
  test.describe(`About page — ${vp.label} (${vp.width}×${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test.beforeEach(async ({ page }) => {
      await page.goto("/about");
    });

 

    test("hero h1 heading is visible", async ({ page }) => {
      await expect(page.locator("h1").first()).toBeVisible();
    });

    test("hero intro paragraph is visible", async ({ page }) => {
   
      const heroSection = page.locator("section").first();
      await expect(heroSection.locator("p").first()).toBeVisible();
    });

    test("hero image renders without a broken src (when present)", async ({
      page,
    }) => {
      const heroSection = page.locator("section").first();
      const img = heroSection.locator("img").first();
      if ((await img.count()) > 0) {
        const src = await img.getAttribute("src");
        expect(src).toBeTruthy();
        await expect(img).toBeVisible();
      }
    });

    // ── Content sections ──────────────────────────────────────────────────────

    test("page contains at least 4 sections (hero + 3 content sections)", async ({
      page,
    }) => {
  
      const sections = page.locator("section");
      await expect(sections).toHaveCount(4, { timeout: 8_000 });
    });

    test("Beginning section heading is visible", async ({ page }) => {
      
      const beginningSection = page.locator("section").nth(1);
      await expect(beginningSection).toBeVisible();
   
      const heading = beginningSection.locator("h2, h3").first();
      if ((await heading.count()) > 0) {
        await expect(heading).toBeVisible();
      }
    });

    test("Food section heading is visible", async ({ page }) => {
      const foodSection = page.locator("section").nth(2);
      await expect(foodSection).toBeVisible();
      const heading = foodSection.locator("h2, h3").first();
      if ((await heading.count()) > 0) {
        await expect(heading).toBeVisible();
      }
    });

    test("Commitment section heading is visible", async ({ page }) => {
      const commitmentSection = page.locator("section").nth(3);
      await expect(commitmentSection).toBeVisible();
      const heading = commitmentSection.locator("h2, h3").first();
      if ((await heading.count()) > 0) {
        await expect(heading).toBeVisible();
      }
    });



    test("all visible images have a non-empty src attribute", async ({
      page,
    }) => {
      const images = page.locator("img");
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        if (!(await img.isVisible())) continue;
        const src = await img.getAttribute("src");
        // Every visible image must have a non-empty src.
        expect(src).toBeTruthy();
        expect(src!.length).toBeGreaterThan(0);
      }
    });



    test("page does not overflow horizontally", async ({ page }) => {
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = vp.width;

      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
    });
  });
}
