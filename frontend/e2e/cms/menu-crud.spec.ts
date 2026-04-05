import { test, expect, type Page } from "@playwright/test";
import { mockAdminSession } from "../helpers/cms-auth";


const MOCK_MENU = {
  menu: {
    categories: [
      {
        id: "1",
        name: "Soups",
        items: [
          {
            id: "101",
            name: "Pho Bo",
            description: "Beef noodle soup",
            price: "12.99",
            visible: true,
            featured: false,
            featuredPosition: null,
            popular: true,
            image: null,
          },
          {
            id: "102",
            name: "Bun Bo Hue",
            description: "Spicy beef noodle",
            price: "13.50",
            visible: false,
            featured: false,
            featuredPosition: null,
            popular: false,
            image: null,
          },
        ],
      },
      {
        id: "2",
        name: "Appetizers",
        items: [
          {
            id: "201",
            name: "Spring Rolls",
            description: "Fresh vegetable spring rolls",
            price: "6.99",
            visible: true,
            featured: false,
            featuredPosition: null,
            popular: false,
            image: null,
          },
        ],
      },
    ],
  },
};

async function setupMenuPage(page: Page) {
  await mockAdminSession(page);

  await page.route(/\/api\/menu\/admin(?:\?.*)?$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_MENU),
    }),
  );

  // Stub mutating endpoints so UI interactions complete without errors.
  await page.route(/\/api\/menu\/items(?:\/[^/?#]+)?(?:\?.*)?$/, (route) => {
    const method = route.request().method();
    if (method === "POST") {
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ item: { id: "999", name: "New Item" } }),
      });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  await page.route(/\/api\/menu\/categories(?:\/[^/?#]+)?(?:\?.*)?$/, (route) => {
    const method = route.request().method();
    if (method === "POST") {
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ category: { id: "99", name: "New Category" } }),
      });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  await page.goto("/cms/menu");
  await expect(page.getByText("Menu Management")).toBeVisible({ timeout: 10_000 });
}


test.describe("CMS Menu page — structure", () => {
  test("renders the Menu Management heading", async ({ page }) => {
    await setupMenuPage(page);
    await expect(
      page.getByRole("heading", { name: /menu management/i }),
    ).toBeVisible();
  });

  test("shows the three editor tabs: Menu Items, Categories, Customizations", async ({
    page,
  }) => {
    await setupMenuPage(page);
    await expect(page.getByRole("button", { name: "Menu Items" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Categories" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Customizations" }),
    ).toBeVisible();
  });
});


test.describe("CMS Menu page — Items tab", () => {
  test.beforeEach(async ({ page }) => {
    await setupMenuPage(page);
  });

  test("mocked items are listed", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Pho Bo" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Bun Bo Hue" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Spring Rolls" })).toBeVisible();
  });

  test("visible item shows 'Visible' badge, hidden item shows 'Hidden'", async ({
    page,
  }) => {
    await expect(
      page.getByRole("button", { name: "Toggle visibility for Pho Bo" }).getByText("Visible"),
    ).toBeVisible();
    await expect(
      page
        .getByRole("button", { name: "Toggle visibility for Bun Bo Hue" })
        .getByText("Hidden"),
    ).toBeVisible();
  });

  test("visibility toggle button exists for each item", async ({ page }) => {
    await expect(
      page.getByLabel("Toggle visibility for Pho Bo"),
    ).toBeVisible();
    await expect(
      page.getByLabel("Toggle visibility for Bun Bo Hue"),
    ).toBeVisible();
  });

  test("'Add Item' button opens the item modal", async ({ page }) => {
    await page.getByRole("button", { name: /add item/i }).click();

    await expect(page.getByRole("heading", { name: /add menu item/i })).toBeVisible({
      timeout: 5_000,
    });
  });

  test("'Edit' button on an item opens the item modal with pre-filled data", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /edit/i }).first().click();

    await expect(page.locator('input[value="Pho Bo"]')).toBeVisible({ timeout: 5_000 });
  });

  test("category filter dropdown contains all category names", async ({
    page,
  }) => {
    const select = page
      .locator("select")
      .filter({ hasText: /all categories/i });
    await expect(select).toBeVisible();
    await expect(select.locator("option", { hasText: "Soups" })).toBeAttached();
    await expect(
      select.locator("option", { hasText: "Appetizers" }),
    ).toBeAttached();
  });

  test("selecting a category filter shows only items from that category", async ({
    page,
  }) => {
    const select = page
      .locator("select")
      .filter({ hasText: /all categories/i });

    await select.selectOption({ label: "Soups" });

    await expect(page.getByRole("heading", { name: "Pho Bo" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Bun Bo Hue" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Spring Rolls" })).not.toBeVisible();
  });
});



test.describe("CMS Menu page — search filter", () => {
  test("typing in the header search narrows the item list", async ({ page }) => {
    await setupMenuPage(page);


    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill("pho");

    await expect(page.getByRole("heading", { name: "Pho Bo" })).toBeVisible();
    // Items that don't match "pho" should be hidden.
    await expect(page.getByRole("heading", { name: "Spring Rolls" })).not.toBeVisible();
  });

  test("clearing the search restores all items", async ({ page }) => {
    await setupMenuPage(page);

    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill("pho");
    await searchInput.clear();

    await expect(page.getByRole("heading", { name: "Spring Rolls" })).toBeVisible();
  });
});



test.describe("CMS Menu page — Categories tab", () => {
  test.beforeEach(async ({ page }) => {
    await setupMenuPage(page);
    await page.getByRole("button", { name: "Categories" }).click();
  });

  test("mocked categories are listed", async ({ page }) => {
    await expect(page.getByText("Soups")).toBeVisible();
    await expect(page.getByText("Appetizers")).toBeVisible();
  });

  test("'Add Category' button opens the category modal", async ({ page }) => {
    await page.getByRole("button", { name: /add category/i }).click();
    await expect(page.getByRole("heading", { name: /add category/i })).toBeVisible({
      timeout: 5_000,
    });
  });

  test("'Edit' button opens the category modal with pre-filled name", async ({
    page,
  }) => {
    const soupsRow = page
      .getByRole("heading", { name: "Soups" })
      .locator("..")
      .locator("..");
    await soupsRow.getByRole("button", { name: /edit/i }).click();
    // Modal should have the existing category name pre-filled.
    const nameInput = page.locator('input[value="Soups"]');
    await expect(nameInput).toBeVisible({ timeout: 5_000 });
  });

  test("'Delete' button triggers window.confirm and calls delete API on confirm", async ({
    page,
  }) => {
    // Accept the confirm dialog automatically.
    page.on("dialog", (dialog) => dialog.accept());

    let deleteCalled = false;
    await page.route(/\/api\/menu\/categories(?:\/[^/?#]+)?(?:\?.*)?$/, (route) => {
      if (route.request().method() === "DELETE") deleteCalled = true;
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    const soupsRow = page
      .getByRole("heading", { name: "Soups" })
      .locator("..")
      .locator("..");
    await soupsRow.getByRole("button", { name: /delete/i }).click();

    expect(deleteCalled).toBe(true);
  });
});
