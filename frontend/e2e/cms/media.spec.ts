import { test, expect, type Page } from "@playwright/test";
import { mockAdminSession } from "../helpers/cms-auth";

const MOCK_MEDIA = {
  items: [
    {
      key: "menu/pho-bowl.jpg",
      url: "https://example.com/menu/pho-bowl.jpg",
      size: 204800,
      lastModified: "2024-06-01T12:00:00Z",
    },
    {
      key: "hero/banner.png",
      url: "https://example.com/hero/banner.png",
      size: 512000,
      lastModified: "2024-05-15T08:00:00Z",
    },
    {
      key: "about/team.jpg",
      url: "https://example.com/about/team.jpg",
      size: 102400,
      lastModified: "2024-04-20T10:00:00Z",
    },
  ],
};

const UPLOAD_ROUTE = /\/api\/upload(?:\?.*)?$/;

async function setupMediaPage(page: Page) {
  await mockAdminSession(page);

  await page.route(UPLOAD_ROUTE, (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_MEDIA),
      });
    }
  
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "{}",
    });
  });

  await page.goto("/cms/media");

  await expect(
    page.getByRole("heading", { name: /media library/i }),
  ).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("select").last()).toHaveValue("all");

  await expect(page.getByText("pho-bowl.jpg")).toBeVisible({ timeout: 10_000 });
}



test.describe("CMS Media page — upload section", () => {
  test.beforeEach(async ({ page }) => setupMediaPage(page));

  test("upload panel is visible", async ({ page }) => {
    await expect(page.getByText("Upload Image")).toBeVisible();
  });

  test("section selector shows all four sections", async ({ page }) => {
    const selects = page.locator("select");
    
    const uploadSelect = selects.first();
    await expect(
      uploadSelect.locator("option", { hasText: "Menu" }),
    ).toBeAttached();
    await expect(
      uploadSelect.locator("option", { hasText: "Hero" }),
    ).toBeAttached();
    await expect(
      uploadSelect.locator("option", { hasText: "About" }),
    ).toBeAttached();
    await expect(
      uploadSelect.locator("option", { hasText: "Brand" }),
    ).toBeAttached();
  });

  test("'Choose File' button is enabled by default", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /choose file/i }),
    ).toBeEnabled();
  });

  test("file type hint text is present", async ({ page }) => {
    await expect(page.getByText(/jpeg.*png.*webp/i)).toBeVisible();
  });
});



test.describe("CMS Media page — media grid", () => {
  test.beforeEach(async ({ page }) => setupMediaPage(page));

  test("mocked images are listed with their filenames", async ({ page }) => {
    await expect(page.getByText("pho-bowl.jpg")).toBeVisible();
    await expect(page.getByText("banner.png")).toBeVisible();
    await expect(page.getByText("team.jpg")).toBeVisible();
  });

  test("file count badge reflects the number of items", async ({ page }) => {
    await expect(page.getByText("3 files")).toBeVisible();
  });
});



test.describe("CMS Media page — section filter", () => {
  test.beforeEach(async ({ page }) => setupMediaPage(page));

  test("'All Sections' is the default filter value", async ({ page }) => {
    const filterSelect = page.locator("select").last();
    await expect(filterSelect).toHaveValue("all");
  });

  test("section filter dropdown contains all expected options", async ({
    page,
  }) => {
    const filterSelect = page.locator("select").last();
    await expect(
      filterSelect.locator("option", { hasText: "All Sections" }),
    ).toBeAttached();
    for (const section of ["Menu", "Hero", "About", "Brand"]) {
      await expect(
        filterSelect.locator("option", { hasText: section }),
      ).toBeAttached();
    }
  });

  test("changing the filter re-fetches with the section param", async ({
    page,
  }) => {
  
    let capturedUrl = "";
    await page.route(UPLOAD_ROUTE, (route) => {
      capturedUrl = route.request().url();
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [] }),
      });
    });


    const requestPromise = page.waitForRequest(
      (req) => req.url().includes("section=menu"),
    );
    await page.locator("select").last().selectOption("menu");
    const req = await requestPromise;
    expect(req.url()).toContain("section=menu");
    expect(capturedUrl).toContain("section=menu");
  });
});



test.describe("CMS Media page — delete confirmation modal", () => {
  test.beforeEach(async ({ page }) => setupMediaPage(page));

  test("clicking 'Delete' on an item opens the confirmation modal", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: /delete/i })
      .first()
      .click();
    await expect(page.getByText("Delete image?")).toBeVisible();
  });

  test("confirmation modal shows the filename and file metadata", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: /delete/i })
      .first()
      .click();
   
    const modal = page.locator("div").filter({ hasText: "Delete image?" }).last();
    await expect(
      modal
        .getByText(/pho-bowl\.jpg|banner\.png|team\.jpg/)
        .first(),
    ).toBeVisible();
  });

  test("'Cancel' in the modal dismisses it without calling DELETE", async ({
    page,
  }) => {
    let deleteCalled = false;
    await page.route(UPLOAD_ROUTE, (route) => {
      if (route.request().method() === "DELETE") deleteCalled = true;
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    await page
      .getByRole("button", { name: /delete/i })
      .first()
      .click();
    await expect(page.getByText("Delete image?")).toBeVisible();

    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.getByText("Delete image?")).not.toBeVisible();
    expect(deleteCalled).toBe(false);
  });

  test("confirming delete calls the DELETE API and closes the modal", async ({
    page,
  }) => {
    let deleteCalled = false;
    await page.route(UPLOAD_ROUTE, (route) => {
      if (route.request().method() === "DELETE") {
        deleteCalled = true;
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "{}",
        });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_MEDIA),
      });
    });

    await page
      .getByRole("button", { name: /delete/i })
      .first()
      .click();
    await expect(page.getByText("Delete image?")).toBeVisible();


    const modal = page.locator("div").filter({ hasText: "Delete image?" }).last();
    await modal
      .getByRole("button", { name: /^delete$/i })
      .or(modal.locator("button.bg-red-600"))
      .click();

    expect(deleteCalled).toBe(true);
    await expect(page.getByText("Delete image?")).not.toBeVisible({
      timeout: 5_000,
    });
  });
});
