import { test, expect, type Page } from "@playwright/test";
import { mockAdminSession } from "../helpers/cms-auth";



const MOCK_USERS = {
  adminUsers: [
    {
      id: 1,
      email: "admin@pho-city.com",
      role: "admin",
      created_at: "2024-01-15T10:00:00Z",
    },
    {
      id: 2,
      email: "editor@pho-city.com",
      role: "editor",
      created_at: "2024-03-01T09:00:00Z",
    },
  ],
};

async function setupUsersPage(page: Page) {
  await mockAdminSession(page);


  await page.route(/\/api\/adminUsers(?:\/[^/?#]+)?(?:\?.*)?$/, (route) => {
    const method = route.request().method();
    if (method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_USERS),
      });
    }
    if (method === "POST") {
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          adminUser: {
            id: 99,
            email: "newuser@pho-city.com",
            role: "admin",
            created_at: new Date().toISOString(),
          },
        }),
      });
    }
    // PUT (change password) or DELETE
    return route.fulfill({
      status: method === "DELETE" ? 204 : 200,
      contentType: "application/json",
      body: "{}",
    });
  });

  await page.goto("/cms/users");
  await expect(page.getByText("User Management")).toBeVisible({
    timeout: 10_000,
  });
}



test.describe("CMS Users page — user list", () => {
  test.beforeEach(async ({ page }) => setupUsersPage(page));

  test("'User Management' heading is visible", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /user management/i }).or(
        page.getByText("User Management"),
      ),
    ).toBeVisible();
  });

  test("mocked users appear in the list", async ({ page }) => {
    await expect(page.getByRole("cell", { name: "admin@pho-city.com" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "editor@pho-city.com" })).toBeVisible();
  });

  test("role badges are displayed correctly (Admin / Editor)", async ({
    page,
  }) => {
    await expect(page.getByText("Admin").first()).toBeVisible();
    await expect(page.getByText("Editor").first()).toBeVisible();
  });

  test("creation dates are rendered in a human-readable format", async ({
    page,
  }) => {
    await expect(page.getByRole("cell", { name: /jan 15, 2024/i })).toBeVisible();
  });
});



test.describe("CMS Users page — Add User modal", () => {
  test.beforeEach(async ({ page }) => setupUsersPage(page));

  test("'Add User' button opens the modal", async ({ page }) => {
    await page.getByRole("button", { name: /add user/i }).click();
    await expect(page.getByText("Add New User")).toBeVisible();
  });

  test("modal contains Email, Password, and Role fields", async ({ page }) => {
    await page.getByRole("button", { name: /add user/i }).click();
    await expect(page.getByPlaceholder("user@example.com")).toBeVisible();
    await expect(
      page.locator('input[type="password"]').first(),
    ).toBeVisible();
    await expect(
      page.locator("select").filter({ hasText: /admin|editor/i }),
    ).toBeVisible();
  });

  test("role selector offers Admin and Editor options", async ({ page }) => {
    await page.getByRole("button", { name: /add user/i }).click();
    const roleSelect = page
      .locator("select")
      .filter({ hasText: /admin|editor/i });
    await expect(
      roleSelect.locator("option", { hasText: "Admin" }),
    ).toBeAttached();
    await expect(
      roleSelect.locator("option", { hasText: "Editor" }),
    ).toBeAttached();
  });

  test("'Cancel' button closes the modal without creating a user", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /add user/i }).click();
    await expect(page.getByRole("heading", { name: "Add New User" })).toBeVisible();
    await page.getByRole("heading", { name: "Add New User" }).locator("xpath=ancestor::div[contains(@class,'relative')][1]").getByRole("button", { name: /^cancel$/i }).click({ noWaitAfter: true });
    await expect(page.getByText("Add New User")).not.toBeVisible();
  });

  test("submitting the form calls POST /api/adminUsers and adds the user", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /add user/i }).click();

    await page.getByPlaceholder("user@example.com").fill("newuser@pho-city.com");
    await page.locator('input[type="password"]').first().fill("Password123!");
    // Role defaults to admin — no change needed.

    await page.getByRole("button", { name: /create user/i }).click();

    // Modal closes and the new user appears in the list.
    await expect(page.getByText("Add New User")).not.toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByRole("cell", { name: "newuser@pho-city.com" })).toBeVisible({
      timeout: 5_000,
    });
  });
});



test.describe("CMS Users page — Change Password modal", () => {
  test.beforeEach(async ({ page }) => setupUsersPage(page));

  test("'Password' button opens the change-password modal", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: /password/i })
      .first()
      .click();
    await expect(
      page.getByText(/change password/i),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("modal shows the target user's email in the title", async ({ page }) => {
    await page
      .getByRole("button", { name: /password/i })
      .first()
      .click();
    await expect(
      page.getByRole("heading", { name: /change password.*admin@pho-city\.com/i }),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("submitting mismatched passwords shows an error", async ({ page }) => {
    await page
      .getByRole("button", { name: /password/i })
      .first()
      .click();

    const pwInputs = page.locator('input[type="password"]');
    await pwInputs.nth(0).fill("newpassword1");
    await pwInputs.nth(1).fill("newpassword2");
    await page.getByRole("button", { name: /update password/i }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });

  test("valid submission shows success message", async ({ page }) => {
    await page
      .getByRole("button", { name: /password/i })
      .first()
      .click();

    const pwInputs = page.locator('input[type="password"]');
    await pwInputs.nth(0).fill("ValidPass123!");
    await pwInputs.nth(1).fill("ValidPass123!");
    await page.getByRole("button", { name: /update password/i }).click();

    await expect(page.getByText("Password updated!")).toBeVisible({
      timeout: 5_000,
    });
  });
});



test.describe("CMS Users page — Delete modal", () => {
  test.beforeEach(async ({ page }) => setupUsersPage(page));

  test("'Delete' button opens the confirmation modal", async ({ page }) => {
    await page
      .getByRole("button", { name: /delete/i })
      .first()
      .click();
    await expect(page.getByText("Delete Admin Account")).toBeVisible();
  });

  test("confirmation modal warns the action is irreversible", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: /delete/i })
      .first()
      .click();
    await expect(
      page.getByText("This action cannot be undone."),
    ).toBeVisible();
  });

  test("confirmation modal names the user being deleted", async ({ page }) => {
    await page
      .getByRole("button", { name: /delete/i })
      .first()
      .click();
    
    await expect(page.getByText("admin@pho-city.com").last()).toBeVisible();
  });

  test("'Cancel' closes the modal without deleting", async ({ page }) => {
    let deleteCalled = false;
    await page.route(/\/api\/adminUsers(?:\/[^/?#]+)?(?:\?.*)?$/, (route) => {
      if (route.request().method() === "DELETE") deleteCalled = true;
      route.fulfill({ status: 204, body: "" });
    });

    await page
      .getByRole("button", { name: /delete/i })
      .first()
      .click();
    await page.getByRole("button", { name: /cancel/i }).click();

    await expect(page.getByText("Delete Admin Account")).not.toBeVisible();
    expect(deleteCalled).toBe(false);
  });

  test("confirming delete calls DELETE API and removes the user from the list", async ({
    page,
  }) => {
    let deleteCalled = false;
    await page.route(/\/api\/adminUsers(?:\/[^/?#]+)?(?:\?.*)?$/, (route) => {
      if (route.request().method() === "DELETE") {
        deleteCalled = true;
        return route.fulfill({ status: 204, body: "" });
      }
      return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    await page
      .getByRole("button", { name: /delete/i })
      .first()
      .click();
    await page
      .getByRole("button", { name: /yes, delete account/i })
      .click();

    expect(deleteCalled).toBe(true);
    await expect(page.getByRole("cell", { name: "admin@pho-city.com" })).not.toBeVisible({
      timeout: 5_000,
    });
  });
});
